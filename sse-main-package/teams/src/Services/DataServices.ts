import axios from 'axios'

import { format } from 'date-fns'
import { omit, fromPairs, keyBy, zip, chunk } from 'lodash'

import { Subject, animationFrameScheduler } from 'rxjs'
import { bufferTime } from 'rxjs/operators'

import { TransformedListResponse, SalesforceResponse, BaseModel } from '../commons/types/BaseObject'
import getListTags from '../commons/queries/getListTags.gql'
import createTag from '../commons/queries/createTag.gql'
import {  MAX_GRAPHQL_MUTATION_SIZE } from '../commons/constants/page'

import { Services, credentials, GraphQLMutationResult } from './Services'
import { Config, GenericOptionParams, Resource } from '../commons/types'
import { ISelectItem } from '@skedulo/sked-ui'
import { Team, TeamFilterParams } from '../commons/types/Team'

const mockTeams=  [
  {
    "name": "Team A",
    "id": "a0X3L000000DtMxUAK",
    "regionId": '122',
    "teamRequirements": [
      {
        "name": "TRR-0001",
        "id": "a1M3L0000009GeuUAE",
        "tags": [
          {
            "name": "Driver",
            "id": "a0d3L000005ApdrQAC",
            "sObjectType": "sked__Tag__c"
          },
          {
            "name": "Full time",
            "id": "a0d3L000001yAbtQAE",
            "sObjectType": "sked__Tag__c"
          }
        ],
        "sObjectType": "sked_Team_Resource_Requirement__c",
        "preferredResource": {
          "name": "Skedulo Resource",
          "id": "a0X3L000000CvrfUAC"
        },
        "allocations": [
          {
            "startTime": 552,
            "startDate": "2020-10-12",
            "resource": {
              "name": "Skedulo Resource",
              "id": "a0X3L000000CvrfUAC",
              "category": "Full time"
            },
            "endTime": 552,
            "endDate": "2020-10-12"
          }
        ]
      }
    ]
  },
  {
    "name": "Team B",
    "id": "a0X3L000000DtMxkksK",
    "regionId": '122',
    "teamRequirements": [
      {
        "name": "TRR-0002",
        "id": "a1M3L0000009GeuU11",
        "tags": [
          {
            "name": "Driver",
            "id": "a0d3L000005ApdrQAC",
            "sObjectType": "sked__Tag__c"
          }
        ],
        "sObjectType": "sked_Team_Resource_Requirement__c",
        "preferredResource": {
          "name": "Skedulo Linh",
          "id": "a0X3L000000CvrsssAC"
        },
        "allocations": [
          {
            "startTime": 552,
            "startDate": "2020-10-12",
            "resource": {
              "name": "Skedulo Linh",
              "id": "a0X3L000000CvrsssAC"
            },
            "endTime": 552,
            "endDate": "2020-10-14"
          }
        ]
      },
      {
        "name": "TRR-0003",
        "id": "a1M3L0000009dssuU11",
        "tags": [
          {
            "name": "Full time",
            "id": "a0d3L00000ssApdrQAC",
            "sObjectType": "sked__Tag__c"
          }
        ],
        "sObjectType": "sked_Team_Resource_Requirement__c",
        "preferredResource": {
          "name": "Skedulo Linh 2",
          "id": "a0X3L000000CvrsssAC"
        },
        "allocations": [
          {
            "startTime": 552,
            "startDate": "2020-10-16",
            "resource": {
              "name": "Skedulo Linh 2",
              "id": "a0X3L000000CvrsssAC"
            },
            "endTime": 552,
            "endDate": "2020-10-17"
          }
        ]
      }
    ]
  }
]

const httpApi = axios.create({
  baseURL: credentials.apiServer,
  headers: {
    Authorization: `Bearer ${credentials.apiAccessToken}`
  }
})

const salesforceApi = axios.create({
  baseURL: credentials.vendor.url,
  headers: {
    Authorization: `Bearer ${credentials.vendor.token}`,
  },
})

interface GraphqlResponse<T extends object = object> {
  data: T
  schema?: { [operationName: string]: string }
  errors?: object[]
}

type GraphQlResolveFn<T extends object = object> = (response: GraphqlResponse<T>) => void

interface GraphQlRequest<T extends object = object> {
  resolve: GraphQlResolveFn<T>
  request: {
    query: string
    variables?: object
  }
}

const graphQlRequest$ = new Subject<GraphQlRequest>()

graphQlRequest$
  .pipe(bufferTime(0, animationFrameScheduler))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .subscribe(async data => {
    if (!data.length) {
      return
    }
    const requests = data.map(({ request }) => request)
    const resolves = data.map(({ resolve }) => resolve)
    const { data: responses } = await httpApi.post<GraphqlResponse[]>('/graphql/graphql/batch', requests)

    zip(resolves, responses).forEach(([resolve, response]) => {
      if (resolve && response) {
        resolve(response)
      }
    })
  })

// eslint-disable-next-line @typescript-eslint/promise-function-async
const makeBatchGraphQlRequest = (query: string, variables?: object) => new Promise<GraphqlResponse>(resolve => {
  graphQlRequest$.next({
    resolve,
    request: {
      query,
      variables
    }
  })
})

export const fetchConfig = async (): Promise<Config> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
}

export const fetchGenericOptions = async (params: GenericOptionParams): Promise<ISelectItem[]> => {
  try {
    const response: { data: SalesforceResponse<{ results: BaseModel[] }> } = await salesforceApi.get('/services/apexrest/sked/genericQuery', {
      params,
    })
    return response.data.data.results.map((item: BaseModel) => ({ ...item, value: item.id, label: item.name }))
  } catch (error) {
    return []
  }
}

export const fetchResourcesByRegion = async (regionIds: string): Promise<Resource[]> => {
  try {
    const res: { data: SalesforceResponse<{ results: Resource[] }> } = await salesforceApi.get('/services/apexrest/sked/resource', { params: {
      regionIds
    } })

    return res.data.data.results
  } catch (error) {
    return []
  }
}

export const fetchTeams = async (filterParams: TeamFilterParams): Promise<Team[]> => {
  try {
    // const res: { data: SalesforceResponse<{ results: Resource[] }> } = await salesforceApi.get('/services/apexrest/sked/resource', { params: {
    //   regionIds
    // } })

    return mockTeams
  } catch (error) {
    return []
  }
}