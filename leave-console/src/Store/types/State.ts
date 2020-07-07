import {
  Avatars,
  Filter,
  Resource,
  TimeRange
} from '.'
import { UnavailabilityTableItem } from './UnavailabilityTableItem'
import { IConfig, IRegion, IResource } from './ResourceRequirementRule'
import { IResourceAvailability } from './Availability'

export interface State {
  [key: string]: any
  unavailabilities?: UnavailabilityTableItem[]
  availabilities?: Record<string, IResourceAvailability>
  avatars?: Avatars
  busy: boolean
  busyCnt: string[]
  filters: Filter[]
  resources?: IResource[]
  subscriptionStatus?: string
  timeRange: TimeRange
  configs?: IConfig
  region: IRegion
}
