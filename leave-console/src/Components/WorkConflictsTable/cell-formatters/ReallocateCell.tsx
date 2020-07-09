import React, { memo, useState, useCallback } from 'react'
import { Button } from '@skedulo/sked-ui'
import { Job } from '../../../Store/types'
import JobAllocationModal from '../../JobAllocationModal'

interface RescheduleCellProps {
  job: Job
}

const ScheduledCell: React.FC<RescheduleCellProps> = ({ job }) => {
  const [openReallocateModal, setOpenReallocateModal] = useState<boolean>(false)

  const toggleReallocateModal = useCallback(() => {
    setOpenReallocateModal(prev => !prev)
  }, [])

  const handleReallocate = useCallback(() => {
    console.log('resallocate')
  }, [])

  return (
    <div className="cx-text-right">
      <Button
        buttonType="secondary"
        onClick={toggleReallocateModal}
      >
        Reallocate
      </Button>
      <JobAllocationModal
        isOpen={openReallocateModal}
        job={job}
        onClose={toggleReallocateModal}
        onAllocation={handleReallocate}
      />
    </div>
  )
}

export default memo(ScheduledCell)
