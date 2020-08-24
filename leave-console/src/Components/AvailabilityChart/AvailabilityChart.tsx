import React, { useMemo, useState, useCallback } from 'react'
import classNames from 'classnames'
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
  ReferenceLine,
  Customized,
  Cell
} from 'recharts'
import { toString, random } from 'lodash'

import { classes } from '../../common/utils/classes'
import { AvailabilityChartData } from '../../Store/types/Availability'
import { CHART_COLORS } from '../../common/constants'
import './AvailabilityChart.scss'
import Picker from '../Picker'
import { useSelector } from 'react-redux'
import { State, IBaseModel } from '../../Store/types'
import { ISelectItem } from '@skedulo/sked-ui'

const bem = classes('absence-chart')

interface AvailabilityChartProps {
  data: AvailabilityChartData[]
  className?: string,
  depots: IBaseModel[]
  totalResources: number
}

interface FilterParam {
  coreSkill: ISelectItem
  depot: ISelectItem
  category: ISelectItem
}

enum ViewType {
  Total,
  Percentage
}

const viewOptions = [
  { label: 'Total', value: ViewType.Total },
  { label: 'Percentage', value: ViewType.Percentage }
]

const AvailabilityChart: React.FC<AvailabilityChartProps> = ({ data, className, depots, totalResources }) => {
  // const config = useSelector((state: State) => state.configs)
  const config = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills,
    categories: state.configs?.resourceCategories,
    maxColor: state.configs?.maxColor,
    midColor: state.configs?.midColor,
    minColor: state.configs?.minColor,
    availabilityChartMaxPoint: state.configs?.availabilityChartMaxPoint || 0,
    availabilityChartMidPoint: state.configs?.availabilityChartMidPoint || 0,
    availabilityChartMinPoint: state.configs?.availabilityChartMinPoint || 0
  }))

  const [viewType, setViewType] = useState<ISelectItem>(viewOptions[0])

  const depotOptions = useMemo(() => {
    let options = [{ value: '', label: 'All depots' }]
    if (depots?.length) {
      options = [...options, ...depots.map(item => ({ value: item.id, label: item.name }))]
    }
    return options
  }, [depots])

  const coreSkillOptions = useMemo(() => {
    let options = [{ value: '', label: 'All skills' }]
    if (config.coreSkills?.length) {
      options = [...options, ...config.coreSkills.map(item => ({ value: item.id, label: item.name }))]
    }
    return options
  }, [config])

  const categoryOptions = useMemo(() => {
    let options = [{ value: '', label: 'All categories' }]
    if (config.categories?.length) {
      options = [...options, ...config.categories.map(item => ({ value: item.id, label: item.name }))]
    }
    return options
  }, [config])

  const [filter, setFilter] = useState<FilterParam>({
    coreSkill: coreSkillOptions[0],
    depot: depotOptions[0],
    category: categoryOptions[0]
  })

  const handleDepotChange = useCallback((item: ISelectItem) => {
    setFilter(prev => ({ ...prev, depot: item }))
  }, [])

  const handleCoreSkillChange = useCallback((item: ISelectItem) => {
    setFilter(prev => ({ ...prev, coreSkill: item }))
  }, [])

  const handleCategoryChange = useCallback((item: ISelectItem) => {
    setFilter(prev => ({ ...prev, category: item }))
  }, [])

  const handleViewTypeChange = useCallback((item: ISelectItem) => {
    setViewType(item)
  }, [])

  const getFillColor = useCallback((percent: number) => {
    if (viewType.value === ViewType.Percentage) {
      const { availabilityChartMidPoint, availabilityChartMaxPoint, minColor, midColor, maxColor } = config
      if (percent < availabilityChartMidPoint) {
        return minColor
      }
      if (percent >= availabilityChartMidPoint && percent <= availabilityChartMaxPoint) {
        return midColor
      }
      if (percent > availabilityChartMaxPoint) {
        return maxColor
      }
    }
    return CHART_COLORS.bar

  }, [viewType, config])

  const displayData = useMemo(() => {
    return data.map(item => {
      const matchedResources = item.resources.filter(res => {
        let isMatched = true
        if (filter.depot.value) {
          isMatched = isMatched && toString(res.depot?.id) === filter.depot.value
        }
        if (filter.coreSkill.value) {
          isMatched = isMatched && toString(res.coreSkill) === filter.coreSkill.value
        }
        if (filter.category.value) {
          isMatched = isMatched && toString(res.category) === filter.category.value
        }
        return isMatched
      })
      return {
        ...item,
        resources: matchedResources,
        resourcesCount: matchedResources.length,
        percentAvailability: Math.floor((matchedResources.length * 100) / totalResources)
      }
    })
  }, [data, filter, totalResources])

  return (
    <div className={ classNames(className, bem()) }>
      <div className="cx-flex cx-justify-between cx-items-center">
        <div className="cx-flex cx-items-center">
          <h1 className={ bem('title') }>Availability</h1>
          <Picker items={viewOptions} onSelect={handleViewTypeChange} className="cx-ml-2" />
        </div>
        <div className="cx-flex cx-items-center">
          <Picker items={categoryOptions} onSelect={handleCategoryChange} className="cx-mr-2" />
          <Picker items={depotOptions} onSelect={handleDepotChange} className="cx-mr-2" />
          <Picker items={coreSkillOptions} onSelect={handleCoreSkillChange} />
        </div>
      </div>
      <ResponsiveContainer>
        <ComposedChart
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
            domain={viewType.value === ViewType.Percentage ? [0, 100] : [0, 'auto']}
          />
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <Tooltip />
          <Line dataKey="resourceRequirement" name="Resource Requirement" stroke={CHART_COLORS.warning} />
          <Bar
            dataKey={viewType.value === ViewType.Percentage ? 'percentAvailability' : 'resourcesCount'}
            name="Resource(s)"
            barSize={15}
            fill={CHART_COLORS.bar}
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getFillColor(entry.percentAvailability)}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AvailabilityChart
