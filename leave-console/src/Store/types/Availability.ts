import { Resource, IResource } from './Resource'

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Declined'

export interface Availability {
  // [key: string]: any
  UID: string
  Start: string
  Finish: string
  Name: string
  Type: string
  Resource: Resource
  CreatedDate: string
  Status: AvailabilityStatus
  Exceptions: number
}

export type AvailabilityKey = keyof Availability

export interface AvailabilityChartData {
  date: Date
  resourcesCount: number
  resources: IResource[]
}

export interface AvailabilityRecord {
  description: string
  end: string
  name: string
  patternId: string
  patternResourceId: string
  patternType: string
  start: string
  type: string
}

export interface IResourceAvailability {
  available: {
    start: string,
    end: string
  }[]
  availability: {
    records: AvailabilityRecord[][]
  }
}
