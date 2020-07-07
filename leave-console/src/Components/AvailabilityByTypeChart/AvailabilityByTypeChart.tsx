import React, { useState, useCallback, useMemo, memo } from 'react'
import { groupBy, mapValues } from 'lodash'
import classNames from 'classnames'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { classes } from '../../common/utils/classes'

import './AvailabilityByTypeChart.scss'
import ChartTooltip from '../ChartTooltip'
import { CHART_COLORS } from '../../common/constants'
import { ISelectItem } from '@skedulo/sked-ui'
import Picker from '../Picker'
import { AvailabilityChartData } from '../../Store/types/Availability'
import { useSelector } from 'react-redux'
import { State, IBaseModel } from '../../Store/types'

const bem = classes('unavailability-chart')

interface AvailabilityByCoreSkillChartProps {
  data: AvailabilityChartData[]
  className?: string
  depots: IBaseModel[]
}

enum ChartType {
  CoreSkill = 'AvailableByCoreSkill',
  Depot = 'AvailableByDepot',
}

const CHART_TYPES = [
  { value: ChartType.CoreSkill, label: 'Core Skill' },
  { value: ChartType.Depot, label: 'Depot' }
]

const COLUMN_COLORS = ['#BDE2C5', '#F4C8A4', '#F5E59F', '#EEB1AC', '#C7BEEC', '#B0DDEA', '#99D1FF', '#A7D4CF', '#E4ADCB']

export const AvailabilityByCoreSkillChart: React.FC<AvailabilityByCoreSkillChartProps> = ({ data, className, depots }) => {
  const { coreSkills } = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills
  }))

  const [selectedType, setSelectedType] = useState<ISelectItem>(CHART_TYPES[0])

  const handleCoreSkillChange = useCallback((item: ISelectItem) => {
    setSelectedType(item)
  }, [])

  const displayData = useMemo(() => {
    return data.map(item => {
      const resourceByCoreSkill = groupBy(item.resources, 'coreSkill')
      const resourceByDepot = groupBy(item.resources, 'depot.name')
      return {
        ...item,
        [ChartType.CoreSkill]: mapValues(resourceByCoreSkill, value => value.length),
        [ChartType.Depot]: mapValues(resourceByDepot, value => value.length),
      }
    })

  }, [data, selectedType])

  return (
    <div className={classNames('cx-p-8 cx-bg-white', className, bem())}>
      <div className="cx-flex cx-justify-between cx-items-center">
        <h1 className={ bem('title') }>{`Availability by ${selectedType.label}`}</h1>
        <Picker items={CHART_TYPES} onSelect={handleCoreSkillChange} />
      </div>
      <ResponsiveContainer>
        <BarChart
          data={displayData}
          margin={ { top: 35, right: 10, bottom: 35 } }
        >
          <XAxis
            dataKey="shortDate"
            tick={{ fontSize: 12, fill: CHART_COLORS.tickX }}
            allowDecimals={false}
            axisLine={false}
            tickMargin={20}
            tickSize={0}
          />
          <YAxis
            width={25}
            tick={{ fontSize: 12, fill: CHART_COLORS.tickY }}
            allowDecimals={false}
            tickMargin={12}
            axisLine={false}
            tickSize={0}
          />
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {selectedType.value === ChartType.CoreSkill && coreSkills?.map((skill, index) => {
            return (
              <Bar
                key={`${skill.id}-${index}`}
                dataKey={`${ChartType.CoreSkill}.${skill.id}`}
                name={skill.name}
                fill={COLUMN_COLORS[index]}
                barSize={5}
              />
            )
          })}
          {selectedType.value === ChartType.Depot && depots?.map((depot, index) => {
            return (
              <Bar
                key={`${depot.id}-${index}`}
                dataKey={`${ChartType.Depot}.${depot.id}`}
                name={depot.name}
                fill={COLUMN_COLORS[index]}
                barSize={5}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(AvailabilityByCoreSkillChart)
