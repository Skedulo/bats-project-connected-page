export const PROJECT_DETAIL_PATH = '/project-detail/'

export const LOCAL_STORAGE_KEY = {
  PROJECT_FILTER_SET: 'PROJECT_FILTER_SET'
}

export const DEFAULT_FILTER = {
  pageNumber: 1,
  pageSize: 20
}

export const DEFAULT_PROJECTS_LIST = {
  results: [],
  totalItems: 0,
}

export const DEFAULT_PROJECT = {
  projectName: '',
  projectDescription: '',
  name: '',
  id: '',
  startDate: '',
  projectStatus: '',
  endDate: ''
}

export enum PROJECT_TAB_ROUTES {
  DETAILS = 'details',
  JOBS = 'jobs'
}

export const PROJECT_TAB_OPTIONS = [
  { route: PROJECT_TAB_ROUTES.DETAILS, title: 'Details' },
  // { route: PROJECT_TAB_ROUTES.JOBS, title: 'Jobs' }
]
