export interface IRouterParams {
  projectId?: string
}

export interface IProjectListItem {
  name: string
  id: string
  startDate: string
  projectName: string
  projectDescription: string
  projectStatus?: ProjectStatusKey
  endDate: string
  isTemplate?: boolean
}

export interface IProjectDetail extends IProjectListItem {
  applyAccountForAllJob: boolean
  applyContactForAllJob: boolean
  applyRegionForAllJob: boolean
  applyLocationForAllJob: boolean
  isTemplate: boolean
  templateId?: string
  accountId?: string
  contactId?: string
  regionId?: string
  startTime?: string
  endTime?: string
  template?: {
    id: string
    name: string
  }
  account?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    name: string
  }
  region?: {
    id: string
    name: string
  }
  location?: {
    id: string
    name: string
  }
  address: string
  canEdit?: boolean
}

export interface IListResponse<T> {
  totalItems: number
  pageSize?: number
  pageNumber?: number
  results: T[]
}

export interface ILookupOption {
  UID: string
  Name: string
}

export interface IContactOption {
  UID: string
  FullName: string
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

export interface ISavedFilterSet extends IFilterParams {
  id: string
  name: string
  filterSet: any
}

export interface IFilterParams {
  projectStatuses?: string
  searchText?: string
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
  sortType?: string
  sortBy?: string
  accountIds?: string
  locationIds?: string
  contactIds?: string
  regionIds?: string
}

export interface IJobFilterParams extends IFilterParams {
  projectId?: string
}

export enum ProjectStatusColor {
  'Template',
  'Draft',
  'Planned',
  'Ready',
  'In Progress',
  'Complete',
  'Cancelled',
}

export declare type ProjectStatusKey = keyof typeof ProjectStatusColor
