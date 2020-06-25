import axios from 'axios'
import { mapValues, isNumber, chunk, isEmpty, values, flatten } from 'lodash/fp'
import { Services, credentials } from './Services'
import {
  IProjectListItem,
  IProjectDetail,
  IListResponse,
  ILookupOption,
  IContactOption,
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
  IJobTime
} from '../commons/types'

import { DEFAULT_FILTER, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT } from '../commons/constants'
import { parseTimeValue, toastMessage, parseTimeString } from '../commons/utils'
import { ISelectItem, } from '@skedulo/sked-ui'
import { format, utcToZonedTime } from 'date-fns-tz'
import { parseISO, add } from 'date-fns'

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

export const createProject = async (createInput: IProjectDetail): Promise<IListResponse<IProjectListItem>> => {
  const formattedPayload = mapValues(value => (value === '' ? null : value), createInput)

  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchListProjects(DEFAULT_FILTER)
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
    console.log('error: ', error)
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
    console.log('error: ', error)
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

export const fetchJobTemplateOptions = async (
  filterObj: IJobFilterParams,
  ignoreIds: string
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

export const dispatchMutipleJobs = async (jobIds: string) => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/job/dispatch', { params: { ids: jobIds } })
    return res.data.success
  } catch (error) {
    console.log('error: ', error)
    return false
  }
}

export const deallocateMutipleJobs = async (jobIds: string): Promise<boolean> => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/job/deallocate', { params: { ids: jobIds } })
    return res.data.success
  } catch (error) {
    console.log('error: ', error)
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

export const fetchOrgPreference = async () => {
  try {
    const res = await httpApi.get('/config/org_preference')
    return {
      enableWorkingHours: res.data.result?.web?.features.enableWorkingHours || false
    }
  } catch (error) {
    return {
      enableWorkingHours: false
    }
  }
}

export const fetchResourcesByRegion = async (regionId: string): Promise<IResource[]> => {
  try {
    const res = await Services.graphQL.fetch<{ resources: IResource[] }>({
      query: ResourcesByRegionQuery,
      variables: {
        filter: `PrimaryRegionId == '${regionId}'`
      }
    })
    return res.resources
  } catch (error) {
    return []
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
    const resourcesByRegion = await fetchResourcesByRegion(regionId)
    const resourceIds = chunk(CHUNK_SIZE, resourcesByRegion.map(item => item.UID))
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

    return suggestions.map(item => {
      const parsedDate = utcToZonedTime(new Date(item.route.start), timezone)

      return {
        ...item,
        ...item.route,
        startDate: format(parsedDate, DATE_FORMAT),
        startTimeString: format(parsedDate, TIME_FORMAT),
        startTime: parseTimeString(format(parsedDate, TIME_FORMAT)),
        endTime: parseTimeString(format(add(parsedDate, { minutes: item.route.duration }), TIME_FORMAT))
      }
    })
  } catch (error) {
    toastMessage.info('No valid suggestions')
    return []
  }
}

const ResourcesByRegionQuery = `
  query fetchResourcesByRegion($filter: EQLQueryFilterResources!) {
    resources(filter: $filter) {
      edges {
        node {
          UID
          Name
        }
      }
    }
  }
`

const UpdateJobMutation = `
  mutation updateJob($updateInput: UpdateJobs!) {
    schema {
      updateJobs(input: $updateInput)
    }
  }
`
