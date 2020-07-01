import React from 'react'
import format from 'date-fns/format'

import { classes } from '../../../common/utils/classes'

import './cells.scss'

const bem = classes('scheduled-cell')

interface ScheduledCellProps {
  schedule: {
    start: string
    end: string
  }
}

const ScheduledCell: React.FC<ScheduledCellProps> = ({ schedule }) => (
  <div className={ bem() }>
    <span className={ bem('first-line') }>{ format(new Date(schedule.start), 'MMM d, y' ) }</span>
    <span className={ bem('second-line') }>
      { format(new Date(schedule.start), 'h:mm aaaa') }
      { ' ' }-{ ' ' }
      { format(new Date(schedule.start), 'h:mm aaaa') }
      { ' ' }
      { format(new Date(schedule.end), '(O)') }
    </span>
  </div>
)

export default ScheduledCell