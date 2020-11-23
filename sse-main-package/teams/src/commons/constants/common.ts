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

export const STORAGE_KEY = {
  TEAM_SWIMLANE_SETTING: 'TEAM_SWIMLANE_SETTING'
}

export const DEFAULT_PALETTE_COLORS = [
  '#e6194B',
  '#f58231',
  '#ffe119',
  '#bfef45',
  '#3cb44b',
  '#42d4f4',
  '#4363d8',
  '#911eb4',
  '#f032e6',
  '#000'
]
