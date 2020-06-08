import { IBaseModel } from './common'

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

export interface IJobAllocation {
  id: string
  name: string
  travelTime: string
  resource: IBaseModel
}

export interface IJobConstraint {
  id: string
  dependencyType: string
  dependentJob: IBaseModel
}

export declare type JobStatusKey = keyof typeof JobStatusColor

export interface IJobTemplate {
  id?: string
  name: string
  description: string
  jobType: string
  jobConstraints: IJobConstraint[]
  project: IBaseModel
  projectId?: string
  resourceRequirement?: number
}

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
  jobConstraints: IJobConstraint[]
  project: IBaseModel
  projectId?: string
  resourceRequirement?: number
}

export declare type JobItem = IJobDetail | IJobTemplate
