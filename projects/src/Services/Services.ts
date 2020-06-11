interface IGraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
  context?: Record<string, any>
  extensions?: Record<string, any>
}

export interface IGraphQLMutationResult {
  data: null | { schema: { [operationName: string]: string } }
  errors: null | {
    message: string
    path?: string[]
    locations?: { line: number, column: number }[]
  }[]
}

// tslint:disable:no-misused-new
interface IGraphQLError {
  getErrors: () => string[]
  new(): IGraphQLError
}

type Model = string

interface IIntrospectionField {
  name: string
  type: {
    name: null | 'Instant' | 'Boolean' | 'BigDecimal' | 'String' | Model
    kind: 'SCALAR' | 'NON_NULL' | 'OBJECT' | 'LIST'
    ofType: null | IIntrospectionField['type']
  }
}

interface IIntrospectionModelType {
  __type: {
    name: string
    fields: IIntrospectionField[]
  }
}

export interface IVocabulary {
  [schema: string]: {
    [field: string]: {
      value: string,
      label: string
    }[]
  }
}

export interface IVocabularyField {
  controllingField: string,
  label: string,
  controller: string,
  defaultValue: boolean,
  value: string,
  validFor: string[],
  active: boolean
}

export interface IServices {
  graphQL: {
    fetch<T>(operation: IGraphQLRequest, endpoint?: string): Promise<T>
    mutate(operation: IGraphQLRequest, endpoint?: string): Promise<IGraphQLMutationResult>
    fetchMetadataFor(model: string): Promise<IIntrospectionModelType>
  },
  metadata: {
    fetchVocabulary(): Promise<IVocabulary>,
    fetchIVocabularyField(object: string, field: string): Promise<IVocabularyField[]>
  },
  errorClasses: {
    GraphQLNetworkError: IGraphQLError,
    GraphQLExecutionError: IGraphQLError
  },
}

export interface IProfile {
  tenantId: string
  userId: string
  username: string
  roles: string[]
}

export interface ICredentials {
  apiServer: string
  apiAccessToken: string

  vendor: { type: 'skedulo', url: string, token: null } | { type: 'salesforce', url: string, token: string }
}

export interface INavigation {
  registerRouteHandler: (routeHandler: (routeState: {
    routes: string | string[],
    params: { [paramName: string]: any }
  }) => void) => void
  setParentRoute: (route: string) => void
}

declare const skedInjected: {
  Services: IServices,
  context?: {
    referenceUID: string
  },
  params: { [paramName: string]: any }
  profile: IProfile,
  credentials: ICredentials
  navigation: INavigation,
  routes: string[]
}

export const Services = skedInjected.Services
export const context = skedInjected.context
export const params = skedInjected.params
export const profile = skedInjected.profile
export const credentials = skedInjected.credentials
export const navigation = skedInjected.navigation
export const routes = skedInjected.routes
