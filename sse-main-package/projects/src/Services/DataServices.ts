import axios from 'axios'
import { mapValues, isNumber, chunk, isEmpty, values, flatten, keyBy } from 'lodash/fp'
import { Services, credentials } from './Services'
import {
  IProjectListItem,
  IProjectDetail,
  IListResponse,
  ISalesforceResponse,
  IFilterParams,
  IJobDetail,
  IJobFilterParams,
  IConfig,
  IJobTemplate,
  IJobTypeTemplate,
  IJobTypeTemplateValue,
  IResourceRequirement,
  IBaseModel,
  IGenericOptionParams,
  IResource,
  IJobTime,
  IJobDependency
} from '../commons/types'

import { DEFAULT_FILTER, TIME_FORMAT, DATE_FORMAT } from '../commons/constants'
import { parseTimeValue, toastMessage, parseTimeString } from '../commons/utils'
import { ISelectItem, } from '@skedulo/sked-ui'
import { format, utcToZonedTime, zonedTimeToUtc} from 'date-fns-tz'
import { parseISO, add, parse, addMinutes } from 'date-fns'

const httpApi = axios.create({
  baseURL: credentials.apiServer,
  headers: {
    Authorization: `Bearer ${credentials.apiAccessToken}`,
  },
})

const salesforceApi = axios.create({
  baseURL: credentials.vendor.url,
  headers: {
    Authorization: `Bearer ${credentials.vendor.token}`,
  },
})

export const fetchJobTypeTemplates = async (): Promise<IJobTypeTemplate[]> => {
  const res = await httpApi.get('/config/templates/Jobs')
  return res.data?.result || []
}

export const fetchJobTypeTemplateValues = async (
  templateId: string,
  jobType: string
): Promise<IResourceRequirement> => {
  const res = await httpApi.get(`/config/template/${templateId}/values`)
  const results = res.data?.result || []
  const resourceRequirements =
    results.find((item: IJobTypeTemplateValue) => {
      return item.field === 'ResourceRequirements'
    }) || {}
  const resourceRequirementValue = resourceRequirements.value ? JSON.parse(resourceRequirements.value) : {}
  return { ...resourceRequirementValue, jobType }
}

export const fetchConfig = async (): Promise<IConfig> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
}

export const fetchListProjects = async (filterObj: IFilterParams): Promise<IListResponse<IProjectListItem>> => {
  const res = await salesforceApi.get('/services/apexrest/sked/project', { params: { ...filterObj } })
  return res.data.data
}

export const fetchProjectById = async (projectId: string): Promise<IProjectDetail> => {
  const params = { id: projectId }
  const response: { data: ISalesforceResponse } = await salesforceApi.get('/services/apexrest/sked/project', {
    params,
  })
  const result = response.data.data
  result.contactId = result.contact?.id
  result.accountId = result.account?.id
  result.locationId = result.location?.id
  result.regionId = result.region?.id
  return {
    ...result,
    startTime: isNumber(result.startTime) ? parseTimeValue(result.startTime) : '',
    endTime: isNumber(result.endTime) ? parseTimeValue(result.endTime) : '',
  }
}

export const updateProject = async (requestData: IProjectDetail): Promise<IProjectDetail> => {
  const formattedPayload = mapValues(value => (value === '' ? null : value), requestData)
  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchProjectById(requestData.id)
}

export const createProject = async (createInput: IProjectDetail): Promise<string> => {
  try {
    const formattedPayload = mapValues(value => (value === '' ? null : value), createInput)

    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

    return response.data.data.id
  } catch (error) {
    toastMessage.error('Created unsuccessfully!')
    return ''
  }
}

export const deleteProject = async (uids: string): Promise<boolean> => {
  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.delete('/services/apexrest/sked/project', {
      params: { ids: uids },
    })

    return response.data.success
  } catch (error) {
    return false
  }
}

export const cancelProject = async (projectId: string): Promise<boolean> => {
  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.post('/services/apexrest/sked/project', { id: projectId, projectStatus: 'Cancelled' })

    return response.data.success
  } catch (error) {
    return false
  }
}

export const fetchTemplates = async (searchString: string, ignoreIds?: string[]): Promise<ISelectItem[]> => {
  const params = searchString ? { name: searchString } : {}
  const response: { data: ISalesforceResponse } = await salesforceApi.get('/services/apexrest/sked/projectTemplate', {
    params,
  })

  if (response.data?.data?.results?.length) {
    if (ignoreIds) {
      return response.data.data.results
        .filter((item: IProjectDetail) => !ignoreIds.includes(item.id))
        .map((item: IProjectDetail) => ({ value: item.id, label: item.projectName }))
    }
    return response.data.data.results.map((item: IProjectDetail) => ({ value: item.id, label: item.projectName }))
  }
  return []
}

export const fetchGenericOptions = async (params: IGenericOptionParams): Promise<ISelectItem[]> => {
  try {
    const response: { data: ISalesforceResponse } = await salesforceApi.get('/services/apexrest/sked/genericQuery', {
      params,
    })
    return response.data.data.results.map((item: IBaseModel) => ({ ...item, value: item.id, label: item.name }))
  } catch (error) {
    return []
  }
}

/**
 * JOBS
 */

export const fetchListJobs = async (filterObj: IJobFilterParams): Promise<IListResponse<IJobDetail>> => {
  try {
    const res = await salesforceApi.get(`/services/apexrest/sked/job`, { params: { ...filterObj } })
    if (res.data?.data?.results?.length > 0) {
      return {
        ...res.data.data,
        results: res.data.data.results.map((item: IJobDetail) => ({
          ...item,
          startTimeString: parseTimeValue(item.startTime),
          endTimeString: parseTimeValue(item.endTime),
        })),
      }
    }
    return res.data.data
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return {
      totalItems: 0,
      pageSize: filterObj.pageSize,
      pageNumber: filterObj.pageNumber,
      results: [],
    }
  }
}

export const fetchListJobTemplates = async (filterObj: IJobFilterParams): Promise<IListResponse<IJobDetail>> => {
  try {
    const res = await salesforceApi.get(`/services/apexrest/sked/projectJobTemplate`, { params: { ...filterObj } })
    return {
      ...res.data.data,
      results: res.data.data.results
    }
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return {
      totalItems: 0,
      pageSize: filterObj.pageSize,
      pageNumber: filterObj.pageNumber,
      results: [],
    }
  }
}

export const fetchJobTemplateOptions = async (
  filterObj: IJobFilterParams,
  ignoreIds?: string
): Promise<ISelectItem[]> => {
  try {
    const res = await salesforceApi.get(`/services/apexrest/sked/projectJobTemplate`,
      { params: { ...filterObj, ignorePjtIds: ignoreIds }
    })
    return res.data.data.results
      .map((item: IJobTemplate) => ({ value: item.id, label: item.name }))
  } catch (error) {
    return []
  }
}

export const createUpdateJobTemplate = async (requestData: IJobTemplate): Promise<boolean> => {
  const formattedPayload = mapValues(value => (value === '' ? null : value), requestData)

  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.post('/services/apexrest/sked/projectJobTemplate', formattedPayload)
    return response.data.success
  } catch (error) {
    return false
  }
}

export const deleteJobTemplate = async (id: string): Promise<boolean> => {
  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.delete('/services/apexrest/sked/projectJobTemplate', {  params: { ids: id } })
    return response.data.success
  } catch (error) {
    return false
  }
}

export const createUpdateJobDependency = async (requestData: IJobDependency): Promise<boolean> => {
  const formattedPayload = mapValues(value => (value === '' ? null : value), requestData)

  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.post('/services/apexrest/sked/projectJobDependency', formattedPayload)
    return response.data.success
  } catch (error) {
    return false
  }
}

export const dispatchMutipleJobs = async (jobIds: string) => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/job/dispatch', { params: { ids: jobIds } })
    return res.data.success
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return false
  }
}

export const deallocateMutipleJobs = async (jobIds: string): Promise<boolean> => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/job/deallocate', { params: { ids: jobIds } })
    return res.data.success
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return false
  }
}

export const unscheduleMutipleJobs = async (jobIds: string): Promise<boolean> => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/job/unschedule', { params: { ids: jobIds } })
    return res.data.success
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return false
  }
}

export const allocateMutipleJobs = async (jobIds: string[], resourceIds: string[]): Promise<boolean> => {
  try {
    const data = jobIds.map(jobId => ({ id: jobId, resourceIds }))
    const res = await salesforceApi.post('/services/apexrest/sked/job/allocate', data)
    return res.data.success
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return false
  }
}

export const updateJobTime = async (job: IJobTime): Promise<boolean> => {
  try {
    const res = await salesforceApi.post(`/services/apexrest/sked/job`, job)
    return res.data.success
  } catch (error) {
    toastMessage.error('Something went wrong!')
    return false
  }
}

export const getJobSuggestion = async (
  jobId: string,
  regionId: string,
  scheduleStart: string,
  scheduleEnd: string,
  timezone: string
  // schedulingOptions: Record<string, string>
) => {
  try {
    const CHUNK_SIZE = 50
    const resourcesByRegion = await fetchResourcesByRegion(regionId, scheduleStart, scheduleEnd, timezone)
    const resourceIds = chunk(CHUNK_SIZE, resourcesByRegion.map(item => item.id))
    const promises = resourceIds.map(resources => httpApi.post('/planr/optimize/suggest', {
      suggestForNode: jobId,
      resourceIds: resources,
      scheduleStart,
      scheduleEnd,
      schedulingOptions: {
        balanceWorkload: false,
        ignoreTravelTimeFirstJob: false,
        ignoreTravelTimeLastJob: false,
        ignoreTravelTimes: false,
        jobTimeAsTimeConstraint: true,
        minimizeResources: false,
        padding: 0,
        preferJobTimeOverTimeConstraint: true,
        respectSchedule: true,
        snapUnit: 0
      }
    }))
    const responses = await Promise.all(promises)
    const suggestions = flatten(responses.map(r => values(r.data.result.routes)).filter(suggest => !isEmpty(suggest)))

    if (!suggestions.length) {
      toastMessage.info('No valid suggestions')
      return []
    }

    const sortedSuggestions = suggestions.sort((a, b) => {
      return new Date(a.route.start).valueOf() - new Date(b.route.start).valueOf()
    })

    const earliestSuggestion = sortedSuggestions[0]
    const parsedDate = utcToZonedTime(new Date(earliestSuggestion.route.start), timezone)

    return [{
      ...earliestSuggestion,
      ...earliestSuggestion.route,
      startDate: format(parsedDate, DATE_FORMAT),
      startTimeString: format(parsedDate, TIME_FORMAT),
      startTime: parseTimeString(format(parsedDate, TIME_FORMAT)),
      endTime: parseTimeString(format(add(parsedDate, { minutes: earliestSuggestion.route.duration }), TIME_FORMAT))
    }]
  } catch (error) {
    toastMessage.info('No valid suggestions')
    return []
  }
}

/**
 * RESOURCES
 */

export const allocationResources = async (jobId: string, resourceIds: string[]): Promise<boolean> => {
  if (!resourceIds.length) {
    return true
  }
  try {
    let queries = ''
    resourceIds.forEach((id, index) => {
      queries += `_j${index}: insertJobAllocations(input: {
        JobId: "${jobId}",
        ResourceId: "${id}",
        Status: "Pending Dispatch"
      })\n`
    })
    await Services.graphQL.fetch<{ resources: IResource[] }>({
      query: `
        mutation createJobAllocations {
          schema {
            ${queries}
          }
        }
      `
    })

    return true
  } catch (error) {
    toastMessage.error('Allocated unsuccessfully!')
    return false
  }
}

export const fetchResourcesByRegion = async (
  regionIds: string,
  scheduleStart: string,
  scheduleEnd: string,
  timezone: string
  ): Promise<IResource[]> => {
  try {
    const zonedStartDate = utcToZonedTime(new Date(scheduleStart), timezone)
    const zonedEndDate = utcToZonedTime(new Date(scheduleEnd), timezone)
    const res = await salesforceApi.get('/services/apexrest/sked/resource', { params: {
      regionIds,
      timezoneSid: timezone,
      startDate: format(zonedStartDate, DATE_FORMAT),
      startTime: parseTimeString(format(zonedStartDate, TIME_FORMAT)),
      endDate: format(zonedEndDate, DATE_FORMAT),
      endTime: parseTimeString(format(zonedEndDate, TIME_FORMAT))
    } })

    return res.data.data.results
  } catch (error) {
    return []
  }
}

export const fetchResourcesByRegionSimple = async (
  regionIds: string
  ): Promise<IResource[]> => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/resource', { params: {
      regionIds
    } })

    return res.data.data.results
  } catch (error) {
    return []
  }
}

export const getResourceAvailabilities = async (
  resourceIds: string[],
  regionIds: string[],
  scheduleStart: string,
  scheduleEnd: string
) => {
  try {
    const CHUNK_SIZE = 200
    const chunkedResourceIds = chunk(CHUNK_SIZE, resourceIds)
    const promises = chunkedResourceIds.map(ids => httpApi.post('/availability/resources', {
      resourceIds: ids,
      regionIds,
      start: scheduleStart,
      end: scheduleEnd,
      availability: true
    }))
    const responses = await Promise.all(promises)
    const availabilities: Record<string, { start: string, end: string }[]> = {}
    responses.forEach(r => {
      const result = r.data.result
      Object.keys(result).forEach(id => {
        availabilities[id] = result[id].available
      })
    })
    return availabilities
  } catch (error) {
    return {}
  }
}

export const getResourceSuggestions = async (
  jobId: string,
  resources: Record<string, { start: string, end: string }[]>,
  scheduleStart: string,
  scheduleEnd: string
) => {
  try {
    const response = await httpApi.post('/planr/optimize/resource_suggestions', {
      jobId,
      resources,
      scheduleStart,
      scheduleEnd,
      schedulingOptions: {
        balanceWorkload: false,
        ignoreTravelTimeFirstJob: false,
        ignoreTravelTimeLastJob: false,
        ignoreTravelTimes: false,
        jobTimeAsTimeConstraint: true,
        minimizeResources: false,
        padding: 0,
        preferJobTimeOverTimeConstraint: true,
        respectSchedule: true,
        snapUnit: 0,
      }
    })
    return response.data.result
  } catch (error) {
    return {}
  }
}

export const fetchAvailableResources = async (job: IJobDetail, regionId: string) => {
  try {
    const zonedStartDate = job.startDate
    const zonedEndDate = job.endDate
    const scheduleStart = parse(
      `${job.startDate} ${parseTimeValue(job.startTime)}`,
      `${DATE_FORMAT} ${TIME_FORMAT}`,
      new Date()
    )
    const scheduleEnd = addMinutes(scheduleStart, job.duration)

    const scheduleStartUtc = zonedTimeToUtc(scheduleStart, job.timezoneSid).toISOString()
    const scheduleEndUtc = zonedTimeToUtc(scheduleEnd, job.timezoneSid).toISOString()

    const resourcesByRegion = await fetchResourcesByRegion(regionId, scheduleStartUtc, scheduleEndUtc, job.timezoneSid)
    const resourceIds = resourcesByRegion.map(item => item.id)
    const availabilities = await getResourceAvailabilities(resourceIds, [regionId], scheduleStartUtc, scheduleEndUtc)
  // HARD CODE to be same with web app version, will investigate later

    // const scheduleStartTemp = parse(`${zonedStartDate} 00:00:00`, `${DATE_FORMAT} HH:mm:ss`, new Date())
    // const scheduleEndTemp = parse(`${zonedStartDate} 23:59:59`, `${DATE_FORMAT} HH:mm:ss`, new Date())
    // const scheduleStartUtcTemp = zonedTimeToUtc(scheduleStartTemp, job.timezoneSid).toISOString()
    // const scheduleEndUtcTemp = zonedTimeToUtc(scheduleEndTemp, job.timezoneSid).toISOString()
    const suggestedResources = await getResourceSuggestions(
      job.id,
      availabilities,
      scheduleStartUtc,
      scheduleEndUtc
    )
    return resourcesByRegion.map(item => {
      return {
        ...item,
        suggestion: suggestedResources[item.id],
        isSuggested: !!suggestedResources[item.id]
      }
    })
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.log('error: ', error)
    return []
  }
}
