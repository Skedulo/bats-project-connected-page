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
  resource: {
    id: string
    name: string
  }
}

export declare type JobStatusKey = JobStatus.Queued
| JobStatus.PendingAllocation
| JobStatus.PendingDispatch
| JobStatus.Dispatched
| JobStatus.Ready
| JobStatus.EnRoute
| JobStatus.OnSite
| JobStatus.InProgress
| JobStatus.Complete
| JobStatus.Cancelled

export interface IJobDetail {
  id: string
  name: string
  description: string
  startDate: string
  startTime: number
  endDate: string
  endTime: number
  jobType: string
  status: JobStatus
  allocations: IJobAllocation[]
  projectId?: string
}
