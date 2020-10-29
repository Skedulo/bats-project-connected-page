import React, { memo, useMemo, useCallback } from 'react'
import { AvatarGroup, Icon } from '@skedulo/sked-ui'
import classnames from 'classnames'
import { get } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import { Team, TeamRequirement, TeamSuggestion } from '../../types/Team'
import { updateAllocatedTeamRequirement, updateSelectedSlot } from '../../../Store/action'

import RowTimeslots from '../RowTimeslots'
import { SelectedSlot, State } from '../../types'

interface TeamRowProps {
  team: Team
  dateRange: Date[]
}

interface TeamRequirementRowProps {
  teamRequirement: TeamRequirement
  dateRange: Date[]
  isFirstRow: boolean
}

const TeamRequirementRow: React.FC<TeamRequirementRowProps> = ({ teamRequirement, dateRange, isFirstRow }) => {
  const dispatch = useDispatch()
  const suggestions = useSelector<State, Record<string, TeamSuggestion>>(state => state.suggestions)
  const { requiredTags, allocatedResources } = useMemo(() => {
    const tagNames: string[] = teamRequirement.tags && teamRequirement.tags.length > 0
      ? teamRequirement.tags.map(item => get(item, 'tag.name', ''))
      : ['--']

    return {
      requiredTags: tagNames.length > 2 ? `${tagNames[0]}, +${tagNames.length - 1} more tags` : tagNames.join(', '),
      allocatedResources: teamRequirement.allocations?.map(item => item.resource) || []
    }
  }, [teamRequirement])

  const onAllocateTeamRequirement = useCallback(() => {
    dispatch(updateAllocatedTeamRequirement(teamRequirement))
  }, [teamRequirement, dateRange])

  const onSelectSlot = useCallback((selectedSlot: SelectedSlot | null) => {
    dispatch(updateSelectedSlot(selectedSlot || { startDate: dateRange[0], endDate: dateRange[dateRange.length - 1] }))
    onAllocateTeamRequirement()
  }, [onAllocateTeamRequirement])

  return (
    <div className="cx-grid cx-grid-cols-2/8 cx-bg-white">
      <div
        className={classnames('cx-flex cx-items-center cx-justify-between cx-border-b cx-border-r cx-px-2 cx-py-3', {
          'cx-border-t': isFirstRow
        })}
      >
        <div className="cx-text-neutral-600">
          {requiredTags}
        </div>
        <div className="cx-min-w-36px">
          {!allocatedResources.length && (
            <Icon
              className="cx-text-neutral-600 cx-cursor-pointer"
              name="plus"
              onClick={() => onSelectSlot(null)}
            />
          )}
          {allocatedResources.length > 0 && (
            <AvatarGroup
              totalSlots={allocatedResources.length}
              avatarInfo={allocatedResources.map(item => ({ name: item?.name }))}
              size="small"
              maxVisibleSlots={2}
            />
          )}
        </div>
      </div>
      <div className="slot-wrapper">
        <RowTimeslots
          dateRange={dateRange}
          teamAllocations={teamRequirement.allocations || []}
          onSelectSlot={onSelectSlot}
          isFirstRow={isFirstRow}
          suggestion={get(suggestions, `${teamRequirement.id || ''}`)}
        />
      </div>
    </div>
  )
}

const TeamRow: React.FC<TeamRowProps> = props => {
  const {
    team,
    dateRange
  } = props

  return (
    <div key={team.id}>
      <div className="cx-w-full cx-p-2 cx-font-semibold">{team.name}</div>
      {team.teamRequirements.map((teamRequirement, index) => (
        <TeamRequirementRow key={teamRequirement.id} teamRequirement={teamRequirement} dateRange={dateRange} isFirstRow={index === 0} />
      ))}
    </div>
  )
}

export default memo(TeamRow)
