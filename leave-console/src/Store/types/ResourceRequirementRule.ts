import { IBaseModel, Weekdays } from './common'

export interface ResourceRequirementRule extends Weekdays {
  id: string
  regionId: string
  region: IBaseModel
  startDate: string
  endDate: string
  coreSkill: string
  numberOfResources: number
  depot?: IBaseModel
  depotId?: string
  description: string
  category?: string
  categoryId: string
}

export interface Depot {
  isDepot?: boolean
}
