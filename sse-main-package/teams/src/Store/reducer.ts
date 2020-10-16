import { State, Config } from '../commons/types'
import { ActionType, AppAction } from './action'
import { Reducer } from 'redux'
import { DEFAULT_SWIMLANE_SETTING } from '../commons/constants'

const DEFAULT_STATE: State = {
  config: {},
  loading: false,
  showResourceSidebar: true,
  swimlaneSetting: DEFAULT_SWIMLANE_SETTING,
  resources: []
}

const reducer: Reducer<State, AppAction> = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case ActionType.UPDATE_CONFIG: {
      return {
        ...state,
        config: action.payload,
      }
    }

    case ActionType.START_LOADING: {
      return {
        ...state,
        loading: true,
      }
    }

    case ActionType.END_LOADING: {
      return {
        ...state,
        loading: false,
      }
    }

    case ActionType.TOGGLE_RESOURCE_SIDEBAR: {
      return {
        ...state,
        showResourceSidebar: !state.showResourceSidebar,
      }
    }

    case ActionType.UPDATE_SWIMLANE_SETTING: {
      return {
        ...state,
        swimlaneSetting: action.payload,
      }
    }

    case ActionType.UPDATE_RESOURCES: {
      return {
        ...state,
        resources: action.payload,
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
