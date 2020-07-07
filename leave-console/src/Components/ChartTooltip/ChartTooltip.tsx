import React, { memo } from 'react'
import { format } from 'date-fns'

import { DATE_FORMAT } from '../../common/constants'

interface ChartTooltipProps {
  payload?: {
    payload: { date: Date },
    value: number,
    name: string
  }[],
  active?: boolean,
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ payload, active }) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="tooltip">
      <p className="tooltip__x-data">{ format(payload[0].payload.date, DATE_FORMAT) }</p>
      <p className="tooltip__y-data">{ payload[0].value } { payload[0].value === 1 ? 'resource' : 'resources' }</p>
    </div>
  )
}

export default memo(ChartTooltip)
