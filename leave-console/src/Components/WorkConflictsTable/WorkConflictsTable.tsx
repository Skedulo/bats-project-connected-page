import React, { useState, memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { DynamicTable, Pagination } from '@skedulo/sked-ui'
import { getColumns } from './TableConfig'
import { UnavailabilityTableItem, State } from '../../Store/types'

const itemsPerPage = 25

interface Props {
  unavailability: UnavailabilityTableItem
}

const WorkConflictsTable: React.FC<Props> = ({ unavailability }) => {
  const [currentPage, setCurrentPage] = useState<number>(1)

  const conflictingJobsAllocations = useSelector((state: State) => state.conflictingJobAllocations)

  const tableColumns = useMemo(() => getColumns(unavailability), [])

  return (
    <>
      <DynamicTable
        data={conflictingJobsAllocations}
        columns={tableColumns}
        initialRowStateKey="UID"
      />
      {!conflictingJobsAllocations.length && (
        <div className="cx-text-center cx-pt-4">No work conflicts.</div>
      )}
      {conflictingJobsAllocations.length > 0 && (
        <Pagination
          itemsTotal={conflictingJobsAllocations.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </>
  )
}

export default memo(WorkConflictsTable)
