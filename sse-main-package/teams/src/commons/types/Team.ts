import { PageParams, Resource, Period } from './common'
import { BaseModel } from './BaseObject'

export interface TeamFilterParams extends PageParams {
  regionIds?: string
  startDate: Date
  endDate: Date
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
}

export interface TeamAllocation {
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
  unavailabilityPeriods?: Period[]
  isPlanning?: boolean
}

export interface Team {
  id: string
  name: string
  region?: string
  regionId: string
  teamRequirements: TeamRequirement[]
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
  periods: TeamSuggestionPeriod[]
}

export interface TeamSuggestionPeriod {
  startDate: Date
  endDate: Date
  resource: BaseModel
}