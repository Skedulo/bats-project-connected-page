import React, { useState, memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { DynamicTable, Pagination } from '@skedulo/sked-ui'
import { getColumns } from './TableConfig'
import { UnavailabilityTableItem, State } from '../../Store/types'

const itemsPerPage = 25

interface Props {
  unavailability?: UnavailabilityTableItem
}

const ExceptionsTable: React.FC<Props> = () => {
  const [currentPage, setCurrentPage] = useState<number>(1)

  const unavailabilityExceptions = useSelector((state: State) => state.unavailabilityExceptions || [])

  const tableColumns = useMemo(() => getColumns(), [])

  return (
    <>
      <DynamicTable
        data={unavailabilityExceptions }
        columns={tableColumns}
        initialRowStateKey="UID"
      />
      {!unavailabilityExceptions.length && (
        <div className="cx-text-center cx-pt-4">No exceptions.</div>
      )}
      {unavailabilityExceptions.length > 0 && (
        <Pagination
          itemsTotal={unavailabilityExceptions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </>
  )
}

export default memo(ExceptionsTable)
