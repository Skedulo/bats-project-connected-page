export interface RouterParamsInterface {
  projectId?: string
}

export interface ObjPermissionInterface {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface AppContextInterface {
  config: {
    projectStatuses?: { id: string, name: string }[],
    objPermissions?: {
      Project: ObjPermissionInterface
      ProjectJobTemplate: ObjPermissionInterface
    }
  }
}

export interface ProjectListItemInterface {
  name: string
  id: string
  startDate: string
  projectName: string
  projectDescription: string
  projectStatus?: string
  endDate: string
}

export interface ProjectDetailInterface extends ProjectListItemInterface {
  applyAccountForAllJob: boolean
  applyContactForAllJob: boolean
  applyRegionForAllJob: boolean
  applyLocationForAllJob: boolean
  isTemplate: boolean
  templateId?: string
  accountId?: string
  contactId?: string
  regionId?: string
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
}

export interface ListResponseInterface<T> {
  totalItems: number
  pageSize?: number
  pageNumber?: number
  results: T[]
}

export interface LookupOptionInterface {
  UID: string
  Name: string
}

export interface ContactOptionInterface {
  UID: string
  FullName: string
}

export interface SalesforceResponseInterface {
  pageNumber: number
  pageSize: number
  totalItems: number
  data: any
  success: boolean
  message: string
  devMessage: string
  errorMessage: number
  code: number
}

export interface SavedFilterSetInterface extends FilterParamsInterface {
  id: string
  name: string
  filterSet: any
}

export interface FilterParamsInterface {
  projectStatus?: string
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
