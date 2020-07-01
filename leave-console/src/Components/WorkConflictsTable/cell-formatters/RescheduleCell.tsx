import React from 'react'
import format from 'date-fns/format'

import { classes } from '../../../common/utils/classes'
import { Button } from '@skedulo/sked-ui'

import './cells.scss'

const bem = classes('scheduled-cell')

interface RescheduleCellProps {
  jobId: string
}

const ScheduledCell: React.FC<RescheduleCellProps> = ({ jobId }) => (
  <div className={ bem() }>
    <Button 
      buttonType="secondary"
      onClick={ () => {} }
    >
      Reschedule
    </Button>
  </div>
)

export default ScheduledCell