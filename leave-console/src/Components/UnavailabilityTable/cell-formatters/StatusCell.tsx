import * as React from 'react'
import classnames from 'classnames'
import { AvailabilityStatus } from '../../../Store/types/Availability'

export interface IStatusCell {
  type: AvailabilityStatus,
  className?: string
}

interface StatusStyle {
  className?: string,
  style: React.CSSProperties
}

const statusStyles: {
  [index: string]: StatusStyle
} = {
  pending: { className: 'cx-bg-neutral-300 cx-text-neutral-850', style: {} },
  approved: { className: 'cx-bg-green-300 cx-text-green-8-0', style: {} },
  declined: { className: 'cx-bg-red-300 cx-text-red-800', style: {} }
}

export const StatusCell: React.FC<IStatusCell> = props => {
  const baseClassName = 'cx-leading-tight cx-text-xxs cx-px-4 cx-py-2 cx-rounded-medium cx-truncate cx-max-w-full cx-inline-block'
  const statusStyle = statusStyles[props.type!.toLowerCase()]
  return (
    <div
      className={classnames(baseClassName, statusStyle.className, props.className)}
      style={{ ...statusStyle.style }}
    >
      {props.type}
    </div>
  )
}
