import React, { memo } from 'react'
import { format } from 'date-fns-tz'

import { classes } from '../../../common/utils/classes'
import { LONG_DATE_FORMAT } from '../../../common/constants/date'
import './cells.scss'
import { useSelector } from 'react-redux'
import { State } from '../../../Store/types'

const bem = classes('scheduled-cell')

interface ScheduledCellProps {
  schedule: {
    start: string
    end: string
  }
}

const ScheduledCell: React.FC<ScheduledCellProps> = ({ schedule }) => {
  const { region } = useSelector((state: State) => ({ region: state.region || {} }))

  return (
    <div className={ bem() }>
      <span className={ bem('first-line') }>
        {format(new Date(schedule.start), LONG_DATE_FORMAT, { timeZone: region.timezoneSid })}
      </span>
      <span className={ bem('second-line') }>
        { format(new Date(schedule.start), 'h:mm aaa', { timeZone: region.timezoneSid }) }
        { ' ' }-{ ' ' }
        { format(new Date(schedule.end), 'h:mm aaa', { timeZone: region.timezoneSid }) }
        { ' ' }
        { format(new Date(schedule.end), '(O)', { timeZone: region.timezoneSid }) }
      </span>
    </div>
  )
}

export default memo(ScheduledCell)