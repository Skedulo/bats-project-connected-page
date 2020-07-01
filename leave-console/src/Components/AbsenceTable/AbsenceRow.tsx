import React from 'react'
import { isWeekend } from 'date-fns'

import { ResourceCell } from './ResourceCell'
import { classes } from '../../common/utils/classes'
import { AbsenceCard } from './AbsenceCard'
import { AbsenceRowData } from './types/AbsenceRowData'

const bem = classes('absenceTable')

interface Props {
  rowId: number
  rowData: AbsenceRowData
  days: Date[]
  isPrimary: boolean
}

export const AbsenceRow: React.FC<Props> = ({ rowId, rowData, days, isPrimary }) => {
  const { resource: { name, category, avatarUrl }, leaves } = rowData

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

      { leaves.map((leave, index) => (
        <AbsenceCard
          key={ index }
          isPrimary={ isPrimary }
          leave={ leave }
          rowId={ rowId }
          days={ days }
        />
      )) }

    </ >
  )
}
