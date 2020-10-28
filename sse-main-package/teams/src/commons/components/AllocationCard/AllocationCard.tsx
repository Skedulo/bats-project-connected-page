import React, { memo, useMemo, useState, useCallback } from 'react'
import { Rnd, DraggableData, RndDragEvent } from 'react-rnd'
import classnames from 'classnames'
import { differenceInCalendarDays, add, format, isSameDay, isAfter, isBefore } from 'date-fns'
import { Avatar, StatusIcon, Tooltip } from '@skedulo/sked-ui'
import { useSelector } from 'react-redux'

import { TeamAllocation } from '../../types/Team'
import { allocateTeamMember } from '../../../Services/DataServices'
import { LEAVE_DATE_FORMAT, DATE_FORMAT } from '../../constants'
import { useGlobalLoading } from '../GlobalLoading'
import { toastMessage } from '../../utils'
import { SelectedSlot, State } from '../../types'

interface TeamAllocationCardProps {
  teamAllocation: TeamAllocation
  onSelectSlot?: (selectedSlot: SelectedSlot) => void
  draggable?: boolean
  slotUnit: string
  slotWidth: number
}

const TeamAllocationCard: React.FC<TeamAllocationCardProps> = props => {
  const {
    teamAllocation,
    onSelectSlot,
    slotUnit,
    slotWidth,
    draggable
  } = props
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const selectedSlot = useSelector<State, SelectedSlot | null>(state => state.selectedSlot)
  const dateRange = useSelector<State, Date[]>(state => state.dateRange)
  const { startDate, endDate } = useMemo(() => ({ startDate: new Date(teamAllocation.startDate), endDate: new Date(teamAllocation.endDate) }), [teamAllocation])
  const duration = useMemo(() => differenceInCalendarDays(endDate, startDate) + 1, [startDate, endDate])

  const { isConflict, conflictContent } = useMemo(() => {
    return {
      isConflict: teamAllocation.isAvailable === false,
      conflictContent: teamAllocation.unavailabilityPeriods?.map(period => {
        return `Unavailability: ${format(new Date(period.startDate), LEAVE_DATE_FORMAT)} - ${format(new Date(period.endDate), LEAVE_DATE_FORMAT)}`
      }).join('\n')
    }
  }, [teamAllocation])

  const [allocationSize, setAllocationSize] = useState<{ width: string, height: string }>({
    width: `${duration * slotWidth}${slotUnit}`,
    height: '100%'
  })

  const [allocationPosition, setAllocationPosition] = useState<{ x: number, y: number }>({
    x: 0,
    y: 0
  })

  const updateAllocation = useCallback(async (id: string, newStartDate: Date, newEndDate: Date) => {
    startGlobalLoading()
    const success = await allocateTeamMember({
      id: id,
      startDate: format(newStartDate, DATE_FORMAT),
      endDate: format(newEndDate, DATE_FORMAT)
    })
    endGlobalLoading()
    if (success) {
    } else {
      toastMessage.error('Unsuccessfully!')
    }
  }, [])

  const onCardClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log('onCardClick')
    e.stopPropagation()
    if (typeof onSelectSlot === 'function') {
      onSelectSlot({ startDate, endDate, id: teamAllocation.id, resource: teamAllocation.resource })
    }
  }, [startDate, endDate, teamAllocation])

  const onDragStop = (e: RndDragEvent, data: DraggableData) => {
    e.stopPropagation()
    if (!data.deltaX) {
      return
    }
    const draggedDays = Math.round(data.lastX / slotWidth)
    const newStartDate = add(startDate, { days: draggedDays })
    const newEndDate = add(endDate, { days: draggedDays })

    if (isSameDay(newStartDate, startDate)) {
      return
    }
    if (isAfter(newEndDate, dateRange[dateRange.length - 1]) || isBefore(newStartDate, dateRange[0])) {
      return
    }

    setAllocationPosition({ x: draggedDays * slotWidth, y: 0 })
    if (!selectedSlot && teamAllocation.id) {
      updateAllocation(teamAllocation.id, newStartDate, newEndDate)
    } else {
      console.log('newStartDate: ', newStartDate)
    }
  }

  const onStopResize = useCallback((e: MouseEvent | TouchEvent, direction: string, ref: HTMLElement, delta: any, position: any) => {
    e.stopPropagation()
    if (direction === 'top' || direction === 'bottom' || !delta.width) {
      return
    }
    let newStartDate = startDate
    let newEndDate = endDate
    const newDuration = Math.round(delta.width / slotWidth)
    if (direction === 'left') {
      newStartDate = add(startDate, { days: -newDuration })
    }
    if (direction === 'right') {
      newEndDate = add(endDate, { days: newDuration })
    }
    setAllocationSize({
      width: ref.style.width,
      height: ref.style.height
    })
    setAllocationPosition(position)
    if (isSameDay(newStartDate, startDate) && isSameDay(newEndDate, endDate)) {
      return
    }
    if (!selectedSlot && teamAllocation.id) {
      updateAllocation(teamAllocation.id, newStartDate, newEndDate)
    } else {
      console.log('newStartDate: ', newStartDate)
    }
  }, [startDate, endDate, slotWidth])

  return (
    <Rnd
      size={allocationSize}
      position={allocationPosition}
      onResizeStop={onStopResize}
      resizeGrid={[slotWidth, slotWidth]}
      dragGrid={[slotWidth, slotWidth]}
      dragAxis="x"
      minHeight='100%'
      onDragStop={onDragStop}
      disableDragging={!!selectedSlot}
      enableResizing={!selectedSlot && {
        bottom: false,
        bottomLeft: false,
        bottomRight: false,
        left: true,
        right: true,
        top: false,
        topLeft: false,
        topRight: false
      }}
      style={{
        height: '100%',
        width: (slotWidth * duration) - 2,
        zIndex: 1
      }}
    >
      <div
        className={classnames('cx-flex cx-items-center cx-full cx-p-1 cx-m-2px cx-rounded', {
          'cx-cursor-pointer': draggable || onSelectSlot
        })}
        onDoubleClickCapture={onCardClick}
        style={{
          height: 'calc(100% - 4px)',
          backgroundColor: isConflict ? 'white' : teamAllocation.isPlanning ? '#008CFF' : '#4A556A',
          border: `1px solid ${isConflict ? 'red' : teamAllocation.isPlanning ? '#008CFF' : '#4A556A'}`,
          color: isConflict ? '#4A556A' : 'white'
        }}
      >
        {!selectedSlot && <Avatar name={teamAllocation.resource?.name || ''} size="tiny" />}
        <div className="cx-ml-2 cx-truncate">
          <div className="cx-text-xs cx-font-semibold cx-truncate">
            {!selectedSlot ? teamAllocation.resource?.name : teamAllocation.teamName}
          </div>
          {!selectedSlot && <div className="cx-text-xxs cx-mt-2px">{teamAllocation.resource?.category}</div>}
        </div>
        {isConflict && (
          <Tooltip content={conflictContent} position="top" className="cx-absolute cx-right-1 cx-top-1 cx-z-10">
            <StatusIcon status="error" />
          </Tooltip>
        )}
      </div>
    </Rnd>
  )
}

export default memo(TeamAllocationCard)
