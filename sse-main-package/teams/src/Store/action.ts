import { Config, SwimlaneSetting, Resource } from '../commons/types'
import { Action } from 'redux'

export enum ActionType {
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  START_LOADING = 'START_LOADING',
  END_LOADING = 'END_LOADING',
  TOGGLE_RESOURCE_SIDEBAR = 'TOGGLE_RESOURCE_SIDEBAR',
  UPDATE_SWIMLANE_SETTING = 'UPDATE_SWIMLANE_SETTING',
  UPDATE_RESOURCES = 'UPDATE_RESOURCES'
}

interface UpdateConfig extends Action {
  type: ActionType.UPDATE_CONFIG
  payload: Config
}

interface StartLoading extends Action {
  type: ActionType.START_LOADING
}

interface EndLoading extends Action {
  type: ActionType.END_LOADING
}

interface ToggleResourceSidebar extends Action {
  type: ActionType.TOGGLE_RESOURCE_SIDEBAR
}

interface UpdateSwimlaneSetting extends Action {
  type: ActionType.UPDATE_SWIMLANE_SETTING
  payload: SwimlaneSetting
}

interface UpdateResources extends Action {
  type: ActionType.UPDATE_RESOURCES
  payload: Resource[]
}

export type AppAction =
  | StartLoading
  | EndLoading
  | UpdateConfig
  | ToggleResourceSidebar
  | UpdateSwimlaneSetting
  | UpdateResources

export const updateConfig = (payload: Config) => {
  return {
    type: ActionType.UPDATE_CONFIG,
    payload: payload
  }
}

export const startLoading = () => {
  return {
    type: ActionType.START_LOADING
  }
}

export const endLoading = () => {
  return {
    type: ActionType.END_LOADING
  }
}

export const toggleResourceSidebar = () => {
  return {
    type: ActionType.TOGGLE_RESOURCE_SIDEBAR
  }
}

export const updateSwimlaneSetting = (payload: SwimlaneSetting) => {
  return {
    type: ActionType.UPDATE_SWIMLANE_SETTING,
    payload: payload
  }
}

export const updateResources = (payload: Resource[]) => {
  return {
    type: ActionType.UPDATE_RESOURCES,
    payload: payload
  }
}
