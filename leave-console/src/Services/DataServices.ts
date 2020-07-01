import axios from 'axios'
import { mapValues, isNumber, chunk, isEmpty, values, flatten } from 'lodash/fp'
import { Services, credentials } from './Services'
import {
  ISalesforceResponse,
  IListResponse,
  Region,
  FilterParams,
  ResourceRequirementRule,
  IBaseModel,
  IGenericOptionParams,
  IGenericSelectItem
} from '../Store/types'
import { toastMessage } from '../common/utils/toast'
import { ISelectItem } from '@skedulo/sked-ui'

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
  const res = await salesforceApi.get('/services/apexrest/sked/resourceRequirementRule', { params: { ...filterObj } })
  return res.data.data
}

export const createUpdateResourceRequirementRule = async (requestData: ResourceRequirementRule): Promise<boolean> => {
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
    console.log('error: ', error)
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