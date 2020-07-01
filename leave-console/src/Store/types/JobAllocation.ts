import { Job, UID } from '.'

export interface JobAllocation {
  UID: UID
  Status: string
  Job: Job
}
