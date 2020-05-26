import axios from 'axios'
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
  // return {
  //   account: { name: 'sked test account', id: '0013L000002aIFeQAM' },
  //   address: '123',
  //   applyAccountForAllJob: false,
  //   applyContactForAllJob: false,
  //   applyLocationForAllJob: false,
  //   applyRegionForAllJob: false,
  //   contact: { name: 'sked test contact', id: '0033L0000023k2eQAA' },
  //   endDate: '2020-05-31',
  //   id: 'a103L0000008Yi4QAE',
  //   isTemplate: false,
  //   location: { name: 'Sked Location', id: 'a0I3L0000005Bq2UAE' },
  //   name: 'Sked test',
  //   projectDescription: 'linh test',
  //   projectName: 'Sked test',
  //   region: { name: 'Thames Valley', id: 'a0M3L000000EEk4UAG' },
  //   startDate: '2020-05-28',
  // }

  const params = { projectId };
  const response: { data: SalesforceResponseInterface } = await salesforceApi.get(
    '/services/apexrest/sked/project',
    {
      params,
    }
  )
  const result = response.data.data;
  result.contactId = result.contact?.id;
  result.accountId = result.account?.id;
  result.locationId = result.location?.id;
  result.regionId = result.region?.id;
  return result;
}

export const updateProject = async (
  requestData: ProjectDetailInterface
): Promise<ProjectListItemInterface> => {
  const response: {
    data: SalesforceResponseInterface
  } = await salesforceApi.post('/services/apexrest/sked/project', requestData)

  return fetchProjectById(requestData.id)
}

export const createProject = async (
  createInput: ProjectDetailInterface
): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  const response: {
    data: SalesforceResponseInterface
  } = await salesforceApi.post('/services/apexrest/sked/project', createInput)

  return fetchListProjects(DEFAULT_FILTER)
}

export const deleteProject = async (UID: string) => {
  console.log('delete uid: ', UID)
}

export const fetchTemplates = async (searchString: string): Promise<LookupOptionInterface[]> => {
  const params = searchString ? { name: searchString } : {}
  const response: { data: SalesforceResponseInterface } = await salesforceApi.get(
    '/services/apexrest/sked/projectTemplate',
    {
      params,
    }
  )
  if (response.data.success) {
    return response.data.data.map((item: ProjectDetailInterface) => ({ UID: item.id, Name: item.projectName }))
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
