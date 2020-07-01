import React from 'react'
import classNames from 'classnames'
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts'
import { format } from 'date-fns'

import { AbsenceData } from '../../Store/types'
import { classes } from '../../common/utils/classes'
import './AbsenceChart.scss'

const bem = classes('absence-chart')

const CHART_COLORS = {
  tickY: '#d4d7de',
  tickX: '#6d7991',
  grid: '#e5e7ee',
  line: '#008cff'
}

interface CustomizedTooltipProps {
  payload: {
    payload: { date: Date },
    value: number,
    name: string
  }[],
  active: boolean,
}

const CustomizedTooltip: React.FC<CustomizedTooltipProps> = ({ payload, active }) => (
  active && (
    <div className="tooltip">
      <p className="tooltip__x-data">{ format(payload[0].payload.date, 'd.LL.u') }</p>
      <p className="tooltip__y-data">{ payload[0].value } { payload[0].value === 1 ? 'resource' : 'resources' }</p>
    </div>
  )
)

interface AbsenceChartProps {
  className?: string
  data: AbsenceData[]
}

const AbsenceChart: React.FC<AbsenceChartProps> = ({ className, data }) => {
  const transformedData = data.map((dataPart: { date: Date}) => ({ ...dataPart, dateTransformed: `${format(dataPart.date, 'd/M')}` }))

  return (
    <div className={ classNames(className, bem()) }>
      <h1 className={ bem('title') }>Absence rate</h1>
      <ResponsiveContainer>
        <AreaChart
          data={ transformedData }
          margin={ { top: 35, right: 10, bottom: 35 } }
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ CHART_COLORS.line } stopOpacity={ 0.15 }/>
              <stop offset="95%" stopColor={ CHART_COLORS.line } stopOpacity={ 0 }/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dateTransformed"
            tick={ { fontSize: 12, fill: CHART_COLORS.tickX } }
            allowDecimals={ false }
            axisLine={ false }
            tickMargin={ 20 }
            tickSize={ 0 }
            />
          <YAxis
            width={ 25 }
            tick={ { fontSize: 12, fill: CHART_COLORS.tickY  } }
            allowDecimals={ false }
            tickMargin={ 12 }
            axisLine={ false }
            tickSize={ 0 }
          />
          <CartesianGrid
            stroke={ CHART_COLORS.grid }
            vertical={ false }
          />
          <Tooltip
            cursor={ { strokeDasharray: '3 3', strokeWidth: 1, color: CHART_COLORS.grid } }
            offset={ -60 }
            content={ <CustomizedTooltip /> }
          />
          <Area
            dataKey="resources"
            stroke={ CHART_COLORS.line }
            strokeWidth={ 1.5 }
            activeDot={ { r: 3, stroke: CHART_COLORS.line } }
            dot={ { r: 3, fill: '#fff' } }
            fillOpacity={ 1 }
            fill="url(#gradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AbsenceChart
