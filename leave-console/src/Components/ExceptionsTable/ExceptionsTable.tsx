import React, { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { classes } from '../../common/utils/classes'
import { DynamicTable, Pagination } from '@skedulo/sked-ui'
import { getColumns } from './TableConfig'
import { getJobAllocations } from '../../Store/reducers/conflictingJobAllocations'
import { UnavailabilityTableItem, JobAllocation, State } from '../../Store/types'

const itemsPerPage = 25

interface Props {
  unavailability?: UnavailabilityTableItem
}

const ExceptionsTable: React.FC<Props> = () => {
  const [currentPage, setCurrentPage] = useState<number>(1)

  const conflictingJobsAllocations = useSelector((state: State) => state.conflictingJobAllocations)

  const tableColumns = useMemo(() => getColumns(), [])

  return (
    <>
      <DynamicTable
        data={conflictingJobsAllocations }
        columns={tableColumns}
        initialRowStateKey="UID"
      />
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

export default memo(ExceptionsTable)
