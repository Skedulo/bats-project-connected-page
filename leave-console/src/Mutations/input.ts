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

export type UID = string

interface AvailabilityUpdateResp { schema: { updateAvailabilities: UID }}

const UPDATE_AVAILABILITY = makeActionsSet('UPDATE_AVAILABILITY')

export const updateAvailability = makeAsyncActionCreatorSimp(
  UPDATE_AVAILABILITY, (updateInput: Availability) =>
    async (dispatch: Dispatch) => {
      const { schema: { updateAvailabilities } } = await Services.graphQL.mutate<AvailabilityUpdateResp>({
        query: updateAvailabilityQuery,
        variables: {
          updateInput
        }
      })
      dispatch(getAvailabilities())
      return updateAvailabilities ? updateInput : null
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
