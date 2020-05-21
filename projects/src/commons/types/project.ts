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
  ppplyAccountForAllJob: boolean
  contactId: string
  applyContactForAllJob: boolean
  regionId: string
  applyRegionForAllJob: boolean
  location: string
  applyLocationForAllJob: boolean
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
