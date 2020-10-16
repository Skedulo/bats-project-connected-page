import { PageParams, Tag, Resource } from './common'
import { BaseModel } from './BaseObject'

export interface TeamFilterParams extends PageParams {
  regionIds?: string
  startDate: Date
  endDate: Date
}

export interface TeamRequirement {
  id: string
  name: string
  tags: BaseModel[]
  preferredResource: BaseModel
  allocations: TeamAllocation[]
}

export interface TeamAllocation {
  startDate: string
  startTime: number
  endDate: string
  endTime: string
  resource: Resource
}

export interface Team {
  id: string
  name: string
  region?: string
  regionId: string
  teamRequirements: TeamRequirement[]
}
