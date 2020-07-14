import { IBaseModel } from './common'

export interface Job {
  Name: string
  UID: string
  Start: string
  End: string
  Description: string
  Duration: number
  Timezone: string
  Account?: {
    Name: string
  }
  Contact?: {
    FullName: string
  }
  Type: string
  Address: string
  Region: {
    UID: string
    Name: string
  }
  JobAllocations: {
    UID: string
    Resource: {
      UID: string
      Name: string
      User: {
        UID: string,
        SmallPhotoUrl: string
      }
    }
  }[]
}

export interface IJobAllocation {
  id: string
  name: string
  travelTime: string
  resource: IBaseModel
  plannedTravelTime: number
}

export interface IJobDetail {
  id: string
  name: string
  startDate: string
  startTime: number
  endDate: string
  endTime: number
  jobType: string
  resourceRequirement?: number
  duration: number
  startTimeString?: string,
  endTimeString?: string,
  travelTime: number
  plannedTravelTime?: number
  region: IBaseModel
  timezoneSid: string
  allocations: IJobAllocation[]
}

export enum JobStatusColor {
  'Queued',
  'Pending Allocation',
  'Pending Dispatch',
  'Dispatched',
  'Ready',
  'En Route',
  'On Site',
  'In Progress',
  'Complete',
  'Cancelled',
}

export declare type JobStatusKey = keyof typeof JobStatusColor