import React, { memo, useState, useCallback } from 'react'
import { Button } from '@skedulo/sked-ui'
import { Job, UnavailabilityTableItem } from '../../../Store/types'
import JobAllocationModal from '../../JobAllocationModal'

interface RescheduleCellProps {
  job: Job
  unavailability: UnavailabilityTableItem
}

const ScheduledCell: React.FC<RescheduleCellProps> = ({ job, unavailability }) => {
  const [openReallocateModal, setOpenReallocateModal] = useState<boolean>(false)

  const toggleReallocateModal = useCallback(() => {
    setOpenReallocateModal(prev => !prev)
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
        unavailability={unavailability}
        onClose={toggleReallocateModal}
      />
    </div>
  )
}

export default memo(ScheduledCell)
