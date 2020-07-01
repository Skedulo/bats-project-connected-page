import { ResourceLeave } from './ResourceLeave'
import { Resource } from './Resource'

export interface AbsenceRowData {
  resource: Resource
  leaves: ResourceLeave[]
}
