import * as React from 'react'
import { format, endOfDay, startOfDay, areIntervalsOverlapping } from 'date-fns'

import { classes } from '../../common/utils/classes'
import { LeaveRequest } from './types/LeaveRequest'
import { ResourceLeave } from './types/ResourceLeave'

import './AbsenceTable.scss'

const bem = classes('absenceTable')

interface Props {
  columnId: number
  day: Date
  leaveRequest?: LeaveRequest
}

const isResourceAbsent = (date: Date, leave: ResourceLeave) => {
  return areIntervalsOverlapping(
    { start: startOfDay(date), end: endOfDay(date) },
    { start: startOfDay(leave.start), end: endOfDay(leave.end) }
  )
}

export const Header = ({ columnId, day, leaveRequest }: Props) => {
  const resourceAbsent = leaveRequest ? isResourceAbsent(day, leaveRequest.leave) : false
  return (
    <div
      className={ bem('headerCell', {
        resourceAbsent
      }) }
      style={ {
        gridColumnStart: columnId,
        gridRowStart: 1
      } }
    >
      { format(day, 'd') }
    </div>
  )
}
