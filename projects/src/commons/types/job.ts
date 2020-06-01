import { IBaseModel } from './common'

export enum JobStatus {
  Queued = 'Queued',
  PendingAllocation = 'Pending Allocation',
  PendingDispatch = 'Pending Dispatch',
  Dispatched = 'Dispatched',
  Ready = 'Ready',
  EnRoute = 'En Route',
  OnSite = 'On Site',
  InProgress = 'In Progress',
  Complete = 'Complete',
  Cancelled = 'Cancelled',
}

export interface IJobAllocation {
  id: string
  name: string
  travelTime: string
  resource: IBaseModel
}

export declare type JobStatusKey =
  | 'Queued'
  | 'Pending Allocation'
  | 'Pending Dispatch'
  | 'Dispatched'
  | 'Ready'
  | 'En Route'
  | 'On Site'
  | 'In Progress'
  | 'Complete'
  | 'Cancelled'

export interface IJobDetail {
  id: string
  name: string
  description: string
  startDate: string
  startTime: number
  endDate: string
  endTime: number
  jobType: string
  status: JobStatusKey
  allocations: IJobAllocation[]
  projectId?: string
}
