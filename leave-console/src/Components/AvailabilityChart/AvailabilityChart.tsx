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
}

interface FilterParam {
  coreSkill: ISelectItem
  depot: ISelectItem
}

const AvailabilityChart: React.FC<AvailabilityChartProps> = ({ data, className, depots }) => {
  const { coreSkills } = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills
  }))

  const depotOptions = useMemo(() => {
    let options = [{ value: '', label: 'All depots' }]
    if (depots?.length) {
      options = [...options, ...depots.map(item => ({ value: item.id, label: item.name }))] 
    }
    return options
  }, [depots])

  const coreSkillOptions = useMemo(() => {
    let options = [{ value: '', label: 'All skills' }]
    if (coreSkills?.length) {
      options = [...options, ...coreSkills.map(item => ({ value: item.id, label: item.name }))] 
    }
    return options
  }, [coreSkills])

  const [filter, setFilter] = useState<FilterParam>({
    coreSkill: coreSkillOptions[0],
    depot: depotOptions[0]
  })

  const handleDepotChange = useCallback((item: ISelectItem) => {
    setFilter(prev => ({ ...prev, depot: item }))
  }, [])

  const handleCoreSkillChange = useCallback((item: ISelectItem) => {
    setFilter(prev => ({ ...prev, coreSkill: item }))
  }, [])

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
        return isMatched
      })
      return {
        ...item,
        resources: matchedResources,
        resourcesCount: matchedResources.length,
        // resourceRequirement: 3 // TODO: need to be clarified how to calculate
      }
    })
  }, [data, filter])

  return (
    <div className={ classNames(className, bem()) }>
      <div className="cx-flex cx-justify-between cx-items-center">
        <h1 className={ bem('title') }>Availability</h1>
        <div className="cx-flex cx-items-center">
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
          />
          <CartesianGrid
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <Tooltip />
          <Line dataKey="resourceRequirement" name="Resource Requirement" stroke={CHART_COLORS.warning} />
          <Bar
            dataKey="resourcesCount"
            name="Resource(s)"
            barSize={15}
            fill={CHART_COLORS.bar}
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS.bar}
                // fill={entry.resourcesCount < entry.resourceRequirement ? CHART_COLORS.warning : CHART_COLORS.bar}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AvailabilityChart
