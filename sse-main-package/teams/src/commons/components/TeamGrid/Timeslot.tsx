import React, { memo, useCallback } from 'react'
import classnames from 'classnames'

interface TimeslotProps {
  className?: string
  onSlotClick?: (date: string) => void
  children?: React.ReactNode
  slotDate: string
}

const Timeslot: React.FC<TimeslotProps> = ({
  className,
  children,
  onSlotClick,
  slotDate
}) => {
  const onClick = () => {
    if (typeof onSlotClick === 'function') {
      onSlotClick(slotDate)
    }
  }

  return (
    <div
      className={classnames('timeslot', className, {
        'cx-cursor-pointer': !!onSlotClick,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default memo(Timeslot)
