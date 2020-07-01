import React, { useState } from 'react'
import classNames from 'classnames'
import PieChart from 'react-minimal-pie-chart'

import { classes } from '../../common/utils/classes'

import './UnavailabilityChart.scss'

const bem = classes('unavailability-chart')

const MAX_MEANINGFUL_PARTS = 6

interface GraphPart {
  title: string,
  value: number,
  color: string
}

const getTooltipContent = (dataExist: boolean, part?: GraphPart) => (
  dataExist
    ? (
        <p>
          <span style={ { color: part.color, fontSize: '20px' } }>&bull; </span>
          { part.title } <span className="tooltip__percent">{ `${Math.round(part.value)}%` }</span>
        </p>
      )
    : 'No data'
)

const COLORS = [
  '#007ee6',
  '#ffc878',
  '#75c8f6',
  '#3da499',
  '#8d68c3',
  '#f3f5f9'
]

const prepareData = jobs => {
  const data = jobs.reduce((acc, val) => {
    const jobData = acc.find(({ title }) => val.type === title)
    if (jobData) {
      jobData.value += 1
    } else {
      acc.push({ title: val.type, value: 1 })
    }
    return acc
  }, [])
  const sumOfValues = data.reduce((sum, { value }) => sum + value, 0)

  const parts = data
    .sort((a, b) => (a.value >= b.value ? -1 : 1))
    .map((job, index) => ({
      ...job,
      value: job.value / sumOfValues * 100,
      color: COLORS[index]
    }))

  if (parts.length > MAX_MEANINGFUL_PARTS) {
    const other = parts
      .slice(MAX_MEANINGFUL_PARTS - 1)
      .reduce((acc, part) => ({
        ...acc,
        title: 'Other',
        value: acc.value + part.value,
        color: '#000'
      }))

    return [
      ...parts.slice(0, MAX_MEANINGFUL_PARTS - 1),
      other
    ]
  }
  return parts
}

const renderLegend = (parts: GraphPart[]) => {
  return (
    <div className="legend">
      {
        parts.map((part, idx) => (
          <div className="legend__item" key={ idx }>
            <span className="legend__bullet" style={ { color: part.color } }>&bull;</span>
            <span>{ part.title }</span>
          </div>
        ))
      }
    </div>
  )
}

const renderLegendPlaceholder = () => (
  <div className={ bem('no-data') }>No data</div>
)

interface UnavailabilityChartProps {
  data: {
    type: string
  }[]
  className: string
}

export const UnavailabilityChart: React.FC<UnavailabilityChartProps> = ({ data, className }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipVisible, setTooltipVisible] = useState(true)
  const [tooltipContent, setTooltipContent] = useState()

  const getEmptyChartData = () => ([{
    title: 'No data',
    value: 100,
    color: '#f3f5f9'
  }])

  const transformedData = data.length ? prepareData(data) : getEmptyChartData()

  const onMouseOverChart = (event, data, index) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
    setTooltipVisible(true)
    setTooltipContent(getTooltipContent(!!data.length, transformedData[index]))
  }

  const onMouseOutChart = () => {
    setTooltipVisible(false)
  }

  const getTooltipContainerStyle = () => ({
    top: tooltipPosition.y - 45,
    left: tooltipPosition.x,
    display: tooltipVisible ? 'block' : 'none',
    transform: 'translateX(-50%)'
  })

  return (
    <div className={ classNames(className, bem()) }>
      <h3 className={ bem('title') }>Unavailability by type</h3>
      <div className={ bem('chart-container') }>
          <div className="tooltip" style={ getTooltipContainerStyle() }>
            { tooltipContent }
          </div>
          { data.length ? renderLegend(transformedData) : renderLegendPlaceholder() }
          <PieChart
            style={ { height: '230px', width: '230px' }  }
            data={ transformedData }
            lineWidth={ 12 }
            startAngle={ -90 }
            onMouseOver={ onMouseOverChart }
            onMouseOut={ onMouseOutChart }
          />
        </div>
      </div>
  )
}

export default UnavailabilityChart
