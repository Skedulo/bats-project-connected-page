export { AllResourcesQuery } from './AllResourcesQuery'
export { AllAvailabilitiesQuery } from './AllAvailabilitiesQuery'
export { JobsQuery } from './JobsQuery'
export { JobAllocationsQuery } from './JobsAllocationsQuery'

import { AvailabilityUpdate } from './SubAvailabilitiesUpdateQuery'

export const subscriptions: {[key: string]: string} = {
  AvailabilityUpdate,
}
