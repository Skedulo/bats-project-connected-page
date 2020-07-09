import { IBaseModel } from './common'

export interface ResourceRequirementRule {
  id: string
  regionId: string
  region: IBaseModel
  startDate: string
  endDate: string
  coreSkill: string
  numberOfResources: number
  depot?: IBaseModel
  depotId?: string
}
