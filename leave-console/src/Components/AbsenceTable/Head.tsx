import * as React from 'react'

import { Header } from './Header'
import { classes } from '../../common/utils/classes'
import { LeaveRequest } from './types/LeaveRequest'
import { LeaveBorder } from './LeaveBorder'
import { LeaveRequestRow } from './LeaveRequestRow'

import './AbsenceTable.scss'

const bem = classes('absenceTable')

interface Props {
  days: Date[]
  dayCellHeight: number
  firstColumnWidth: number
  leaveRequest?: LeaveRequest
  columnWidth?: number
}

export const Head: React.FC<Props> = ({ days, dayCellHeight, firstColumnWidth, columnWidth, leaveRequest }) => {
  const headersXOffset = 2
  const finalColumnWidth = columnWidth !== undefined ? `${columnWidth}px` : '1fr'
  const gridTemplateRows = leaveRequest ? `auto ${dayCellHeight}px` : `auto`

  return (
    <div
      className={ bem('head') }
      style={ {
        gridTemplateRows,
        gridTemplateColumns: `${firstColumnWidth}px repeat(${days.length}, ${finalColumnWidth}`
      } }
    >
      <div
        className={ bem('headerCell') }
        style={ {
          gridColumnStart: 1,
          gridRowStart: 1
        } }
      />
      { days.map((day, index) => (
        <Header
          key={ index }
          columnId={ headersXOffset + index }
          day={ day }
          leaveRequest={ leaveRequest }
        />
      )) }

      { leaveRequest && (
        <LeaveRequestRow
          rowId={ 1 }
          leaveRequest={ leaveRequest }
          days={ days }
          isPrimary={ true }
        />
      ) }

      { leaveRequest && (
        <LeaveBorder
          leave={ leaveRequest.leave }
          days={ days }
        />
       ) }
    </div>
  )
}
