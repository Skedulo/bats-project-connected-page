import React from 'react'

import { AbsenceRow } from './AbsenceRow'
import { classes } from '../../common/utils/classes'
import { AbsenceRowData } from './types/AbsenceRowData'
import { LeaveRequest } from './types/LeaveRequest'
import { EmptyResults } from './EmptyResults'
import { LeaveBorder } from './LeaveBorder'
import { LeaveOverlay } from './LeaveOverlay'

import './AbsenceTable.scss'

const bem = classes('absenceTable')

interface Props {
  days: Date[],
  leaveRequest?: LeaveRequest
  absenceData: AbsenceRowData[]
  dayCellHeight: number
  firstColumnWidth: number
  columnWidth?: number
  maxRowsVisible?: number
}

interface SeparatorProps {
  columns: number
}

const Separator: React.FC<SeparatorProps> = ({ columns }) => {
  return (
    <>
      { Array(columns).fill(null).map((_, index) => (
        <div key={ index } className={ bem('separatorCell') } />
      )) }
    </>
  )
}

export const Viewport: React.FC<Props> = ({ days, leaveRequest, absenceData, dayCellHeight, firstColumnWidth, columnWidth, maxRowsVisible }) => {
  const separatorHeight = 30
  const finalColumnWidth = columnWidth !== undefined ? `${columnWidth}px` : '1fr'
  const maxHeight = maxRowsVisible ? `${dayCellHeight * maxRowsVisible + separatorHeight}px` : undefined
  const gridTemplateRows = leaveRequest
    ? `${separatorHeight}px repeat(${absenceData.length || 1}, ${dayCellHeight}px)`
    : `repeat(${absenceData.length || 1}, ${dayCellHeight}px)`

  return (
    <div className={ bem('viewportWrapper') }>
      <div
        className={ bem('viewport') }
        style={ {
          maxHeight,
          gridTemplateRows,
          gridTemplateColumns: `${firstColumnWidth}px repeat(${days.length}, ${finalColumnWidth})`,
          display: 'grid'
        } }
      >
        { leaveRequest && <Separator columns={ days.length  + 1 } /> }

        { absenceData.map((rowData, id) => (
          <AbsenceRow
            key={ id }
            rowId={ id + (leaveRequest ? 1 : 0) }
            rowData={ rowData }
            days={ days }
            isPrimary={ false }
          />
        )) }

        { !absenceData.length && <EmptyResults /> }

        { leaveRequest && (
          <LeaveOverlay
            leave={ leaveRequest.leave }
            days={ days }
          />
        ) }

        { leaveRequest && (
          <LeaveBorder
            leave={ leaveRequest.leave }
            days={ days }
          />
        ) }

      </div>
    </div>

  )
}
