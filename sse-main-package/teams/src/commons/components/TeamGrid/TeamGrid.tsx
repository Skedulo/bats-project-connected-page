import React, { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce, pickBy } from 'lodash'
import { eachDayOfInterval, format } from 'date-fns'

import { fetchTeams } from '../../../Services/DataServices'
import { updateReloadTeamsFlag, updateAllocatedTeamRequirement, updateDateRange, updateSelectedSlot } from '../../../Store/action'
import { TeamFilterParams, Team, State, SwimlaneSetting, TeamRequirement } from '../../types'
import { useGlobalLoading } from '../GlobalLoading'

import TeamAllocationModal from '../TeamAllocationModal'
import SearchBox from '../SearchBox'
import RowTimeslots from '../RowTimeslots'

import TeamRow from './TeamRow'

interface TeamGridProps {
  filterParams: TeamFilterParams
}

const TeamGrid: React.FC<TeamGridProps> = ({ filterParams }) => {
  const dispatch = useDispatch()

  const swimlaneSetting = useSelector<State, SwimlaneSetting>(state => state.swimlaneSetting)
  const shouldReloadTeams = useSelector<State, boolean>(state => state.shouldReloadTeams)
  const allocatedTeamRequirement = useSelector<State, TeamRequirement | null>(state => state.allocatedTeamRequirement)

  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const [teams, setTeams] = useState<Team[]>([])
  const [searchText, setSearchText] = useState<string>('')

  const dateRange = useMemo(() => {
    let range = eachDayOfInterval({
      start: filterParams.startDate,
      end: filterParams.endDate
    })
    if (swimlaneSetting.workingHours) {
      range = range.filter(date => {
        const excludeDays = Object.keys(pickBy(swimlaneSetting.workingHours.days, value => !value))
        return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
      })
    }
    return range
  }, [filterParams, swimlaneSetting])

  const getTeams = useCallback(async (filterParams) => {
    startGlobalLoading()
    const res = await fetchTeams(filterParams)
    endGlobalLoading()
    dispatch(updateReloadTeamsFlag(false))
    setTeams(res)
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const debouncedSearchTextChange = useMemo(() => debounce(onSearchTextChange, 700), [onSearchTextChange])

  const onCloseAllocationModal = useCallback(() => {
    dispatch(updateAllocatedTeamRequirement(null))
    dispatch(updateSelectedSlot(null))
  }, [])

  useEffect(() => {
    getTeams({ ...filterParams, searchText })
  }, [filterParams, shouldReloadTeams, searchText])

  useEffect(() => {
    dispatch(updateDateRange(dateRange))
  }, [dateRange])

  return (
    <div className="cx-flex-1">
      <div className="cx-overflow-x-scroll team-allocation-wrapper cx-relative">
        <div className="cx-grid cx-grid-cols-2/8">
          <div className="cx-font-medium cx-border-r cx-border-b">
            <SearchBox
              className="cx-border-t-0 cx-border-r-0 cx-border-l-0"
              placeholder="teams"
              onChange={debouncedSearchTextChange}
              autoFocus={false}
            />
          </div>
          <div>
            <RowTimeslots dateRange={dateRange} />
          </div>
        </div>
        {teams.map(team => (
          <TeamRow
            key={team.id}
            team={team}
            dateRange={dateRange}
          />
        ))}
        {!teams.length && <div className="cx-text-center cx-p-4">No data found.</div>}
      </div>
      {allocatedTeamRequirement && <TeamAllocationModal onClose={onCloseAllocationModal} />}
    </div>
  )
}

export default memo(TeamGrid)
