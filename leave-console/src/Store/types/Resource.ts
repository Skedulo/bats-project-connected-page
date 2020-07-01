import { UID, Region, ResourceRegion, ResourceTag } from '.'
import { JobAllocation } from './JobAllocation'

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
}
