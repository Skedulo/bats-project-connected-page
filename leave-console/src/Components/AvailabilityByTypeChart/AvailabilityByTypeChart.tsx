import React, { useState, useCallback, useMemo, memo } from 'react'
import { groupBy, mapValues, truncate } from 'lodash'
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
  Category = 'AvailableByCategory',
}

const CHART_TYPES = [
  { value: ChartType.CoreSkill, label: 'Core Skill' },
  { value: ChartType.Depot, label: 'Depot' },
  { value: ChartType.Category, label: 'Category' },
]

const COLUMN_COLORS = ['#BDE2C5', '#F4C8A4', '#F5E59F', '#EEB1AC', '#C7BEEC', '#B0DDEA', '#99D1FF', '#A7D4CF', '#E4ADCB']

export const AvailabilityByCoreSkillChart: React.FC<AvailabilityByCoreSkillChartProps> = ({ data, className, depots }) => {
  const { coreSkills, categories } = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills || [],
    categories: [state.configs?.resourceCategories[0], state.configs?.resourceCategories[1], state.configs?.resourceCategories[2]] || [],
  }))

  const [selectedType, setSelectedType] = useState<ISelectItem>(CHART_TYPES[0])

  const handleChartTypeChange = useCallback((item: ISelectItem) => {
    setSelectedType(item)
  }, [])

  const displayData = useMemo(() => {
    return data.map(item => {
      const resourceByCoreSkill = groupBy(item.resources, 'coreSkill')
      const resourceByDepot = groupBy(item.resources, 'depot.id')
      const resourceByCategory = groupBy(item.resources, 'category')
      return {
        ...item,
        [ChartType.CoreSkill]: mapValues(resourceByCoreSkill, value => value.length),
        [ChartType.Depot]: mapValues(resourceByDepot, value => value.length),
        [ChartType.Category]: mapValues(resourceByCategory, value => value.length),
      }
    })

  }, [data, selectedType])

  return (
    <div className={classNames('cx-p-8 cx-bg-white', className, bem())}>
      <div className="cx-flex cx-justify-between cx-items-center">
        <h1 className={ bem('title') }>{`Availability by ${selectedType.label}`}</h1>
        <Picker items={CHART_TYPES} onSelect={handleChartTypeChange} />
      </div>
      <ResponsiveContainer>
        <BarChart
          data={displayData}
          margin={{ top: 35, right: 10, bottom: 35 }}
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
          <Legend verticalAlign="top" align="left" layout="vertical" height={36} />
          {selectedType.value === ChartType.CoreSkill && coreSkills?.map((skill, index) => {
            return (
              <Bar
                key={`${skill.id}-${index}`}
                dataKey={`${ChartType.CoreSkill}.${skill.id}`}
                name={truncate(skill.name, { length: 25 })}
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
                name={truncate(depot.name, { length: 25 })}
                fill={COLUMN_COLORS[index]}
                barSize={5}
              />
            )
          })}
          {selectedType.value === ChartType.Category && categories?.map((category, index) => {
            return (
              <Bar
                key={`${category?.id}-${index}`}
                dataKey={`${ChartType.Category}.${category?.id}`}
                name={truncate(category?.name, { length: 25 })}
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
