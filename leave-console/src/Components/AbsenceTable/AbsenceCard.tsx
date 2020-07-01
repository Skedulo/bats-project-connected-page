import React from 'react'
import { isSameDay, differenceInHours, differenceInDays, startOfDay, getDate, differenceInMinutes } from 'date-fns'

import { classes } from '../../common/utils/classes'
import { ResourceLeave } from './types/ResourceLeave'
import { isWithinDays, isOverlappingDays } from './helpers'
import { DayConflicts } from './DayConflicts'

const bem = classes('absenceTable')

interface Props {
  isPrimary: boolean
  leave: ResourceLeave
  days: Date[]
  rowId: number
}

const headerRows = 1
const headerColumns = 1
const firstColumn = headerColumns + 1
const lastColumn = -1

export const AbsenceCard: React.FC<Props> = ({ isPrimary, leave, days, rowId }) => {
  const isInCurrentDayRange = isOverlappingDays(leave.start, leave.end, days)

  const startDay = isWithinDays(leave.start, days)
    ? getDate(leave.start)
    : undefined

  const endDay = isWithinDays(leave.end, days)
    ? getDate(leave.end)
    : undefined

  const rowStart = headerRows + rowId
  const rowEnd = headerRows + rowId + 1
  const columnStart = startDay ? headerColumns + startDay : firstColumn
  const columnEnd = endDay ? headerColumns + endDay + 1 : lastColumn

  const isSingleDayAbsence = isSameDay(leave.start, leave.end)
  const absenceLength = isSingleDayAbsence
    ? differenceInHours(leave.end, leave.start)
      ? { value: differenceInHours(leave.end, leave.start), unit: 'h' }
      : { value: differenceInMinutes(leave.end, leave.start), unit: 'm' }
    : { value: differenceInDays(startOfDay(leave.end), startOfDay(leave.start)) + 1, unit: 'days' }

  return (
    <>
      { isInCurrentDayRange && (
        <div
          className={ bem('leaveCard', {
            primary: isPrimary,
            singleDay: isSingleDayAbsence
          }) }
          style={ {
            gridRowStart: rowStart,
            gridRowEnd: rowEnd,
            gridColumnStart: columnStart,
            gridColumnEnd: columnEnd,
            zIndex: 200
          } }
        >
          { isSingleDayAbsence
            ? (
              <span className={ bem('leaveHours') }>{ `${ absenceLength.value }${absenceLength.unit }` }</span>
            ) : (
              <>
                <span className={ bem('leaveName') }>{ leave.name }</span>
                <span className={ bem('leaveDays') }>{ `${ absenceLength.value } ${absenceLength.unit }` }</span>
              </>
            )
          }
        </div>
      ) }

      { isPrimary && (
        <DayConflicts
          leave={ leave }
          days={ days }
        />
      ) }
    </>
  )
}
