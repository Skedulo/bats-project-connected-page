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
  id?: string
  tempId?: string
  constraintType: string
  dependencyType: string
  dependentJob?: IBaseModel | null
  dependentJobId?: string
  error?: string
  action?: string
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
  duration: number
  startTimeString?: string,
  endTimeString?: string,
  travelTime: number
}

export declare type JobItem = IJobDetail | IJobTemplate
