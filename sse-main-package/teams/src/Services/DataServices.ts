import axios from 'axios'

import { format } from 'date-fns'
import { zip, omit } from 'lodash'

import { Subject, animationFrameScheduler } from 'rxjs'
import { bufferTime } from 'rxjs/operators'
import { ISelectItem } from '@skedulo/sked-ui'

import { SalesforceResponse, BaseModel } from '../commons/types/BaseObject'
import { Config, GenericOptionParams, Resource } from '../commons/types'
import { Team, TeamFilterParams, TeamAllocation, TeamSuggestionParams, TeamSuggestion, TeamResourceParams } from '../commons/types/Team'
import { DATE_FORMAT } from '../commons/constants'

import { credentials } from './Services'

const httpApi = axios.create({
  baseURL: credentials.apiServer,
  headers: {
    Authorization: `Bearer ${credentials.apiAccessToken}`
  }
})

const salesforceApi = axios.create({
  baseURL: credentials.vendor.url,
  headers: {
    Authorization: `Bearer ${credentials.vendor.token || ''}`
  }
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

export const fetchConfig = async (): Promise<Config> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
}

export const fetchGenericOptions = async (params: GenericOptionParams): Promise<ISelectItem[]> => {
  try {
    const response: { data: SalesforceResponse<{ results: BaseModel[] }> } = await salesforceApi.get('/services/apexrest/sked/genericQuery', {
      params
    })
    return response.data.data.results.map((item: BaseModel) => ({ ...item, value: item.id, label: item.name }))
  } catch (error) {
    return []
  }
}

export const fetchResourcesByRegion = async (regionIds: string): Promise<Resource[]> => {
  try {
    const res: { data: SalesforceResponse<{ results: Resource[] }> } = await salesforceApi.get('/services/apexrest/sked/resource', {
      params: {
        regionIds
      }
    })

    return res.data.data.results
  } catch (error) {
    return []
  }
}

export const fetchTeams = async (filterParams: TeamFilterParams): Promise<{ data: Team[], totalCount: number }> => {
  try {
    const res: {
      data: SalesforceResponse<{
        totalItems: number
        results: Team[]
      }>
    } = await salesforceApi.get('/services/apexrest/sked/team', {
      params: {
        regionIds: filterParams.regionIds,
        name: filterParams.searchText,
        startDate: format(filterParams.startDate, DATE_FORMAT),
        endDate: format(filterParams.endDate, DATE_FORMAT),
        pageNumber: filterParams.pageNumber,
        pageSize: filterParams.pageSize
      }
    })

    return {
      totalCount: res.data.data.totalItems,
      data: res.data.data.results.map(team => ({
        ...team,
        teamRequirements: team.teamRequirements.map(item => ({
          ...item,
          teamName: team.name,
          teamId: team.id,
          regionId: team.region?.id
        }))
      }))
    }
  } catch (error) {
    return {
      totalCount: 0,
      data: []
    }
  }
}

export const createUpdateTeam = async (saveData: Team): Promise<boolean> => {
  // const formattedPayload = mapValues(value => (value === '' ? null : value), saveData)

  try {
    const response: {
      data: SalesforceResponse<{}>
    } = await salesforceApi.post('/services/apexrest/sked/team', saveData)
    return response.data.success
  } catch (error) {
    return false
  }
}

export const getTeamSuggestions = async (filterParams: TeamSuggestionParams): Promise<TeamSuggestion[]> => {
  // const formattedPayload = mapValues(value => (value === '' ? null : value), saveData)

  try {
    const response: {
      data: SalesforceResponse<TeamSuggestion[]>
    } = await salesforceApi.get('/services/apexrest/sked/teamResource/suggestion', {
      params: omit(filterParams, 'resource')
    })
    return response.data.data.map(item => ({
      ...item,
      availabilities: item.availabilities.map(period => ({
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
        resource: filterParams.resource
      }))
    }))
  } catch (error) {
    return []
  }
}

export const getTeamResources = async (filterParams: TeamResourceParams): Promise<Resource[]> => {
  // const formattedPayload = mapValues(value => (value === '' ? null : value), saveData)

  try {
    const response: {
      data: SalesforceResponse<TeamSuggestion[]>
    } = await salesforceApi.get('/services/apexrest/sked/teamResource', {
      params: filterParams
    })
    return response.data.data.map(item => ({
      ...item
    }))
  } catch (error) {
    return []
  }
}

export const allocateTeamMember = async (saveData: TeamAllocation): Promise<boolean> => {
  try {
    const response: {
      data: SalesforceResponse<{}>
    } = await salesforceApi.post('/services/apexrest/sked/team/allocate', saveData)
    return response.data.success
  } catch (error) {
    return false
  }
}
