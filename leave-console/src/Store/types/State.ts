import {
  Avatars,
  Filter,
  Resource,
  TimeRange
} from '.'
import { UnavailabilityTableItem } from './UnavailabilityTableItem'

export interface State {
  [key: string]: any
  availabilities?: UnavailabilityTableItem[]
  avatars?: Avatars
  busy: boolean
  busyCnt: string[]
  filters: Filter[]
  resources?: Resource[]
  subscriptionStatus?: string
  timeRange: TimeRange
}
