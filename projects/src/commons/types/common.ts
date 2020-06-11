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

export interface ITimePickerOption {
  stringValue: string,
  numberValue: number
}

export interface IBaseModel {
  name: string
  id: string
}

export interface IConfig {
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
  sked__Location__c
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
