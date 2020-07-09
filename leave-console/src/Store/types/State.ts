import {
  Avatars,
  Filter,
  Resource,
  TimeRange,
  IConfig,
  IRegion,
  IResource
} from '.'
import { UnavailabilityTableItem } from './UnavailabilityTableItem'
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
