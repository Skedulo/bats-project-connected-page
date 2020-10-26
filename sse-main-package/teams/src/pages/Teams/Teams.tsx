import React, { memo, useState, useCallback } from 'react'
import { startOfWeek, add } from 'date-fns'
import { get } from 'lodash'
import { useSelector } from 'react-redux'

import { DEFAULT_FILTER } from '../../commons/constants'
import { Config, State, TeamFilterParams } from '../../commons/types'

import TeamGrid from '../../commons/components/TeamGrid'
import ResourceSidebar from '../../commons/components/ResourceSidebar'
import Header from '../../commons/components/Header'

import TeamFilter from './TeamFilter'

interface TeamsProps {
  children?: any
}

const Teams: React.FC<TeamsProps> = () => {
  const config = useSelector<State, Config>(state => state.config)

  const [filterParams, setFilterParams] = useState<TeamFilterParams>({
    ...DEFAULT_FILTER,
    regionIds: get(config, 'regions[2].id', ''),
    startDate: startOfWeek(new Date()),
    endDate: add(startOfWeek(new Date()), { days: 6 })
  })

  const onFilterChange = useCallback((params) => {
    setFilterParams(prev => ({ ...prev, ...params }))
  }, [])

  return (
    <div>
      <div className="cx-bg-white">
        <Header />
        <TeamFilter filterParams={filterParams} onFilterChange={onFilterChange} />
      </div>
      <div className="cx-bg-neutral-200 cx-flex" style={{ height: 'calc(100vh - 138px)' }}>
        <ResourceSidebar filterParams={filterParams} />
        <TeamGrid filterParams={filterParams} />
      </div>
    </div>
  )
}

export default memo(Teams)
