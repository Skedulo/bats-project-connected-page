export const LOCAL_STORAGE_KEY = {
  PROJECT_FILTER_SET: 'PROJECT_FILTER_SET',
  PROJECT_SWIMLANE_SETTINGS: 'PROJECT_SWIMLANE_SETTINGS'
}

export const DEFAULT_FILTER = {
  pageNumber: 1,
  pageSize: 20
}

export const DEFAULT_LIST = {
  results: [],
  totalItems: 0,
}

export const DEFAULT_SWIMLANE_SETTINGS = {
  snapUnitConsole: 5,
  workingHours: {
    enabled: false,
    startTime: 800,
    endTime: 1800,
    days: {
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
    }
  }
}
