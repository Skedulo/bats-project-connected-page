import React from 'react'

import { classes } from '../../../common/utils/classes'

import './cells.scss'

const bem = classes('status-cell')

interface StatusCellProps {
  status: string
}

const StatusCell: React.FC<StatusCellProps> = ({ status }) => (
  <div className={ bem() }>
    { status }
  </div>
)

export default StatusCell
