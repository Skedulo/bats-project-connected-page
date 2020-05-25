import axios from 'axios'
import { Services, credentials } from './Services'
import {
  ProjectListItemInterface,
  ProjectDetailInterface,
  ListResponseInterface,
  LookupOptionInterface,
  ContactOptionInterface,
  SalesforceResponseInterface,
} from '../commons/types'

import mockListProjects from './mock/listProjects.json'
import mockConfig from './mock/config.json'
import { LOCAL_STORAGE_KEY } from '../commons/constants';

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
  console.log('credentials: ', credentials);
  return mockConfig.data
}

export const fetchListProjects = async (filterObj: any): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  const res = await new Promise<ListResponseInterface<ProjectListItemInterface>>((resolve, reject) => {
    setTimeout(() => resolve(mockListProjects.data), 1000)
  })

  return res
}

export const fetchProjectById = async (projectId: string): Promise<ProjectDetailInterface> => {
  return {
    ...mockListProjects.data.results[0],
    accountId: '0013L000002aIFeQAM',
    contactId: '0033L0000023k2eQAA',
    regionId: 'a0M3L000000EEk4UAG',
    applyRegionForAllJob: true,
    isTemplate: true,
    account: {
      id: '0013L000002aIFeQAM',
      name: 'Account'
    }
  }
}

export const createProject = async (createInput: ProjectDetailInterface): Promise<ProjectDetailInterface> => {
  return salesforceApi.post('/sked/project', createInput)
}

export const updateProject = async (updateInput: ProjectDetailInterface): Promise<ProjectDetailInterface> => {
  return fetchProjectById(updateInput.id)
}

export const deleteProject = async (UID: string) => {
  console.log('delete uid: ', UID)
}

export const fetchTemplates = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const params = searchString ? { name: searchString } : {}
  const response: { data: SalesforceResponseInterface } = await salesforceApi.get('/services/apexrest/sked/projectTemplate', {
    params
  })
  if (response.data.success) {
    return response.data.data
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

export const setFilterSets = (filterSet: any) => {
  return window.localStorage.setItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET, JSON.stringify(filterSet))
}

export const getFilterSets = () => {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROJECT_FILTER_SET)
  return stored ? JSON.parse(stored) : []
}
