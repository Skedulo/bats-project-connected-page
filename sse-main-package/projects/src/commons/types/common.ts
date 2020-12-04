import { ISelectItem } from '@skedulo/sked-ui'

export interface IObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface IAppContext {
  config: IConfig
  setAppConfig?: React.Dispatch<React.SetStateAction<IConfig>>
}

export interface IBaseModel {
  name: string
  id: string
}

export interface ITag extends IBaseModel {
  required?: boolean
}

export interface IConfig extends IOrgPreference {
  jobTypes?: IBaseModel[],
  jobStatuses?: IBaseModel[],
  projectStatuses?: IBaseModel[],
  objPermissions?: {
    Project: IObjPermission
    // ProjectJobTemplate: IObjPermission
  }
  jobTypeTemplates?: IJobTypeTemplate[]
  jobTypeTemplateValues?: Record<string, IResourceRequirement>
  constraintTypes?: IBaseModel[]
  dependencyTypes?: IBaseModel[]
  coreSkills?: IBaseModel[]
  jobRequestors?: IBaseModel[]
}

export interface IJobTypeTemplate {
  id: string
  name: string
  schemaName: string
}

export interface IJobTypeTemplateValue {
  field: string
  id: string
  rel: string
  templateId: string
  value: string
}

export interface IResourceRequirement {
  totalQty: number,
  jobType: string,
  requirements: string
}

export enum GenericOptionObjects {
  Account,
  Contact,
  sked__Region__c,
  sked__Location__c,
  sked__Resource__c
}

export declare type GenericObjectTypes = keyof typeof GenericOptionObjects

export interface IGenericOptionParams {
  sObjectType: GenericObjectTypes
  name: string
  accountIds?: string
  regionIds?: string
}

export interface IGenericSelectItem extends ISelectItem {
  account?: IBaseModel
  contact?: IBaseModel
  region?: IBaseModel
  fieldName?: string
}

export interface ITimeOption {
  stringValue: string
  numberValue: number
  boundValue: number
}

export interface IOrgPreference {
  enableWorkingHours?: boolean
}

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface IWorkingHours {
  enabled: boolean,
  startTime: number,
  endTime: number
  days: Record<WeekDay, boolean>
}

export interface ISwimlaneSettings {
  // focusTimeConsole?: string
  snapUnitConsole: number
  // timeZoomConsole?: string
  // viewZoomConsole: number
  workingHours: IWorkingHours
}

export interface IUser {
  SmallPhotoUrl: string
}

export interface IResourceSuggestion {
  score: {
    soft: number
  }
  travel: {
    distanceFromHome: number
    durationFromHome: number
  }
  currentCapacityInSeconds: number
}

export interface IResource {
  id: string
  name: string
  rating?: number
  category?: string
  avatarUrl?: string
  suggestion?: IResourceSuggestion
  isSuggested: boolean
  tags?: IBaseModel[]
}
