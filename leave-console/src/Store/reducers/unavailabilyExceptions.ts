import {
  makeReducers,
  makeActionsSet,
  makeAsyncActionCreatorSimp
} from '../../common/utils/redux-helpers'

import { fetchUnavailabilityExceptions } from '../../Services/DataServices'

const UNAVAILABILITY_EXCEPTIONS_GET = makeActionsSet('UNAVAILABILITY_EXCEPTIONS_GET')

export const getUnavailabilityExceptions = makeAsyncActionCreatorSimp(UNAVAILABILITY_EXCEPTIONS_GET, (
  unavailabilityId: string,
  resourceName: string,
  annualLeaveRemaining: number
) => async () => {
  const resp = await fetchUnavailabilityExceptions(unavailabilityId, resourceName, annualLeaveRemaining)
  return { unavailabilityExceptions: resp }
})

const unavailabilityExceptionsReducers = {
  ...makeReducers(UNAVAILABILITY_EXCEPTIONS_GET, { dataField: 'unavailabilityExceptions' })
}

export default unavailabilityExceptionsReducers
