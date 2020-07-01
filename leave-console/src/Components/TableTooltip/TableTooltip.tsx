import React from 'react'
import { format } from 'date-fns'
import Popup from 'reactjs-popup'

import { classes } from '../../common/utils/classes'
import { Icon } from '@skedulo/sked-ui'

import './TableTooltip.scss'

const bem = classes('table-tooltip')

interface TableTooltipProps {
  data: {
    date: Date,
    conflictType?: string,
    numberOfConflictedJobs: number
  },
  trigger: React.ReactElement,
}

const TableTooltip: React.FC<TableTooltipProps> = ({
  trigger,
  data: {
    date,
    conflictType = 'Job assigned',
    numberOfConflictedJobs
  }
}) => (
  <Popup
    trigger={ trigger }
    position="right top"
    className={ bem('popup') }
    arrow={ false }
    offsetX={ 20 }
    on="hover"
  >
    <div className={ bem() }>
      <p className={ bem('date') }>{ format(date, 'EEEE, d MMMM Y') }</p>
      { /* TODO: this time range doesn't make sense, if unavailability is longer than one day. should it be removed then? */ }
      { /* <p className={ bem('date', { light: true }) }>
        { `${format(Start, 'h bbbb')} - ${format(Finish, 'h bbbb')}` }
      </p> */ }
      <div className={ bem('conflict') }>
        <Icon name="filter" size={ 15 } />
        <div>
          <p className={ bem('text') }>
            <span className={ bem('text', { bold: true }) }>Conflict: </span>
            { conflictType }
          </p>
          <p className={ bem('text') }>
            Leave request conflicts with { ' ' }
            { numberOfConflictedJobs } { ' ' }
            { numberOfConflictedJobs === 1 ? 'job' : 'jobs' }
          </p>
          <a className={ bem('text', { link: true }) } role="button">View all conflicts</a>
        </div>
      </div>
    </div>
  </Popup>
)

export default TableTooltip
