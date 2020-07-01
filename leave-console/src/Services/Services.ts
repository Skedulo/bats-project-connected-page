
export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
  context?: Record<string, any>
  extensions?: Record<string, any>
}

export interface GraphQLMutationResult {
  data: null | { schema: { [operationName: string]: string } }
  errors: null | {
    message: string
    path?: string[]
    locations?: { line: number, column: number }[]
  }[]
}

interface GraphQLError {
  getErrors: () => string[]
  // tslint:disable:no-misused-new
  new(): GraphQLError
}

type Model = string

interface IntrospectionField {
  name: string
  type: {
    name: null | 'Instant' | 'Boolean' | 'BigDecimal' | 'String' | Model
    kind: 'SCALAR' | 'NON_NULL' | 'OBJECT' | 'LIST'
    ofType: null | IntrospectionField['type']
  }
}

interface IntrospectionModelType {
  __type: {
    name: string
    fields: IntrospectionField[]
  }
}

export interface Vocabulary {
  [schema: string]: {
    [field: string]: {
      value: string,
      label: string
    }[]
  }
}

export interface Services {
  graphQL: {
    fetch<T>(operation: GraphQLRequest, endpoint?: string): Promise<T>
    mutate<T = GraphQLMutationResult>(operation: GraphQLRequest, endpoint?: string): Promise<T>
    fetchMetadataFor(model: string): Promise<IntrospectionModelType>
  }
  metadata: {
    fetchVocabulary(): Promise<Vocabulary>
    _apiService: { get<T>(endpoint: string, options?: {}): Promise<T> }
    fetchCurrentUserMetadata(): Promise<{ id: string }>
  }
  errorClasses: {
    GraphQLNetworkError: GraphQLError,
    GraphQLExecutionError: GraphQLError
  }
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
  Services: Services,
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
