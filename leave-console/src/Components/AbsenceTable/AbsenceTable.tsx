import * as React from 'react'
import { eachDayOfInterval, format } from 'date-fns'

import { classes } from '../../common/utils/classes'
import { Head } from './Head'
import { Viewport } from './Viewport'
import { AbsenceRowData } from './types/AbsenceRowData'
import { LeaveRequest } from './types/LeaveRequest'

import './AbsenceTable.scss'

const bem = classes('absenceTable')

interface Props {
  startDate: Date
  endDate: Date
  leaveRequest?: LeaveRequest
  absenceData: AbsenceRowData[]
}

const maxRowsVisible = undefined // to enable max rows set this value and change .absenceTable--container overflow to 'auto'
const dayCellHeight = 64
const firstColumnWidth = 255

export const AbsenceTable: React.FC<Props> = ({ startDate, endDate, leaveRequest, absenceData }) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return (
    <div className="sk-relative">
      <header className={ bem('header') }>
        { format(startDate, 'MMMM') }
      </header>
      <div
        className="absenceTable--container"
      >
        <Head
          days={ days }
          dayCellHeight={ dayCellHeight }
          firstColumnWidth={ firstColumnWidth }
          leaveRequest={ leaveRequest }
          columnWidth={ undefined }
        />
        <Viewport
          days={ days }
          leaveRequest={ leaveRequest }
          absenceData={ absenceData }
          dayCellHeight={ dayCellHeight }
          firstColumnWidth={ firstColumnWidth }
          columnWidth={ undefined }
          maxRowsVisible={ maxRowsVisible }
        />
      </div>
    </div>
  )
}
