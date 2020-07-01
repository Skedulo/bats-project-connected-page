import * as React from 'react'
import { useSelector } from 'react-redux'

import { State, Resource } from '../../../Store/types'
import { classes } from '../../../common/utils/classes'
import { Avatar } from '@skedulo/sked-ui'
import { getDefaultAvatar } from '../../../common/utils/avatars'

import './ResourceCell.scss'

const bem = classes('resource-cell')

export const ResourceCell: React.FC<{resource: Resource}> = ({ resource: {
  UID,
  Name,
  Category,
} }) => {
  const avatars = useSelector((store: State) => store.avatars)
  let avatar = getDefaultAvatar()

  if (UID && avatars && avatars[UID]) {
    avatar = avatars[UID]
  }

  return (
    <div className={ bem() }>
      <Avatar name={ Name } imageUrl={ avatar } className={ bem('avatar') } />
      <div>
        <span className={ bem('name') }>{ Name }</span>
        <span className={ bem('category') }>{ Category }</span>
      </div>
    </div>
  )
}
