import { LOCAL_STORAGE_KEY } from '../constants'
import { toast } from 'react-toastify'
import { JobDependencyType, IJobDependency } from '../types'

export const setLocalFilterSets = (filterSet: any) => {
  return window.localStorage.setItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET, JSON.stringify(filterSet))
}

export const getLocalFilterSets = () => {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET)
  return stored ? JSON.parse(stored) : []
}

export const setLocalStorage = (key: string, value: string) => {
  return window.localStorage.setItem(key, value)
}

export const getLocalStorage = (key: string) => {
  return window.localStorage.getItem(key)
}

export const toastMessage = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
}

export const getDependencyType = (jobDependency: IJobDependency) => {
  if (!jobDependency.id) {
    return JobDependencyType.AFTER_THE_END_OF
  }
  if (jobDependency.fromAnchor === 'Start' && jobDependency.toAnchor === 'Start') {
    return JobDependencyType.AFTER_THE_START_OF
  }
  if (!jobDependency.toAnchorMinOffsetMins && jobDependency.toAnchorMaxOffsetMins) {
    return JobDependencyType.AT_LEAST
  }
  if (jobDependency.toAnchorMinOffsetMins && !jobDependency.toAnchorMaxOffsetMins) {
    return JobDependencyType.WITHIN
  }
  if (jobDependency.toAnchorMinOffsetMins && jobDependency.toAnchorMaxOffsetMins) {
    return JobDependencyType.BETWEEN
  }
  return JobDependencyType.AFTER_THE_END_OF
}

/**
 * get minute value from day or hour
 */
export const getMinutes = (n: number, unit: string) => {
  switch (unit) {
    case 'days':
      return n * 1440

    case 'hours':
      return n * 60
    default:
      return n
  }
}

/**
 * get day or hour value from minutes
 */
export const parseMinutes = (n: number, unit: string) => {
  switch (unit) {
    case 'days':
      return n / 1440

    case 'hours':
      return n / 60
    default:
      return n
  }
}
