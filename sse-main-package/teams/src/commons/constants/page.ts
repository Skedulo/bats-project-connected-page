export const DEFAULT_FILTER = {
  pageSize: 20,
  pageNumber: 1,
  searchText: ''
}

export const ROLE = {
  ADMIN: 'administrator'
}

export const DEFAULT_LIST = {
  data: [],
  hasNextPage: false,
  totalCount: 0
}

export const MAX_GRAPHQL_MUTATION_SIZE = 200
export const MAX_GRAPHQL_FETCH_SIZE = 200

export const DEFAULT_SWIMLANE_SETTING = {
  workingHours: {
    startTime: 800,
    endTime: 1800,
    days: {
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true
    }
  }
}
