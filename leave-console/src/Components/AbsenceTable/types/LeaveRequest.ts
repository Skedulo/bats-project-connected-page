import { Resource } from './Resource'
import { ResourceLeave } from './ResourceLeave'

export interface LeaveRequest {
  resource: Resource
  leave: ResourceLeave
}
