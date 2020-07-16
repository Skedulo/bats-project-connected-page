import { pick } from 'lodash'
import { Dispatch } from 'redux'

import { Services } from '../Services/Services'
import { updateAvailabilityQuery } from './inputQueries'
import { Availability, State } from '../Store/types'
import {
  makeActionsSet,
  makeReducers,
  makeAsyncActionCreatorSimp,
  makeActionCreator } from '../common/utils/redux-helpers'
import { getAvailabilities } from '../Store/reducers/availabilities'
import { pushNotification } from '../Services/DataServices'
import { toastMessage } from '../common/utils/toast'
import { format } from 'date-fns-tz'
import { DATE_FORMAT } from '../common/constants'
import { getResources } from '../Store/reducers/fetch'

export type UID = string

interface AvailabilityUpdateResp { schema: { updateAvailabilities: UID }}

const UPDATE_AVAILABILITY = makeActionsSet('UPDATE_AVAILABILITY')

const STATUS_MESSAGES = {
  Approved: 'approved',
  Declined: 'declined',
  Pending: 'recalled',
}

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
      dispatch(getResources())
      dispatch(getAvailabilities())
      if (updateAvailabilities) {
        const startDate = format(new Date(updateInput.Start), DATE_FORMAT, { timeZone: store.region?.timezoneSid })
        const message = `Your leave request on ${startDate} has been ${STATUS_MESSAGES[updateInput.Status]}`
        await pushNotification(updateInput.Resource.UID, message)
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
