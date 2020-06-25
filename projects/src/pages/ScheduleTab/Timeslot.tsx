import React, { memo, useCallback } from 'react'
import classnames from 'classnames'

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
