import { UID, Region, ResourceRegion, ResourceTag } from '.'
import { JobAllocation } from './JobAllocation'
import { IBaseModel } from './common'

export interface Resource {
  UID: string
  Name: string
  ResourceTags: ResourceTag[],
  ResourceRegions: ResourceRegion[],
  PrimaryRegion: Region,
  User: {
    UID: UID
    SmallPhotoUrl: string
    FullPhotoUrl: string
  }
  Email: string
  ResourceType: string
  Category: string
  Alias: string
  JobAllocations: JobAllocation[]
  CoreSkill: string
  Depot: {
    UID: UID
    Name: string
  }
}

export enum ResourceSortType {
  BestFit = 'bestFit',
  Name = 'name',
  Rating = 'rating',
  Tags = 'tags',
  TravelDistanceFromHome = 'travelDistanceFromHome',
  TravelDurationFromHome = 'travelDurationFromHome',
  Utilised = 'utilized'
}

export interface IResourceSuggestion {
  score: {
    soft: number
  }
  travel: {
    distanceFromHome: number
    durationFromHome: number
  }
  currentCapacityInSeconds: number
}

export interface IResource {
  id: string
  name: string
  rating?: number
  category?: string
  avatarUrl?: string
  coreSkill?: string
  depot?: IBaseModel
  suggestion?: IResourceSuggestion
  isSuggested: boolean
  annualLeaveRemaining?: number
  annualLeaveAllowance?: number
}
