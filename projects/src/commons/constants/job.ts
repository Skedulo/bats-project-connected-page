import { JobStatus } from '../types'

export const JOB_STATUS_COLOR = {
  [JobStatus.Queued]: 'neutral',
  [JobStatus.PendingAllocation]: 'neutral',
  [JobStatus.PendingDispatch]: 'neutral',
  [JobStatus.Ready]: 'neutral',
  [JobStatus.EnRoute]: 'neutral',
  [JobStatus.OnSite]: 'neutral',
  [JobStatus.InProgress]: 'neutral',
  [JobStatus.Complete]: 'green',
  [JobStatus.Cancelled]: 'red',
}
