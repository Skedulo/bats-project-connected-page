import React from 'react'
import { isSameMonth, getDate } from 'date-fns'

import { classes } from '../../common/utils/classes'
import TableTooltip from '../../Components/TableTooltip'
import { ResourceLeave } from './types/ResourceLeave'

const bem = classes('absenceTable')

interface Props {
  leave: ResourceLeave
  days: Date[]
}

interface VisibleConflict {
  columnStart: number
  conflicts: number
  day: Date
}

const headerColumns = 1

export const DayConflicts: React.FC<Props> = ({ leave, days }) => {

  const visibleConflicts = getVisibleConflicts(leave.conflictsByDay, days)

  return (
    <>
      { visibleConflicts.map((conflict, index) => (
        <TableTooltip
          key={ index }
          data={ {
            date: conflict.day,
            numberOfConflictedJobs: leave.conflicts
          } }
          trigger={
            <span
              className={ bem('conflictsLabel') }
              style={ {
                gridRowStart: 2,
                gridRowEnd: 3,
                gridColumnStart: conflict.columnStart,
                gridColumnEnd: conflict.columnStart + 1
              } }
            >
              { conflict.conflicts }
            </span>
          }
        />
      )) }
    </>
  )
}

const getVisibleConflicts = (conflictsByDay: Map<string, number>, days: Date[]) => {
  const visibleConflicts: VisibleConflict[] = []

  conflictsByDay.forEach((conflicts, key) => {
    const keyDay = new Date(key)
    if (isSameMonth(keyDay, days[0])) {
      visibleConflicts.push({
        conflicts,
        columnStart: getDate(keyDay) + headerColumns,
        day: keyDay
      })
    }
  })

  return visibleConflicts
}
