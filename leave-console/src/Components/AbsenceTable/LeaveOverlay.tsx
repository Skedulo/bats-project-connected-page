import React from 'react'
import { getDate, isSameMonth } from 'date-fns'

import { classes } from '../../common/utils/classes'
import { ResourceLeave } from './types/ResourceLeave'
import { isOverlappingDays } from './helpers'

const bem = classes('absenceTable')

interface Props {
  leave: ResourceLeave
  days: Date[]
}

const headerColumns = 1
const firstColumn = headerColumns + 1
const lastColumn = -1

export const LeaveOverlay: React.FC<Props> = ({ leave, days }) => {

  const isLeaveInRange = isOverlappingDays(leave.start, leave.end, days)

  const startDay = isSameMonth(leave.start, days[0])
    ? getDate(leave.start)
    : undefined

  const endDay = isSameMonth(leave.end, days[0])
    ? getDate(leave.end)
    : undefined

  const columnStart = startDay ? headerColumns + startDay : firstColumn
  const columnEnd = endDay ? headerColumns + endDay + 1 : lastColumn

  return (
    <>
      { isLeaveInRange && (
        <div
          className={ bem('leaveOverlay') }
          style={{
            gridRowStart: 2,
            gridRowEnd: -1,
            gridColumnStart: columnStart,
            gridColumnEnd: columnEnd
          }}
        />
      ) }
    </>
  )
}
