import { Services, GraphQLMutationResult } from './Services'
import {
  ProjectListItemInterface,
  ProjectDetailInterface,
  ListResponseInterface,
  LookupOptionInterface,
  ContactOptionInterface,
} from '../commons/types'

import mockListProjects from './mock/listProjects.json'

export const fetchListProjects = async (filterObj: any): Promise<ListResponseInterface<ProjectListItemInterface>> => {
  return mockListProjects.data
}

export const fetchProjectById = async (projectId: string): Promise<ProjectDetailInterface> => {
  return {
    ...mockListProjects.data.results[0],
    accountId: '0013L000002aIFeQAM',
    contactId: '0033L0000023k2eQAA',
    regionId: 'a0M3L000000EEk4UAG',
    applyRegionForAllJob: true,
    isTemplate: true
  }
}

export const updateProject = async (updateInput: ProjectDetailInterface): Promise<ProjectDetailInterface> => {
  return fetchProjectById(updateInput.id)
}

export const deleteProject = async (UID: string) => {
  console.log('delete uid: ', UID)
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
      filter: `Name LIKE '%${searchString}%' OR UID == '${searchString}'`,
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
      filter: `FullName LIKE '%${searchString}%' OR UID == '${searchString}'`,
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
      filter: `Name LIKE '%${searchString}%' OR UID == '${searchString}'`,
    },
  })

  return response.regions
}
