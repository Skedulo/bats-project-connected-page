import React from 'react'
import { isWeekend } from 'date-fns'

import { ResourceCell } from './ResourceCell'
import { classes } from '../../common/utils/classes'
import { AbsenceCard } from './AbsenceCard'
import { LeaveRequest } from './types/LeaveRequest'

const bem = classes('absenceTable')

interface Props {
  rowId: number
  leaveRequest: LeaveRequest
  days: Date[]
  isPrimary: boolean
}

export const LeaveRequestRow: React.FC<Props> = ({ rowId, leaveRequest, days, isPrimary }) => {
  const { resource: { name, category, avatarUrl }, leave } = leaveRequest

  return (
    <>
      <ResourceCell
        name={ name }
        category={ category }
        avatarUrl={ avatarUrl }
      />

      { days.map((day, index) => (
        <div
          className={ bem('dayCell', {
            weekend: isWeekend(day)
          }) }
          key={ index }
        />
      )) }

      <AbsenceCard
        isPrimary={ isPrimary }
        leave={ leave }
        rowId={ rowId }
        days={ days }
      />
    </ >
  )
}
