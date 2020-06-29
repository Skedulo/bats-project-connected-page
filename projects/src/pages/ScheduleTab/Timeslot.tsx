import React, { memo, useCallback } from 'react'
import classnames from 'classnames'
import { ITimeOption } from '../../commons/types'

interface ITimeslotProps {
  className?: string
  handleClick?: (zonedDate: string, zonedTime: number) => void
  children?: React.ReactNode
  slotDate: string
  slotTime: ITimeOption
}

const Timeslot: React.FC<ITimeslotProps> = ({
  className,
  children,
  handleClick,
  slotDate,
  slotTime
}) => {
  const onSlotClick = () => {
    if (typeof handleClick === 'function') {
      handleClick(slotDate, slotTime.numberValue)
    }
  }

  return (
    <div
      className={classnames('timeslot', className, {
        'cx-cursor-pointer': !!handleClick,
      })}
      onClick={onSlotClick}
    >
      {children}
    </div>
  )
}

export default memo(Timeslot)
