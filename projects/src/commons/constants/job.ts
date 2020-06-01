import { JobStatus, JobStatusKey } from '../types'
import { LozengeColors } from '@skedulo/sked-ui'

export const JOB_STATUS_COLOR: Record<JobStatusKey, LozengeColors> = {
  [JobStatus.Queued]: 'neutral',
  [JobStatus.PendingAllocation]: 'neutral',
  [JobStatus.PendingDispatch]: 'neutral',
  [JobStatus.Ready]: 'neutral',
  [JobStatus.EnRoute]: 'neutral',
  [JobStatus.OnSite]: 'neutral',
  [JobStatus.InProgress]: 'neutral',
  [JobStatus.Complete]: 'green',
  [JobStatus.Cancelled]: 'red',
  [JobStatus.Dispatched]: 'cyan',
}
