import * as React from 'react'

import { classes } from '../../../common/utils/classes'
import { Icon } from '@skedulo/sked-ui'

import './ConflictsCell.scss'

export interface IStatusCell {
  conflictsCount: number,
}

const bem = classes('conflicts-cell')

export const ConflictsCell: React.FC<IStatusCell> = props => {
  const { conflictsCount } = props
  const conflictsLabel = () => {
    if (conflictsCount === 1) {
      return 'Conflict'
    }
    return 'Conflicts'
  }

  return (
    <div className={ bem() }>
        <div className={ bem('icon', { red: conflictsCount > 0 }) }>
            <Icon name={ conflictsCount > 0 ? 'exclamation' : 'tick' } size={ 10 } />
        </div>
        <span>
          <b>{`${conflictsCount}`}</b>
          {` ${conflictsLabel()}`}
        </span>
    </div>
  )
}
