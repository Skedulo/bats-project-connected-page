import React, { memo, useMemo, useCallback } from 'react'

import { IconButton, AvatarGroup } from '@skedulo/sked-ui'
import RowTimeslots from './RowTimeslots'
import { Team, TeamRequirement } from '../../types/Team'

interface TeamRowsProps {
  team: Team
  dateRange: Date[]
}

interface TeamRequirementRowProps {
  teamRequirement: TeamRequirement
  dateRange: Date[]
}

const TeamRequirementRow: React.FC<TeamRequirementRowProps> = ({ teamRequirement, dateRange }) => {
  const { requiredTags, allocatedResources } = useMemo(() => {
    const tagNames = teamRequirement.tags.map(item => item.name)

    return {
      requiredTags: tagNames.length > 2 ? `${tagNames[0]}, +${tagNames.length - 1} more tags` : tagNames.join(', '),
      allocatedResources: teamRequirement.allocations.map(item => item.resource)
    }
  }, [teamRequirement])

  return (
    <div className="schedule-row cx-bg-white">
      <div className="cx-flex cx-items-center cx-justify-between cx-border-b cx-border-r cx-border-neutral-400 cx-px-2 cx-py-3">
        <div className="cx-text-neutral-600">
          {requiredTags}
        </div>
        <div className="cx-min-w-36px">
          {!allocatedResources.length && (
            <IconButton
              buttonType="transparent"
              icon="plus"
              tooltipContent="Allocate"
            />
          )}
          {allocatedResources.length && (
            <AvatarGroup
              totalSlots={allocatedResources.length}
              avatarInfo={allocatedResources.map(item => ({ name: item.name }))}
              size="small"
              maxVisibleSlots={2}
            />
          )}
        </div>
      </div>
      <div className="schedule-item-weekday">
        <RowTimeslots
          dateRange={dateRange}
          teamRequirement={teamRequirement}
        />
      </div>
    </div>
  )
}

const TeamRows: React.FC<TeamRowsProps> = props => {
  const {
    team,
    dateRange
  } = props

  return (
    <div key={team.id}>
      <div className="cx-w-full cx-p-2 cx-border-b cx-border-neutral-400 cx-font-semibold">{team.name}</div>
      {team.teamRequirements.map(teamRequirement => (
        <TeamRequirementRow key={teamRequirement.id} teamRequirement={teamRequirement} dateRange={dateRange} />
      ))}
    </div>
  )
}

export default memo(TeamRows)
