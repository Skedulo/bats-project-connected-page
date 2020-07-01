import React from 'react'

import { classes } from '../../../common/utils/classes'

import './cells.scss'

const bem = classes('job-name-cell')

interface JobNameCellProps {
  name: string
  description: string
}

const JobNameCell: React.FC<JobNameCellProps> = (props) => {
  return (
    <div className={ bem() }>
      <span className={ bem('first-line') }>{ props.name }</span>
      <span className={ bem('second-line') }>{ props.description }</span>
    </div>
  )
}

export default JobNameCell