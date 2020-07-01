import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { classes } from '../../common/utils/classes'
import { DynamicTable, Pagination } from '@skedulo/sked-ui'
import { getConfig } from './TableConfig'
import { getJobAllocations } from '../../Store/reducers/conflictingJobAllocations'
import { UnavailabilityTableItem, JobAllocation, State } from '../../Store/types'

import './WorkConflictsTable.scss'

const bem = classes('work-conflicts-table')

const itemsPerPage = 25

interface Props {
  unavailability?: UnavailabilityTableItem
}

const mapAllocationToTableItem = (allocation: JobAllocation) => {
    return {
      jobInfo: {
        name: allocation.Job.Name,
        description: allocation.Job.Description
      },
      subject: {
        account: allocation.Job.Account,
        contact: allocation.Job.Contact
      },
      jobType: allocation.Job.Type,
      status: allocation.Status,
      address: allocation.Job.Address,
      scheduled: {
        start: allocation.Job.Start,
        end: allocation.Job.End
      },
      jobAllocatedResources: allocation.Job.JobAllocations.Resource,
      jobId: allocation.Job.UID
    }
  }

const WorkConflictsTable: React.FC<Props> = ({ unavailability }) => {
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedJobs, setSelectedJobs] = useState(new Set() as Set<string>)
  const conflictingJobsAllocations = useSelector((state: State) => state.conflictingJobAllocations)

  useEffect(() => {
    if (unavailability) {
      dispatch(getJobAllocations(unavailability.Start, unavailability.Finish, unavailability.Resource.UID))
    }
  }, [unavailability])

  const tableConfig = getConfig({ 
    onSelect: (key: string, selections: Set<string>) => {
      setSelectedJobs(selections)
    }
  })

  const tableItems = conflictingJobsAllocations.map(mapAllocationToTableItem)
  const displayedItems = tableItems
    ? tableItems!.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : []

  return (
    <div className={ bem() }>
      <DynamicTable
        data={ displayedItems }
        config={ tableConfig }
        selection={ selectedJobs }
      />
      <Pagination
        itemsTotal={ tableItems.length }
        itemsPerPage={ itemsPerPage }
        onPageChange={ setCurrentPage }
        currentPage={ currentPage }
      />
    </div>
  )
}

export default WorkConflictsTable
