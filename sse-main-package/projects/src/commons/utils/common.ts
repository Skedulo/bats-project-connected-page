import isNull from 'lodash/isNull'
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
  if (jobDependency.fromAnchor === 'Start' && jobDependency.toAnchor === 'Start') {
    return JobDependencyType.AFTER_THE_START_OF
  }
  if (jobDependency.toAnchorMinOffsetMins && isNull(jobDependency.toAnchorMaxOffsetMins)) {
    return JobDependencyType.AT_LEAST
  }
  if (jobDependency.toAnchorMinOffsetMins === 0 && jobDependency.toAnchorMaxOffsetMins) {
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
export const getMinutes = (n: number, unit: 'days' | 'hours') => {
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
 * get day or hour value from minutes with unit label
 */
export const parseMinutes = (n: number, unit: string) => {
  switch (unit) {
    case 'days':
      const days = Math.round(n / 1440)
      return `${days} ${days > 1 ? 'days' : 'day'}`

    case 'hours':
      const hours = Math.round(n / 60)
      return `${hours} ${hours > 1 ? 'hours' : 'hour'}`
    default:
      return n
  }
}

export type JobDependencyConflictMinimum = Pick<
JobDependencies,
'FromAnchor' | 'ToAnchor' | 'ToAnchorMinOffsetMinutes' | 'ToAnchorMaxOffsetMinutes'
> & { FromJob: Pick<Jobs, 'Start' | 'End'> }

function getConflicts<T extends JobDependencyConflictMinimum>(
test: { Start: Date | string; End: Date | string },
jobDependencies: T[]
) {
const toJob = {
  Start: new Date(test.Start),
  End: new Date(test.End)
}
return jobDependencies.map(dependency => {
  const baseToTime = toJob[dependency.ToAnchor] && new Date(toJob[dependency.ToAnchor])
  const baseFromTime = dependency.FromJob[dependency.FromAnchor] && new Date(dependency.FromJob[dependency.FromAnchor])
  if (!baseFromTime || !baseToTime) {
    return {
      dependency,
      inViolation: false
    }
  }
  const window = {
    lowerBound:
      !dependency.ToAnchorMinOffsetMinutes && dependency.ToAnchorMinOffsetMinutes !== 0
        ? null
        : new Date(baseFromTime.valueOf() + (dependency.ToAnchorMinOffsetMinutes || 0) * 60 * 1000),
    upperBound:
      !dependency.ToAnchorMaxOffsetMinutes && dependency.ToAnchorMaxOffsetMinutes !== 0
        ? null
        : new Date(baseFromTime.valueOf() + (dependency.ToAnchorMaxOffsetMinutes || 0) * 60 * 1000)
  }
  return {
    dependency,
    inViolation:
      (window.lowerBound && baseToTime.valueOf() < window.lowerBound.valueOf()) ||
      (window.upperBound && baseToTime.valueOf() > window.upperBound.valueOf()) ||
      false
  }
})
}
