import React from 'react'

import classNames from 'classnames'

import { classes } from '../../common/utils/classes'
import { Icon, IconNames } from '@skedulo/sked-ui'

import './Tile.scss'

const bem = classes('tile')

interface IProps {
  className?: string
  warning?: boolean
  title: string
  amount: string | number
  iconName: IconNames
}

const Tile: React.FC<IProps> = ({
  className,
  warning,
  title,
  amount,
  iconName
}) => (
  <div className={ classNames(className, bem()) }>
    <div className={ bem('icon', { warning }) }>
      <Icon name={ iconName } size={ 16 } />
    </div>
    <p className={ bem('title') }>{ title }</p>
    <p className={ bem('amount') }>{ amount }</p>
  </div>
)

export default Tile
