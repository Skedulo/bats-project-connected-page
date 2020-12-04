import isNull from 'lodash/isNull'
import get from 'lodash/get'
import { LOCAL_STORAGE_KEY } from '../constants'
import { toast } from 'react-toastify'
import { JobDependencyType, IJobDependency, IJobDetail } from '../types'
import { parseTimeValue } from './dateUtils'
import { da } from 'date-fns/locale'

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
  if (jobDependency.toAnchorMinOffsetMins && !jobDependency.toAnchorMaxOffsetMins) {
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
export const parseMinutes = (n: number, unit: string, withLabel?: boolean) => {
  switch (unit) {
    case 'days':
      const days = Math.round(n / 1440)
      return withLabel ? `${days} ${days > 1 ? 'days' : 'day'}` : days

    case 'hours':
      const hours = Math.round(n / 60)
      return withLabel ?  `${hours} ${hours > 1 ? 'hours' : 'hour'}` : hours
    default:
      return n
  }
}

// export type JobDependencyConflictMinimum = Pick<
// IJobDependency,
// 'fromAnchor' | 'toAnchor' | 'toAnchorMinOffsetMins' | 'toAnchorMaxOffsetMins'
// > & { FromJob: IJobDetail }

export const getDependencyMessage = (dependency: IJobDependency, isFromProject?: boolean) => {
  const dependencyType = getDependencyType(dependency)
  const minOffset = dependency.toAnchorMinOffsetMins ?
    `${parseMinutes(dependency.toAnchorMinOffsetMins, 'hours', true)}` :
    ''
  const maxOffset = dependency.toAnchorMaxOffsetMins ?
    `${parseMinutes(dependency.toAnchorMaxOffsetMins, 'hours', true)}` :
    ''
  const offsets = []
  if (minOffset) {
    offsets.push(minOffset)
  }
  if (maxOffset) {
    offsets.push(maxOffset)
  }
  const strings = offsets.length > 0 ? `${offsets.length > 1 ? offsets.join(' and ') : offsets[0]} after the end of` : ''
  if (isFromProject) {
    return `The job ${dependency.toJobTemplate?.name} must start ${dependencyType} ${strings} this job`
  }
  return `Must start ${dependencyType} ${strings} job ${dependency.fromJobTemplate?.name || dependency.fromJob?.name}`
}

export const getDependencyConflicts = (
  targetJob: IJobDetail,
  jobDependencies: IJobDependency[]
) => {
  const toJob = {
    Start: targetJob.startDate && targetJob.startTime ?
      new Date(`${targetJob.startDate} ${parseTimeValue(targetJob.startTime)}`) :
      null,
    End: targetJob.endDate && targetJob.endTime ?
      new Date(`${targetJob.endDate} ${parseTimeValue(targetJob.endTime)}`) :
      null
  }
  // return []

  return jobDependencies.map(jd => {
    const dependency = {
      ...jd,
      fromJob: {
        ...jd.fromJob,
        Start: jd.fromJob?.startDate && jd.fromJob?.startTime ?
          new Date(`${jd.fromJob.startDate} ${parseTimeValue(jd.fromJob.startTime)}`) :
          null,
        End: jd.fromJob?.endDate && jd.fromJob?.endDate ?
          new Date(`${jd.fromJob.endDate} ${parseTimeValue(jd.fromJob.endTime)}`) :
          null
      }
    }

    const baseToTime = get(toJob, [dependency.toAnchor])
    const baseFromTime = get(dependency.fromJob, [dependency.fromAnchor])

    if (!baseFromTime || !baseToTime) {
      return {
        dependency,
        inViolation: false
      }
    }

    const window = {
      lowerBound:
        !dependency.toAnchorMinOffsetMins && dependency.toAnchorMinOffsetMins !== 0
          ? null
          : new Date(baseFromTime.valueOf() + (dependency.toAnchorMinOffsetMins || 0) * 60 * 1000),
      upperBound:
        !dependency.toAnchorMaxOffsetMins && dependency.toAnchorMaxOffsetMins !== 0
          ? null
          : new Date(baseFromTime.valueOf() + (dependency.toAnchorMaxOffsetMins || 0) * 60 * 1000)
    }

    return {
      dependency,
      message: getDependencyMessage(jd),
      inViolation:
        (window.lowerBound && baseToTime.valueOf() < window.lowerBound.valueOf()) ||
        (window.upperBound && baseToTime.valueOf() > window.upperBound.valueOf()) ||
        false
    }
  }).filter(jd => jd.inViolation)
}
