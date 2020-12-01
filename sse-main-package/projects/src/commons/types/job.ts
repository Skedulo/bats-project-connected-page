import { IBaseModel, ITag } from './common'
import { BaseOptions } from 'vm'

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
  plannedTravelTime: number
}

export enum JobDependencyType {
  AFTER_THE_END_OF = 'after the end of',
  AFTER_THE_START_OF = 'after the start of',
  WITHIN = 'within',
  AT_LEAST = 'at least',
  BETWEEN = 'between'
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

export interface IJobDependency {
  id?: string
  projectJobTemplateId: string
  fromJobTemplateId?: string,
  toJobTemplateId?: string,
  fromAnchor?: string,
  toAnchor?: string,
  toAnchorMinOffsetMins?: number | null,
  toAnchorMaxOffsetMins?: number | null,
  fromJobTemplate?: IBaseModel
  toJobTemplate?: IBaseModel
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
  resource?: IBaseModel
  fromProjectJobDependencies?: IJobDependency[]
  toProjectJobDependencies?: IJobDependency[]
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
  plannedTravelTime?: number
  region: IBaseModel
  timezoneSid: string
  tags?: ITag[]
}

export interface IJobSuggestion {
  duration: number,
  start: string,
  travelTime: number
  jobId: string
  startTime: number
  endTime: number
  startTimeString: string
  startDate: string
}

export interface IJobTime {
  id: string
  startDate: string
  startTime: number
  duration: number
  timezoneSid: string
}

export enum ResourceSortType {
  BestFit = 'bestFit',
  Name = 'name',
  Rating = 'rating',
  Tags = 'tags',
  TravelDistanceFromHome = 'travelDistanceFromHome',
  TravelDurationFromHome = 'travelDurationFromHome',
  Utilised = 'utilized'
}
