import React, { memo, useMemo } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import classnames from 'classnames'
import { differenceInDays, differenceInBusinessDays } from 'date-fns'

import { Avatar } from '@skedulo/sked-ui'
import { TeamAllocation } from '../../types/Team'

interface TeamAllocationCardProps {
  teamAllocation: TeamAllocation
  cardPosition: number
  handleAllocation?: (zonedDate?: string, zonedTime?: number) => void
  handleDrag?: (newDate: string, newTime: number) => void
  draggable?: boolean
  slotUnit: string
  slotWidth: number
  dateRange: Date[]
  isConflict: boolean
}

const TeamAllocationCard: React.FC<TeamAllocationCardProps> = props => {
  const {
    teamAllocation,
    cardPosition,
    handleAllocation,
    handleDrag,
    slotUnit,
    slotWidth,
    draggable,
    isConflict
  } = props
  const [allocationPos, setAllocationPos] = React.useState<number>(cardPosition)

  const onStartDrag = (e: DraggableEvent) => {
    setAllocationPos(prev => ++prev)
  }

  const onStopDrag = (e: DraggableEvent, data: DraggableData) => {
    setAllocationPos(prev => --prev)
    if (typeof handleDrag === 'function') {
      console.log('drag');
    }
  }

  const onCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (typeof handleAllocation === 'function') {
      handleAllocation()
    }
  }

  const duration = useMemo(() => differenceInBusinessDays(new Date(teamAllocation.endDate), new Date(teamAllocation.startDate)) + 1, [teamAllocation])

  return (
    <Draggable
      axis="x"
      onStart={onStartDrag}
      onStop={onStopDrag}
      grid={[slotWidth, slotWidth]}
      disabled={!draggable}
    >
      <div
        className={classnames('cx-flex cx-items-center cx-absolute cx-z-1 cx-p-1 cx-text-white cx-rounded', {
          'cx-cursor-pointer': draggable || handleAllocation
        })}
        style={{
          height: '90%',
          left: 0,
          width: `${duration * slotWidth}${slotUnit}`,
          backgroundColor: isConflict ? 'white' : '#4A556A',
          border: `1px solid ${isConflict ? 'red' : '#4A556A'}`,
          marginTop: '3px',
          zIndex: 1
        }}
      >
        <span className="cx-flex">
          <Avatar
            name={teamAllocation.resource.name}
            size="tiny"
          />
        </span>
        <div className="cx-ml-2 cx-truncate">
          <div className="cx-text-xs cx-font-semibold cx-truncate">{teamAllocation.resource.name}</div>
          <div className="cx-text-xxs cx-mt-2px">{teamAllocation.resource.category}</div>
        </div>
      </div>
    </Draggable>
  )
}

export default memo(TeamAllocationCard)
