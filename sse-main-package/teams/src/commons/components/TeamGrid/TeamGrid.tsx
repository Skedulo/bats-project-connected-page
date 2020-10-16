import React, { memo, useState, ChangeEvent, useCallback, useMemo, useEffect } from 'react'
import { Resource, ITimeOption, WeekDay, State, SwimlaneSetting } from '../../types'
import { FormInputElement, SearchSelect, ISelectItem, Icon, Button, Time, PopOut, IconButton } from '@skedulo/sked-ui'
import { useSelector, useDispatch } from 'react-redux'
import { fetchResourcesByRegion, fetchTeams } from '../../../Services/DataServices'
import { startLoading, endLoading } from '../../../Store/action'
import SearchBox from '../SearchBox'
import { debounce, pickBy } from 'lodash'
import ResourceCard from '../ResourceCard'
import { TeamFilterParams, Team } from '../../types/Team'
import './styles.scss'
import RowTimeslots from './RowTimeslots'
import { eachDayOfInterval, format } from 'date-fns'
import TeamRows from './TeamRows'

interface TeamGridProps {
  filterParams: TeamFilterParams
}

const TeamGrid: React.FC<TeamGridProps> = ({ filterParams }) => {
  const dispatch = useDispatch()
  const swimlaneSetting = useSelector<State, SwimlaneSetting>(state => state.swimlaneSetting)
  const [teams, setTeams] = useState<Team[]>([])

  const [searchText, setSearchText] = useState<string>('')
  const [timeError, setTimeError] = useState<string>('')
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
    dispatch(startLoading())
    const res = await fetchTeams(filterParams.regionIds)
    dispatch(endLoading())
    setTeams(res)
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const debouncedSearchTextChange = useMemo(() => debounce(onSearchTextChange), [onSearchTextChange])

  useEffect(() => {
    getTeams(filterParams)
  }, [filterParams])

  return (
    <div className="cx-flex-1">
      <div className="cx-overflow-x-scroll schedule-table cx-relative">
        <div className="schedule-row">
          <div className="schedule-item-job cx-uppercase cx-font-medium">
            <SearchBox
              className="cx-border-t-0 cx-border-r-0 cx-border-l-0"
              placeholder="teams"
              onChange={debouncedSearchTextChange}
              autoFocus={false}
            />
          </div>
          <div className="schedule-item-weekday">
            <RowTimeslots
              dateRange={dateRange}
              swimlaneSetting={swimlaneSetting}
            />
          </div>
        </div>
        {teams.map(team => (
          <TeamRows
            key={team.id}
            team={team}
            dateRange={dateRange}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(TeamGrid)
