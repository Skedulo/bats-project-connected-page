import React, { memo } from 'react'
import { Button } from '@skedulo/sked-ui'

interface RescheduleCellProps {
  jobId: string
}

const ScheduledCell: React.FC<RescheduleCellProps> = ({ jobId }) => (
  <div className="cx-text-right">
    <Button
      buttonType="secondary"
      onClick={ () => {} }
    >
      Reallocate
    </Button>
  </div>
)

export default memo(ScheduledCell)
