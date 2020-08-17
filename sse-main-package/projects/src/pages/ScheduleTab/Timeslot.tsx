import React, { memo, useCallback } from 'react'
import classnames from 'classnames'
import { ITimeOption } from '../../commons/types'

interface ITimeslotProps {
  className?: string
  handleAllocation?: (zonedDate: string, zonedTime: number) => void
  children?: React.ReactNode
  slotDate: string
  slotTime: ITimeOption
}

const Timeslot: React.FC<ITimeslotProps> = ({
  className,
  children,
  handleAllocation,
  slotDate,
  slotTime
}) => {
  const onSlotClick = () => {
    if (typeof handleAllocation === 'function') {
      handleAllocation(slotDate, slotTime.numberValue)
    }
  }

  return (
    <div
      className={classnames('timeslot', className, {
        'cx-cursor-pointer': !!handleAllocation,
      })}
      onClick={onSlotClick}
    >
      {children}
    </div>
  )
}

export default memo(Timeslot)
