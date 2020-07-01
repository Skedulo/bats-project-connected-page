import { Availability } from './Availability'

export interface UnavailabilityTableItem extends Availability {
  conflicts: number
  conflictsByDay: Map<string, number>
  RequestedDays?: number
}
