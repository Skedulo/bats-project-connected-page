import React, { useState, memo } from 'react'

import { classes } from '../../../common/utils/classes'
import { Button, GroupAvatars } from '@skedulo/sked-ui'

import './cells.scss'

interface AvatarsProps {
  resources: {
    name: string,
    avatarUrl: string
  }[],
}

const AvailableResourcesCell: React.FC<AvatarsProps> = ({ resources }) => {
  return (
    <GroupAvatars avatarInfo={resources} />
  )
}

export default memo(AvailableResourcesCell)
