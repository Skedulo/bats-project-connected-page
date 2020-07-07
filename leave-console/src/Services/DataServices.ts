import axios from 'axios'
import { mapValues, isNumber, chunk, isEmpty, values, flatten } from 'lodash/fp'
import { utcToZonedTime } from 'date-fns-tz'
import { Services, credentials } from './Services'
import {
  ISalesforceResponse,
  IListResponse,
  Region,
  FilterParams,
  ResourceRequirementRule,
  IBaseModel,
  IGenericOptionParams,
  IGenericSelectItem,
  IConfig,
  IResource,
  IGraphqlBaseModal
} from '../Store/types'
import { toastMessage } from '../common/utils/toast'
import { ISelectItem } from '@skedulo/sked-ui'
import { format } from 'date-fns';
import { DATE_FORMAT, TIME_FORMAT } from '../common/constants'
import { parseTimeString } from '../common/utils/dateTimeHelpers'
import { LocationsQuery } from '../Store/queries'

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

export const fetchResourceRequirementRules = async (filterObj: FilterParams):
  Promise<IListResponse<ResourceRequirementRule>> => {
  try {
    const res = await salesforceApi.get('/services/apexrest/sked/resourceRequirementRule', { params: { ...filterObj } })
    return res.data.data
  } catch (error) {
    return {
      totalItems: 0,
      results: []
    }
  }
}

export const createUpdateResourceRequirementRule = async (requestData: Partial<ResourceRequirementRule>): Promise<boolean> => {
  try {
    const formattedPayload = mapValues(value => (value === '' ? null : value), requestData)
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.post('/services/apexrest/sked/resourceRequirementRule', formattedPayload)

    return response.data.success
  } catch (error) {
    toastMessage.error('Saved unsuccessfully!')
    return false
  }
}

export const deleteResourceRequirementRule = async (uids: string): Promise<boolean> => {
  try {
    const response: {
      data: ISalesforceResponse
    } = await salesforceApi.delete('/services/apexrest/sked/resourceRequirementRule', {
      params: { ids: uids },
    })

    return response.data.success
  } catch (error) {
    toastMessage.error('Deleted unsuccessfully!')
    return false
  }
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

export const fetchConfig = async (): Promise<IConfig> => {
  const res = await salesforceApi.get('/services/apexrest/sked/config')
  return res.data.data
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
      regionIds,
      resourceIds: ids,
      start: scheduleStart,
      end: scheduleEnd,
      availability: true,
      unavailability: true
    }))
    const responses = await Promise.all(promises)
    const availabilities: Record<string, { start: string, end: string }[]> = {}
    responses.forEach(r => {
      const result = r.data.result
      Object.keys(result).forEach(id => {
        availabilities[id] = result[id]
      })
    })
    return availabilities
  } catch (error) {
    return {}
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

export const fetchDepotByRegion = async (regionId: string): Promise<IBaseModel[]> => {
  try {
    const resp = await Services.graphQL.fetch<{ locations: IGraphqlBaseModal[] }>({
      query: LocationsQuery,
      variables: {
        filters: `IsDepot == true AND RegionId == '${regionId}'`
      }
    })

    return resp.locations.map(item => ({ id: item.UID, name: item.Name }))
  } catch (error) {
    return []
  }
}
