import { LozengeColors } from '@skedulo/sked-ui'
import { ProjectStatusKey } from '../types'

export const PROJECT_DETAIL_PATH = '/project-detail/'

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
  { route: PROJECT_TAB_ROUTES.JOBS, title: 'Jobs' }
]

export const PROJECT_STATUS_COLOR: Record<ProjectStatusKey, LozengeColors>  = {
  'Template': 'orange',
  'Draft': 'neutral',
  'Planned': 'purple',
  'Ready': 'sapphire',
  'In Progress': 'cyan',
  'Complete': 'green',
  'Cancelled': 'red',
}
