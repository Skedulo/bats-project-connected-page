import { Reducer } from 'redux'

import { State } from '../commons/types'
import { DEFAULT_SWIMLANE_SETTING } from '../commons/constants'

import { ActionType, AppAction } from './action'

const DEFAULT_STATE: State = {
  config: {},
  loading: false,
  showResourceSidebar: true,
  swimlaneSetting: DEFAULT_SWIMLANE_SETTING,
  resources: [],
  shouldReloadTeams: false,
  allocatedTeamRequirement: null,
  dateRange: [],
  selectedSlot: null,
  suggestions: {}
}

const reducer: Reducer<State, AppAction> = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case ActionType.UPDATE_CONFIG: {
      return {
        ...state,
        config: action.payload
      }
    }

    case ActionType.START_LOADING: {
      return {
        ...state,
        loading: true
      }
    }

    case ActionType.END_LOADING: {
      return {
        ...state,
        loading: false
      }
    }

    case ActionType.TOGGLE_RESOURCE_SIDEBAR: {
      return {
        ...state,
        showResourceSidebar: !state.showResourceSidebar
      }
    }

    case ActionType.UPDATE_SWIMLANE_SETTING: {
      return {
        ...state,
        swimlaneSetting: action.payload
      }
    }

    case ActionType.UPDATE_RESOURCES: {
      return {
        ...state,
        resources: action.payload
      }
    }

    case ActionType.UPDATE_RELOAD_TEAMS_FLAG: {
      return {
        ...state,
        shouldReloadTeams: action.payload
      }
    }

    case ActionType.UPDATE_ALLOCATED_TEAM_REQUIREMENT: {
      return {
        ...state,
        allocatedTeamRequirement: action.payload
      }
    }

    case ActionType.UPDATE_DATE_RANGE: {
      return {
        ...state,
        dateRange: action.payload
      }
    }

    case ActionType.UPDATE_SELECTED_SLOT: {
      return {
        ...state,
        selectedSlot: action.payload
      }
    }

    case ActionType.UPDATE_SUGGESTIONS: {
      return {
        ...state,
        suggestions: action.payload
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
