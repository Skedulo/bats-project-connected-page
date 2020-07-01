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
  pending: { className: 'sk-bg-grey-lightest sk-text-grey-dark', style: {} },
  approved: { className: 'sk-bg-green-lightest', style: { color: '#59b66e' } },
  declined: { className: 'sk-bg-red-lightest sk-text-red', style: {} }
}

export const StatusCell: React.FC<IStatusCell> = props => {
  const baseClassName = 'sk-leading-tight sk-text-xxs sk-px-4 sk-py-2 sk-rounded-medium sk-truncate sk-max-w-full sk-inline-block sk-w-full'
  const statusStyle = statusStyles[props.type!.toLowerCase()]
  return (
    <div
      className={ classnames(baseClassName, statusStyle.className, props.className) }
      style={ { ...statusStyle.style } }
    >
      <span className="sk-flex sk-items-center sk-h-full">
        { props.type }
      </span>
    </div>
  )
}
