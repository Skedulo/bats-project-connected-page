import React, { memo, useCallback, useMemo } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { GroupAvatars, StatusIcon, Tooltip } from '@skedulo/sked-ui'
import { parseDurationValue, parseTimeString, addTimeValue, getDependencyConflicts } from '../../commons/utils'
import { IJobDetail, ITimeOption } from '../../commons/types'
import { DATE_FORMAT, TIME_FORMAT } from '../../commons/constants'
import { addMinutes, format, parse, add } from 'date-fns'

interface IScheduledCardProps {
  job: IJobDetail
  cardPosition: number
  travelTimeStyle: Record<string, string>
  durationStyle: Record<string, string>
  travelTime: number
  handleAllocation?: (zonedDate?: string, zonedTime?: number) => void
  handleDrag?: (newDate: string, newTime: number) => void
  draggable?: boolean
  slotUnit: string
  widthPerMin: number
  snapUnit?: number
  slotTime: ITimeOption
  enableWorkingHourWeekMonth: boolean
  dateRange: Date[]
  dateRangeIndex: number
}

const ScheduledCard: React.FC<IScheduledCardProps> = props => {
  const {
    job,
    cardPosition,
    travelTime,
    travelTimeStyle,
    durationStyle,
    handleAllocation,
    handleDrag,
    slotUnit,
    draggable,
    widthPerMin,
    snapUnit,
    slotTime,
    enableWorkingHourWeekMonth,
    dateRange,
    dateRangeIndex
  } = props
  const [jobPos, setJobPos] = React.useState<number>(cardPosition)
  const dragGrid = widthPerMin * toNumber(snapUnit)

  const onStartDrag = useCallback((e: DraggableEvent) => {
    setJobPos(prev => ++prev)
  }, [])

  const onStopDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
    setJobPos(prev => --prev)
    if (typeof handleDrag === 'function' && snapUnit && job) {
      const draggedMinutes = (Math.round(data.lastX / dragGrid)) * snapUnit
      const currentDate = parse(
        `${job.startDate} ${job.startTimeString}`,
        `${DATE_FORMAT} ${TIME_FORMAT}`,
        new Date()
      )
      let newDate = job.startDate
      let newTime = job.startTime
      // specific for case enable working hour with range is 'month' and 'week'
      if (enableWorkingHourWeekMonth) {
        let newColIndex = dateRangeIndex
        newTime = addTimeValue(newTime, draggedMinutes)
        const interval = newTime < slotTime.numberValue ? -1 : 1
        while (newTime >= slotTime.boundValue || newTime < slotTime.numberValue) {
          newColIndex += interval
          newTime = (slotTime.numberValue - slotTime.boundValue) * interval + newTime
        }
        newDate = format(dateRange[newColIndex], DATE_FORMAT)
      } else {
        const newDatetime = addMinutes(currentDate, draggedMinutes)
        newDate = format(newDatetime, DATE_FORMAT)
        newTime = toNumber(parseTimeString(format(newDatetime, TIME_FORMAT)))
      }
      if (newDate !== job.startDate || newTime !== job.startTime) {
        handleDrag(newDate, newTime)
      }
    }
  }, [])

  const onCardClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (typeof handleAllocation === 'function' && job.status === 'Pending Allocation') {
      handleAllocation()
    }
  }, [])

  const { totalResources, avatarInfo, conflictMessage } = useMemo(() => {
    const dependencyConflicts = getDependencyConflicts(job, job.toJobDependencies || [])

    return {
      totalResources: job ? Math.max(job.allocations?.length || 0, toNumber(job.resourceRequirement)) : 0,
      avatarInfo: job.allocations?.length > 0 ?
        job.allocations.map(item => ({ name: item.resource?.name || '', tooltipText: item.resource?.name || '' })) :
        [],
      conflictMessage: dependencyConflicts.length > 0 ? dependencyConflicts.map(c => c.message).join('\n') : '',
    }
  }, [job])

  return (
    <Draggable
      axis="x"
      onStart={onStartDrag}
      onStop={onStopDrag}
      grid={[dragGrid, dragGrid]}
      disabled={!draggable}
    >
      <div
        className={classnames('cx-flex cx-items-center cx-absolute cx-z-1', {
          'cx-cursor-pointer': draggable || handleAllocation
        })}
        style={{
          height: '80%',
          left: cardPosition + slotUnit,
        }}
      >
        {travelTime > 0 && (
          <span
            className="cx-bg-neutral-500"
            style={travelTimeStyle}
          />
        )}
        <span
          className="cx-h-full cx-rounded"
          style={!conflictMessage ? durationStyle : {
            ...durationStyle,
            backgroundColor: 'white',
            border: '1px solid #DD6359',
            position: 'relative'
          }}
          onDoubleClick={onCardClick}
        >
          {conflictMessage && (
            <Tooltip position="top" content={conflictMessage}>
              <StatusIcon className="cx-absolute cx-m-2px cx-text-xs cx-w-4 cx-h-4" status="error" />
            </Tooltip>
          )}
        </span>
        <span className="cx-flex">
          <GroupAvatars
            totalSlots={totalResources > 0 ? totalResources : 1}
            avatarInfo={avatarInfo}
            maxVisibleSlots={5}
          />
        </span>
        <span className="cx-ml-2" style={{ width: 'max-content' }}>
          {parseDurationValue(job.duration)}
        </span>
      </div>
    </Draggable>
  )
}

export default memo(ScheduledCard)
