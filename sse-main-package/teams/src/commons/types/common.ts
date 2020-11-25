import { BaseModel } from './BaseObject'
import { ISelectItem } from '@skedulo/sked-ui'
import { TeamAllocation, TeamRequirement, TeamSuggestion, TeamSuggestionPeriod } from './Team'

export interface PicklistItem {
  value: string
  label: string
  active: boolean
}

export interface Vocabulary {
  groups: PicklistItem[]
}

export interface RouterParams {
  processId: string
}

export interface PageParams {
  pageSize: number
  pageNumber: number
  searchText: string
  orderBy?: string
  offset?: number
}

export interface SelectedSlot {
  startDate: Date
  endDate: Date
  resource?: Resource
  id?: string
  teamLeader?: boolean
}

export interface State {
  config: Config
  loading: boolean
  showResourceSidebar: boolean
  swimlaneSetting: SwimlaneSetting
  resources: Resource[]
  shouldReloadTeams: boolean
  allocatedTeamRequirement: TeamRequirement | null
  selectedPeriod: Period
  selectedSlot: SelectedSlot | null
  suggestions: Record<string, TeamSuggestion>
}

export interface ObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface Tag extends BaseModel {
  required?: boolean
}

export interface Config extends OrgPreference {
  jobTypes?: BaseModel[],
  jobStatuses?: BaseModel[],
  projectStatuses?: BaseModel[],
  objPermissions?: {
    Project: BaseModel
    // ProjectJobTemplate: IObjPermission
  }
  jobTypeTemplates?: BaseModel[]
  constraintTypes?: BaseModel[]
  dependencyTypes?: BaseModel[]
  coreSkills?: BaseModel[]
  regions?: BaseModel[]
}

export enum GenericOptionObjects {
  Account,
  Contact,
  sked__Region__c,
  sked__Location__c,
  sked__Resource__c,
  sked__Tag__c
}

export declare type GenericObjectTypes = keyof typeof GenericOptionObjects

export interface GenericOptionParams {
  sObjectType: GenericObjectTypes
  name: string
  accountIds?: string
  regionIds?: string
  tagIds?: string
}

export interface GenericSelectItem extends ISelectItem {
  account?: BaseModel
  contact?: BaseModel
  region?: BaseModel
  fieldName?: string
}

export interface ITimeOption {
  stringValue: string
  numberValue: number
  boundValue: number
}

export interface OrgPreference {
  enableWorkingHours?: boolean
}

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface WorkingHours {
  enabled?: boolean,
  startTime: number,
  endTime: number
  days: Record<WeekDay, boolean>
}

export interface SwimlaneSetting {
  workingHours: WorkingHours
}

export interface IUser {
  SmallPhotoUrl: string
}

export interface Unavailability {
  endDate: string
  id: string
  startDate: string
  name: string
}

export interface Availability {
  endDate: string
  id: string
  startDate: string
  name: string
}

export interface Resource {
  id: string
  name: string
  rating?: number
  category?: string
  avatarUrl?: string
  tags?: BaseModel[]
  region?: {
    id: string
    name: string
    timezoneSid: string
  }
  allocations?: TeamAllocation[]
  unavailabilities?: Unavailability[]
  availabilities?: TeamSuggestionPeriod[]
}

export interface Period {
  startDate: Date
  endDate: Date
}