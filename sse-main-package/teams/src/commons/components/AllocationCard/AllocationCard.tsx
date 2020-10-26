import React, { memo, useMemo, useState } from 'react'
import { Rnd, DraggableData, RndDragEvent } from 'react-rnd'
import classnames from 'classnames'
import { differenceInBusinessDays, add, format, isSameDay } from 'date-fns'
import { Avatar } from '@skedulo/sked-ui'

import { TeamAllocation } from '../../types/Team'
import { allocateTeamMember } from '../../../Services/DataServices'
import { DATE_FORMAT } from '../../constants'
import { useGlobalLoading } from '../GlobalLoading'
import { toastMessage } from '../../utils'

interface TeamAllocationCardProps {
  teamAllocation: TeamAllocation
  cardPosition: number
  handleAllocation?: () => void
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
    slotUnit,
    slotWidth,
    draggable,
    isConflict
  } = props
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const { startDate, endDate } = useMemo(() => ({ startDate: new Date(teamAllocation.startDate), endDate: new Date(teamAllocation.endDate) }), [teamAllocation])
  const duration = useMemo(() => differenceInBusinessDays(endDate, startDate) + 1, [startDate, endDate])

  const [allocationSize, setAllocationSize] = useState<{ width: string, height: string }>({
    width: `${duration * slotWidth}${slotUnit}`,
    height: '90%'
  })

  const updateAllocation = async (newStartDate: Date, newEndDate: Date) => {
    startGlobalLoading()
    const success = await allocateTeamMember({
      id: teamAllocation.id,
      startDate: format(newStartDate, DATE_FORMAT),
      endDate: format(newEndDate, DATE_FORMAT)
    })
    endGlobalLoading()
    if (!success) {
      toastMessage.error('Unsuccessfully!')
    }
  }

  const onDragStop = (e: RndDragEvent, data: DraggableData) => {
    e.stopPropagation()
    const draggedDays = (Math.round((data.lastX - cardPosition) / cardPosition))
    const newStartDate = add(startDate, { days: draggedDays })
    const newEndDate = add(endDate, { days: draggedDays })
    if (isSameDay(newStartDate, startDate)) {
      return
    }
    if (teamAllocation.id) {
      updateAllocation(newStartDate, newEndDate)
    } else {
      console.log('newStartDate: ', newStartDate)
    }
  }

  const onCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (typeof handleAllocation === 'function') {
      handleAllocation()
    }
  }

  const onStopResize = (e: MouseEvent | TouchEvent, direction: string, ref: HTMLElement, delta: any, position: any) => {
    e.stopPropagation()
    let newStartDate = startDate
    let newEndDate = endDate
    const newDuration = Math.round(delta.width / slotWidth)
    if (direction === 'left') {
      newStartDate = add(startDate, { days: newDuration })
    }
    if (direction === 'right') {
      newEndDate = add(endDate, { days: newDuration })
    }
    setAllocationSize(prev => {
      return {
        width: ref.style.width,
        height: ref.style.height,
        ...position
      }
    })
    if (isSameDay(newStartDate, startDate) && isSameDay(newEndDate, endDate)) {
      return
    }
    if (teamAllocation.id) {
      updateAllocation(newStartDate, newEndDate)
    } else {
      console.log('newStartDate: ', newStartDate)
    }
  }

  return (
    <Rnd
      size={allocationSize}
      onResizeStop={onStopResize}
      resizeGrid={[slotWidth, slotWidth]}
      dragGrid={[slotWidth, slotWidth]}
      dragAxis="x"
      minHeight='90%'
      maxHeight='90%'
      onDragStop={onDragStop}
    >
      <div
        className={classnames('cx-flex cx-items-center cx-absolute cx-z-1 cx-p-1 cx-text-white cx-rounded', {
          'cx-cursor-pointer': draggable || handleAllocation
        })}
        onDoubleClick={onCardClick}
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: isConflict ? 'white' : !teamAllocation.id ? '#008CFF' : '#4A556A',
          border: `1px solid ${isConflict ? 'red' : !teamAllocation.id ? '#008CFF' : '#4A556A'}`,
          marginTop: '2px',
          zIndex: 1
        }}
      >
        {teamAllocation.id && (
          <Avatar
            name={teamAllocation.resource?.name || ''}
            size="tiny"
          />
        )}
        <div className="cx-ml-2 cx-truncate">
          <div className="cx-text-xs cx-font-semibold cx-truncate">
            {teamAllocation.id ? teamAllocation.resource?.name : teamAllocation.teamName}
          </div>
          {teamAllocation.id && <div className="cx-text-xxs cx-mt-2px">{teamAllocation.resource?.category}</div>}
        </div>
      </div>
    </Rnd>
  )

  // return (
  //   <Draggable
  //     axis="x"
  //     onStart={onStartDrag}
  //     onStop={onStopDrag}
  //     grid={[slotWidth, slotWidth]}
  //     disabled={!draggable}
  //   >
  //     <Rnd
  //       size={allocationSize}
  //       onResizeStop={onStopResize}
  //       resizeGrid={[slotWidth, slotWidth]}
  //       dragGrid={[slotWidth, slotWidth]}
  //       dragAxis="x"
  //     >
  //       <div
  //         className={classnames('cx-flex cx-items-center cx-absolute cx-z-1 cx-p-1 cx-text-white cx-rounded', {
  //           'cx-cursor-pointer': draggable || handleAllocation
  //         })}
  //         onDoubleClick={onCardClick}
  //         style={{
  //           height: '90%',
  //           width: `${duration * slotWidth}${slotUnit}`,
  //           backgroundColor: isConflict ? 'white' : teamAllocation.isPlanning ? '#008CFF' : '#4A556A',
  //           border: `1px solid ${isConflict ? 'red' : teamAllocation.isPlanning ? '#008CFF' : '#4A556A'}`,
  //           marginTop: '2px',
  //           zIndex: 1
  //         }}
  //       >
  //         {teamAllocation.displayType !== 'team' && (
  //           <Avatar
  //             name={teamAllocation.resource?.name || ''}
  //             size="tiny"
  //           />
  //         )}
  //         <div className="cx-ml-2 cx-truncate">
  //           <div className="cx-text-xs cx-font-semibold cx-truncate">
  //             {teamAllocation.displayType !== 'team' ? teamAllocation.resource?.name : teamAllocation.teamName}
  //           </div>
  //           {teamAllocation.displayType !== 'team' && <div className="cx-text-xxs cx-mt-2px">{teamAllocation.resource?.category}</div>}
  //         </div>
  //       </div>
  //     </Rnd>
  //   </Draggable>
  // )
}

export default memo(TeamAllocationCard)
