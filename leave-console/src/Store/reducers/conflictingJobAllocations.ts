import {
  makeReducers,
  makeActionsSet,
  makeAsyncActionCreatorSimp
} from '../../common/utils/redux-helpers'

import { Services } from '../../Services/Services'
import * as Queries from '../queries'
import { JobAllocation } from '../types'

const JOB_ALLOCATIONS_GET = makeActionsSet('JOB_ALLOCATIONS_GET')

export const getJobAllocations = makeAsyncActionCreatorSimp(JOB_ALLOCATIONS_GET, (
  overlapStartDate: string,
  overlapEndDate: string,
  resourceId: string
) => async () => {
  const filters = `Start < ${overlapEndDate} AND End > ${overlapStartDate} AND ResourceId == "${resourceId}" AND Status != 'Deleted'`
  const resp = await Services.graphQL.fetch<{}>({
    query: Queries.JobAllocationsQuery,
    variables: {
      filters
    }
  })
  return resp
})

export const getDefaultConflictingJobAllocations = () => [] as JobAllocation[]

const jobsAllocationsTransform = ({ jobAllocations }: { jobAllocations: JobAllocation[] }) => {
  return { conflictingJobAllocations: jobAllocations }
}

const conflictingJobsAllocationsReducers = {
  ...makeReducers(JOB_ALLOCATIONS_GET, { transform: jobsAllocationsTransform })
}

export default conflictingJobsAllocationsReducers
