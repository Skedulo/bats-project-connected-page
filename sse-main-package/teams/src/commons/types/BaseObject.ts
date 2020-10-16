export interface GraphqlListResponse<T> {
  totalCount: number
  edges: Array<{
    cursor: string
    node: T
  }>
  pageInfo: {
    hasNextPage: boolean
  }
}

export interface TransformedListResponse<T> {
  data: T[]
  hasNextPage: boolean
  totalCount: number
}

export interface BaseModel {
  name: string
  id: string
}

export interface SalesforceResponse<T> {
  pageNumber: number
  pageSize: number
  totalItems: number
  data: T
  results?: any
  success: boolean
  message: string
  devMessage: string
  errorMessage: number
  code: number
}
