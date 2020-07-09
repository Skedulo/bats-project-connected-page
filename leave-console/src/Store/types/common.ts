import { ISelectItem } from '@skedulo/sked-ui'

export interface IListResponse<T> {
  totalItems: number
  pageSize?: number
  pageNumber?: number
  results: T[]
}

export interface ISalesforceResponse {
  pageNumber: number
  pageSize: number
  totalItems: number
  data?: any
  results?: any
  success: boolean
  message: string
  devMessage: string
  errorMessage: number
  code: number
}

export interface FilterParams {
  searchText?: string
  pageSize?: number
  pageNumber?: number
}

export interface IConfig {
  coreSkills: IBaseModel[],
  regions: IRegion[]
}


export interface IBaseModel {
  name: string
  id: string
}

export interface IGraphqlBaseModal {
  UID: string
  Name: string
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

export interface IRegion extends IBaseModel {
  timezoneSid: string
}
