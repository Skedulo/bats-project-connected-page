import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces';

export interface RouterParamsInterface {
  projectId?: string
}

export interface ProjectListItemInterface {
  name: string
  id: string
  startDate: string
  projectName: string
  projectDescription: string
  projectStatus: string
  endDate: string
}

export interface ProjectDetailInterface extends ProjectListItemInterface {
  templateId: string
  accountId: string
  applyAccountForAllJob: boolean
  contactId: string
  applyContactForAllJob: boolean
  regionId: string
  applyRegionForAllJob: boolean
  applyLocationForAllJob: boolean
  isTemplate: boolean
  template: {
    id: string
    name: string
  }
  account: {
    id: string
    name: string
  }
  contact: {
    id: string
    name: string
  }
  region: {
    id: string
    name: string
  }
  location: {
    id: string
    name: string
  }
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

export interface SavedFilterSetInterface {
  id: string
  name: string
  filterSet: any
}
