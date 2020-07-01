import React from 'react'

import { classes } from '../../common/utils/classes'

import './AbsenceTable.scss'

const bem = classes('absenceTable')

interface Props {
  name: string,
  category: string,
  avatarUrl: string
}

export const ResourceCell: React.FC<Props> = ({ name, category, avatarUrl }) => {
  return (
    <div className={ bem('resourceCell') }>

      <img
        className={ bem('resourceCellAvatar') }
        src={ avatarUrl }
        alt="avatar"
      />
      <div className={ bem('resourceCellDataContainer') }>
        <span className={ bem('resourceCellData', { bold: true }) }>{ name }</span>
        <span className={ bem('resourceCellData') }>{ category }</span>
      </div>
    </div>
  )
}
