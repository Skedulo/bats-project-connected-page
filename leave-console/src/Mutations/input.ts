import { pick, get } from 'lodash'
import { Dispatch } from 'redux'
import PhoneNumber from 'awesome-phonenumber'
import { Services } from '../Services/Services'
import { updateAvailabilityQuery } from './inputQueries'
import { Availability, State, IResource } from '../Store/types'
import {
  makeActionsSet,
  makeReducers,
  makeAsyncActionCreatorSimp
} from '../common/utils/redux-helpers'
import { getAvailabilities } from '../Store/reducers/availabilities'
import { pushNotification, sendSMS } from '../Services/DataServices'
import { toastMessage } from '../common/utils/toast'
import { format, utcToZonedTime } from 'date-fns-tz'
import { DATE_FORMAT, MESSAGE_VARIABLES, LONG_DATE_FORMAT } from '../common/constants'
import { getResources } from '../Store/reducers/fetch'

export type UID = string

interface AvailabilityUpdateResp { schema: { updateAvailabilities: UID }}

const UPDATE_AVAILABILITY = makeActionsSet('UPDATE_AVAILABILITY')

const STATUS_MESSAGES = {
  Approved: 'approved',
  Declined: 'declined',
  Pending: 'recalled',
}

const DEFAULT_NOTIFICATION = 'Your <Unavailability Type> for <Start Date> to <Finish Date> has been <Request Status>. You have <Total Days Remaining> out of <Total Allowance in Days> holiday days remaining.'

export const updateAvailability = makeAsyncActionCreatorSimp(
  UPDATE_AVAILABILITY, (updateInput: Availability) =>
    async (dispatch: Dispatch, getState: () => State) => {
      const store = getState()
      const { schema: { updateAvailabilities } } = await Services.graphQL.mutate<AvailabilityUpdateResp>({
        query: updateAvailabilityQuery,
        variables: {
          updateInput: {
            UID: updateInput.UID,
            Status: updateInput.Status
          }
        }
      })
      await dispatch(getResources())
      dispatch(getAvailabilities())
      if (updateAvailabilities) {
        const resources = store.resources || [] as IResource[]
        const matchedResource = resources.find(item => item.id === updateInput.Resource.UID)
        const template = store.configs?.availabilityNotificationTemplate || DEFAULT_NOTIFICATION
        const unavailability = {
          ...updateInput,
          Start: format(utcToZonedTime(updateInput.Start, store.region?.timezoneSid), LONG_DATE_FORMAT),
          Finish: format(utcToZonedTime(updateInput.Finish, store.region?.timezoneSid), LONG_DATE_FORMAT),
          Resource: {
            ...updateInput.Resource,
            AnnualLeaveAllowance: matchedResource?.annualLeaveAllowance,
            AnnualLeaveRemaining: matchedResource?.annualLeaveRemaining,
          }
        }

        const message = template.replace(/<[^<>]+>/g, (key: string) => {
          const fieldKey = MESSAGE_VARIABLES.find(item => item.value === key)?.field || ''
          if (fieldKey) {
            return get(unavailability, fieldKey, '')
          }
          return ''
        })

        if (unavailability.Resource.NotificationType === 'sms' && unavailability.Resource.MobilePhone) {
          const phoneNumber = unavailability.Resource.MobilePhone
          const countryCode = unavailability.Resource.CountryCode || new PhoneNumber(phoneNumber).getRegionCode()
          await sendSMS(phoneNumber, countryCode, message)
        } else {
          await pushNotification(updateInput.Resource.UID, message)
        }

        return updateInput
      }
      toastMessage.error('Updated status failed!')
      return null
    }
)

const updateAvailabilityTransform = (newData: Partial<Availability>, store: State) => {
  if (newData) {
    const storedAvailabilityIndex = store.availabilities!.findIndex(availability => availability.UID === newData.UID)
    if (storedAvailabilityIndex < 0) {
      return store
    }

    return {
      ...store,
      availabilities: [
        store.availabilities!.slice(0, storedAvailabilityIndex),
        { ...store.availabilities![storedAvailabilityIndex], ...pick(newData, ['Status']) },
        store.availabilities!.slice(storedAvailabilityIndex + 1)
      ]
    }
  }
  return store
}

export const inputReducers = {
  ...makeReducers(UPDATE_AVAILABILITY, { transform: updateAvailabilityTransform })
}
