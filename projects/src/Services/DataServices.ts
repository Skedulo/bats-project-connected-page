import axios from 'axios'
import { mapValues, isNumber } from 'lodash/fp'
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
} from '../commons/types'

import { DEFAULT_FILTER } from '../commons/constants'
import { parseTimeValue, toastMessage } from '../commons/utils'

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

export const fetchConfig = async (): Promise<IConfig> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
}

export const fetchListProjects = async (
  filterObj: IFilterParams
): Promise<IListResponse<IProjectListItem>> => {
  const res = await salesforceApi.get('/services/apexrest/sked/project', { params: { ...filterObj } })
  return res.data.data
}

export const fetchProjectById = async (projectId: string): Promise<IProjectDetail> => {
  const params = { projectId }
  const response: { data: ISalesforceResponse } = await salesforceApi.get(
    '/services/apexrest/sked/project',
    {
      params,
    }
  )
  const result = response.data.data
  result.contactId = result.contact?.id
  result.accountId = result.account?.id
  result.locationId = result.location?.id
  result.regionId = result.region?.id
  return {
    ...result,
    startTime: isNumber(result.startTime) ? parseTimeValue(result.startTime) : '',
    endTime: isNumber(result.endTime) ? parseTimeValue(result.endTime) : ''
  }
}

export const updateProject = async (
  requestData: IProjectDetail
): Promise<IProjectDetail> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, requestData)
  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchProjectById(requestData.id)
}

export const createProject = async (
  createInput: IProjectDetail
): Promise<IListResponse<IProjectListItem>> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, createInput)

  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchListProjects(DEFAULT_FILTER)
}

export const deleteProject = async (uids: string) => {
  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.delete('/services/apexrest/sked/project', {
    params: { ids: uids }
  })

  return response.data
}

export const fetchTemplates = async (searchString: string): Promise<ILookupOption[]> => {
  const params = searchString ? { name: searchString } : {}
  const response: { data: ISalesforceResponse } = await salesforceApi.get(
    '/services/apexrest/sked/projectTemplate',
    {
      params,
    }
  )
  if (response.data.success && response.data.results?.length) {
    return response.data.results.map((item: IProjectDetail) => ({ UID: item.id, Name: item.projectName }))
  }
  return []
}

export const fetchAccounts = async (searchString: string): Promise<ILookupOption[]> => {
  const response = await Services.graphQL.fetch<{ accounts: ILookupOption[] }>({
    query: `
      query fetchAccounts($filter:  EQLQueryFilterAccounts){
        accounts(first: 5, filter: $filter){
          edges {
            node {
              UID
              Name
            }
          }
        }
      }
    `,
    variables: {
      filter: `Name LIKE '%${searchString}%'`,
    },
  })

  return response.accounts
}

export const fetchContacts = async (searchString: string): Promise<ILookupOption[]> => {
  const response = await Services.graphQL.fetch<{ contacts: IContactOption[] }>({
    query: `
      query fetchContacts($filter:  EQLQueryFilterContacts){
        contacts(first: 5, filter: $filter){
          edges {
            node {
              UID
              FullName
            }
          }
        }
      }
    `,
    variables: {
      filter: `FullName LIKE '%${searchString}%'`,
    },
  })

  return response.contacts.map((item: IContactOption) => ({ UID: item.UID, Name: item.FullName }))
}

export const fetchRegions = async (searchString: string): Promise<ILookupOption[]> => {
  const response = await Services.graphQL.fetch<{ regions: ILookupOption[] }>({
    query: `
      query fetchRegions($filter:  EQLQueryFilterRegions){
        regions(first: 5, filter: $filter){
          edges {
            node {
              UID
              Name
            }
          }
        }
      }
    `,
    variables: {
      filter: `Name LIKE '%${searchString}%'`,
    },
  })

  return response.regions
}

export const fetchLocations = async (searchString: string): Promise<ILookupOption[]> => {
  const response = await Services.graphQL.fetch<{ locations: ILookupOption[] }>({
    query: `
      query fetchLocations($filter:  EQLQueryFilterLocations){
        locations(first: 5, filter: $filter){
          edges {
            node {
              UID
              Name
            }
          }
        }
      }
    `,
    variables: {
      filter: `Name LIKE '%${searchString}%'`,
    },
  })

  return response.locations
}

/**
 * JOBS
 */

export const fetchListJobs = async (filterObj: IJobFilterParams): Promise<IListResponse<IJobDetail>> => {
  const res = await salesforceApi.get(`/services/apexrest/sked/job`, { params: { ...filterObj } })
  return res.data.data
}

export const fetchListJobTemplates = async (filterObj: IJobFilterParams): Promise<IListResponse<IJobDetail>> => {
  const res = await salesforceApi.get(`/services/apexrest/sked/projectJobTemplate`, { params: { ...filterObj } })
  return res.data.data
}

export const updateJob = async (
  requestData: IJobDetail
): Promise<IListResponse<IJobDetail>> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, requestData)
  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/job', formattedPayload)

  return fetchListJobs({ ...DEFAULT_FILTER, projectId: requestData.projectId })
}

export const createJob = async (
  requestData: IJobTemplate
): Promise<IListResponse<IJobDetail>> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, requestData)

  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.post('/services/apexrest/sked/job', formattedPayload)

  return fetchListJobs({ ...DEFAULT_FILTER, projectId: requestData.projectId })
}

export const deleteJob = async (uids: string) => {
  const response: {
    data: ISalesforceResponse
  } = await salesforceApi.delete('/services/apexrest/sked/job', {
    params: { ids: uids }
  })

  return response.data
}

// export const dispatchResource = async (jobId, resourceIds): Promise<IListResponse<IJobDetail>> => {

// }

export const dispatchResource = async (jobId: string, resourceIds: string[]) => {
  console.log('dispatch----jobId: ', jobId);
  console.log('dispatch----resourceIds: ', resourceIds);
}

export const dispatchMutipleJobs = async (jobArray: IJobDetail[]) => {
  try {
    await Promise.all(jobArray.map(job => dispatchResource(job.id, job.allocations.map(item => item.id))))
    toastMessage.error('Dispatched successfully!')
  } catch (error) {
    console.log('error: ', error);
  }
}

export const deallocateMutipleJobs = async (jobArray: IJobDetail[]) => {
  try {
    await Promise.all(jobArray.map(job => dispatchResource(job.id, job.allocations.map(item => item.id))))
    toastMessage.error('Dispatched successfully!')
  } catch (error) {
    console.log('error: ', error);
  }
}
