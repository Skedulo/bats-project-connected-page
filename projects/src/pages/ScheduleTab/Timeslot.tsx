import React, { memo, useCallback } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { times, toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { Avatar } from '@skedulo/sked-ui'
import { parseDurationValue } from '../../commons/utils'
import { IJobDetail } from '../../commons/types'
import { DraggableItemTypes } from '../../commons/constants';
import ScheduledCard from './ScheduledCard';

interface ITimeslotProps {
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

const Timeslot: React.FC<ITimeslotProps> = ({
  className,
  children,
  onClick
}) => {
  const handleClick = useCallback(() => {
    if (typeof onClick === 'function') {
      onClick()
    }
  }, [onClick])

  return (
    <div
      className={classnames('timeslot', className, {
        'cx-cursor-pointer': !!onClick,
      })}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export default memo(Timeslot)
