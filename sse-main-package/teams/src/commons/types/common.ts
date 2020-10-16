import { BaseModel } from './BaseObject'
import { ISelectItem } from '@skedulo/sked-ui'

export interface PicklistItem {
  value: string
  label: string
  active: boolean
}

export interface Vocabulary {
  groups: PicklistItem[]
}

export interface RouterParams {
  processId: string
}

export interface PageParams {
  pageSize: number
  pageNumber: number
  searchText: string
  orderBy?: string
  offset?: number
}

export interface State {
  config: Config
  loading: boolean
  showResourceSidebar: boolean
  swimlaneSetting: SwimlaneSetting
  resources: Resource[]
}

export interface ObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface Tag extends BaseModel {
  required?: boolean
}

export interface Config extends OrgPreference {
  jobTypes?: BaseModel[],
  jobStatuses?: BaseModel[],
  projectStatuses?: BaseModel[],
  objPermissions?: {
    Project: BaseModel
    // ProjectJobTemplate: IObjPermission
  }
  jobTypeTemplates?: BaseModel[]
  constraintTypes?: BaseModel[]
  dependencyTypes?: BaseModel[]
  coreSkills?: BaseModel[]
}

export enum GenericOptionObjects {
  Account,
  Contact,
  sked__Region__c,
  sked__Location__c,
  sked__Resource__c
}

export declare type GenericObjectTypes = keyof typeof GenericOptionObjects

export interface GenericOptionParams {
  sObjectType: GenericObjectTypes
  name: string
  accountIds?: string
  regionIds?: string
}

export interface GenericSelectItem extends ISelectItem {
  account?: BaseModel
  contact?: BaseModel
  region?: BaseModel
  fieldName?: string
}

export interface ITimeOption {
  stringValue: string
  numberValue: number
  boundValue: number
}

export interface OrgPreference {
  enableWorkingHours?: boolean
}

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface WorkingHours {
  enabled?: boolean,
  startTime: number,
  endTime: number
  days: Record<WeekDay, boolean>
}

export interface SwimlaneSetting {
  workingHours: WorkingHours
}

export interface IUser {
  SmallPhotoUrl: string
}

export interface ResourceSuggestion {
  score: {
    soft: number
  }
  travel: {
    distanceFromHome: number
    durationFromHome: number
  }
  currentCapacityInSeconds: number
}

export interface Resource {
  id: string
  name: string
  rating?: number
  category?: string
  avatarUrl?: string
  suggestion?: ResourceSuggestion
  isSuggested: boolean
  tags?: BaseModel[]
}
