import { PageParams, Resource, Period } from './common'
import { BaseModel } from './BaseObject'

export interface TeamFilterParams extends PageParams {
  regionIds?: string
  startDate: Date
  endDate: Date
}

export interface TeamResourceParams {
  tagIds: string
  regionIds: string
  startDate: string
  endDate: string
  timezoneSid?: string
}

export interface TeamRequirement {
  id?: string
  name?: string
  tags?: {
    id?: string
    name?: string
    tagId?: string
    tag?: BaseModel
  }[]
  preferredResource?: BaseModel
  preferredResourceId?: string
  allocations?: TeamAllocation[]
  teamName?: string
  timezoneSid?: string
  teamId?: string
  regionId?: string
}

export interface TeamAllocation {
  name?: string
  startDate: string
  startTime?: number
  endDate: string
  endTime?: number
  resource?: Resource
  resourceId?: string
  teamLeader?: boolean
  teamName?: string
  isAvailable?: boolean
  teamRequirementId?: string
  timezoneSid?: string
  teamId?: string
  id?: string
  unavailabilities?: Period[]
  isPlanning?: boolean
  isConflict?: boolean
  conflicts?: Array<{
    id: string
    name: string
    startDate: string
    endDate: string
    team: Team
  }>
}

export interface Team {
  id: string
  name: string
  region?: BaseModel
  regionId: string
  teamRequirements: TeamRequirement[]
  teamColour?: string
}

export interface TeamSuggestionParams {
  regionIds: string
  resource: BaseModel
  startDate: string
  endDate: string
  resourceId?: string
  timezoneSid: string
  // tagIds: string
  teamRequirementId?: string
}

export interface TeamSuggestion {
  id: string
  name: string
  availabilities: TeamSuggestionPeriod[]
}

export interface TeamSuggestionPeriod {
  startDate: Date
  endDate: Date
  resource: BaseModel
}

export interface TeamAllocationState extends TeamAllocation {
  startDateObj: Date
  endDateObj: Date
}
