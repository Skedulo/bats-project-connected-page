import axios from 'axios'
import { mapValues, isNumber } from 'lodash/fp'
import { Services, credentials } from './Services'
import {
  ProjectListItemInterface,
  ProjectDetailInterface,
  ListResponseInterface,
  LookupOptionInterface,
  ContactOptionInterface,
  SalesforceResponseInterface,
  FilterParamsInterface,
} from '../commons/types'

import { LOCAL_STORAGE_KEY, DEFAULT_FILTER } from '../commons/constants'
import { parseTimeValue, parseTimeString } from '../commons/utils';

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

export const fetchConfig = async (): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
}

export const fetchListProjects = async (
  filterObj: FilterParamsInterface
): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  const res = await salesforceApi.get('/services/apexrest/sked/project', { params: { ...filterObj } })
  return res.data.data
}

export const fetchProjectById = async (projectId: string): Promise<ProjectDetailInterface> => {
  const params = { projectId }
  const response: { data: SalesforceResponseInterface } = await salesforceApi.get(
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
  requestData: ProjectDetailInterface
): Promise<ProjectDetailInterface> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, requestData)
  const response: {
    data: SalesforceResponseInterface
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchProjectById(requestData.id)
}

export const createProject = async (
  createInput: ProjectDetailInterface
): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  const formattedPayload = mapValues(value => value === '' ? null : value, createInput)

  const response: {
    data: SalesforceResponseInterface
  } = await salesforceApi.post('/services/apexrest/sked/project', formattedPayload)

  return fetchListProjects(DEFAULT_FILTER)
}

export const deleteProject = async (uids: string) => {
  const response: {
    data: SalesforceResponseInterface
  } = await salesforceApi.delete('/services/apexrest/sked/project', {
    params: { ids: uids }
  })

  return response.data
}

export const fetchTemplates = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const params = searchString ? { name: searchString } : {}
  const response: { data: SalesforceResponseInterface } = await salesforceApi.get(
    '/services/apexrest/sked/projectTemplate',
    {
      params,
    }
  )
  if (response.data.success && response.data.results?.length) {
    return response.data.results.map((item: ProjectDetailInterface) => ({ UID: item.id, Name: item.projectName }))
  }
  return []
}

export const fetchAccounts = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const response = await Services.graphQL.fetch<{ accounts: LookupOptionInterface[] }>({
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

export const fetchContacts = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const response = await Services.graphQL.fetch<{ contacts: ContactOptionInterface[] }>({
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

  return response.contacts.map((item: ContactOptionInterface) => ({ UID: item.UID, Name: item.FullName }))
}

export const fetchRegions = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const response = await Services.graphQL.fetch<{ regions: LookupOptionInterface[] }>({
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

export const fetchLocations = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const response = await Services.graphQL.fetch<{ locations: LookupOptionInterface[] }>({
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

export const setLocalFilterSets = (filterSet: any) => {
  return window.localStorage.setItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET, JSON.stringify(filterSet))
}

export const getLocalFilterSets = () => {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET)
  return stored ? JSON.parse(stored) : []
}
