import { Action } from 'redux'

import { Config, SwimlaneSetting, Resource, TeamAllocation, TeamRequirement, SelectedSlot, TeamSuggestion } from '../commons/types'

export enum ActionType {
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  START_LOADING = 'START_LOADING',
  END_LOADING = 'END_LOADING',
  TOGGLE_RESOURCE_SIDEBAR = 'TOGGLE_RESOURCE_SIDEBAR',
  UPDATE_SWIMLANE_SETTING = 'UPDATE_SWIMLANE_SETTING',
  UPDATE_RESOURCES = 'UPDATE_RESOURCES',
  UPDATE_RELOAD_TEAMS_FLAG = 'UPDATE_RELOAD_TEAMS_FLAG',
  UPDATE_ALLOCATED_TEAM_REQUIREMENT = 'UPDATE_ALLOCATED_TEAM_REQUIREMENT',
  UPDATE_DATE_RANGE = 'UPDATE_DATE_RANGE',
  UPDATE_SELECTED_SLOT = 'UPDATE_SELECTED_SLOT',
  UPDATE_SUGGESTIONS = 'UPDATE_SUGGESTIONS'
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

interface UpdateReloadTeamsFlag extends Action {
  type: ActionType.UPDATE_RELOAD_TEAMS_FLAG
  payload: boolean
}

interface UpdateAllocatedTeamRequirement extends Action {
  type: ActionType.UPDATE_ALLOCATED_TEAM_REQUIREMENT
  payload: TeamAllocation | null
}

interface UpdateDateRange extends Action {
  type: ActionType.UPDATE_DATE_RANGE
  payload: Date[]
}

interface UpdateSelectedSlot extends Action {
  type: ActionType.UPDATE_SELECTED_SLOT
  payload: SelectedSlot | null
}

interface UpdateSuggestions extends Action {
  type: ActionType.UPDATE_SUGGESTIONS
  payload: Record<string, TeamSuggestion>
}

export type AppAction =
  | StartLoading
  | EndLoading
  | UpdateConfig
  | ToggleResourceSidebar
  | UpdateSwimlaneSetting
  | UpdateResources
  | UpdateReloadTeamsFlag
  | UpdateAllocatedTeamRequirement
  | UpdateDateRange
  | UpdateSelectedSlot
  | UpdateSuggestions

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

export const updateReloadTeamsFlag = (payload: boolean) => {
  return {
    type: ActionType.UPDATE_RELOAD_TEAMS_FLAG,
    payload: payload
  }
}

export const updateAllocatedTeamRequirement = (payload: TeamRequirement | null) => {
  return {
    type: ActionType.UPDATE_ALLOCATED_TEAM_REQUIREMENT,
    payload: payload
  }
}

export const updateDateRange = (payload: Date[]) => {
  return {
    type: ActionType.UPDATE_DATE_RANGE,
    payload: payload
  }
}

export const updateSelectedSlot = (payload: SelectedSlot | null) => {
  return {
    type: ActionType.UPDATE_SELECTED_SLOT,
    payload: payload
  }
}

export const updateSuggestions = (payload: Record<string, TeamSuggestion>) => {
  return {
    type: ActionType.UPDATE_SUGGESTIONS,
    payload: payload
  }
}
