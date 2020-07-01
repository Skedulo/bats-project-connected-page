import { Resource } from './Resource'

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Declined'

export interface Availability {
  [key: string]: any
  UID: string
  Start: string
  Finish: string
  Name: string
  Type: string
  Resource: Resource
  CreatedDate: string
  Status: AvailabilityStatus
}
