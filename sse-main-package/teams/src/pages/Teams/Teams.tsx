import React, { memo, useState, useCallback } from 'react'

import ResourceSidebar from '../../commons/components/ResourceSidebar'
import Header from '../../commons/components/Header'
import { DEFAULT_FILTER } from '../../commons/constants'
import { TeamFilterParams } from '../../commons/types/Team'

import TeamFilter from './TeamFilter'
import TeamGrid from '../../commons/components/TeamGrid'
import { startOfWeek, add } from 'date-fns'

interface TeamsProps {
  children?: any
}

const Teams: React.FC<TeamsProps> = () => {
  const [filterParams, setFilterParams] = useState<TeamFilterParams>({
    ...DEFAULT_FILTER,
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
        <TeamFilter  onFilterChange={onFilterChange} />
      </div>
      <div className="cx-bg-neutral-200 cx-flex" style={{ height: 'calc(100vh - 138px)' }}>
        <ResourceSidebar regionId={filterParams.regionIds || 'a0M3L000000EEk4UAG'} />
        <TeamGrid filterParams={filterParams} />
      </div>
    </div>
  )
}

export default memo(Teams)
