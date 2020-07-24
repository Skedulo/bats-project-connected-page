import React, { memo } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { times, toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { Avatar } from '@skedulo/sked-ui'
import { parseDurationValue, parseTimeString, addTimeValue } from '../../commons/utils'
import { IJobDetail, ITimeOption } from '../../commons/types'
import { DraggableItemTypes, DATE_FORMAT, TIME_FORMAT } from '../../commons/constants'
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

  const onStartDrag = (e: DraggableEvent) => {
    setJobPos(prev => ++prev)
  }

  const onStopDrag = (e: DraggableEvent, data: DraggableData) => {
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
  }

  const onCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (typeof handleAllocation === 'function' && job.status === 'Pending Allocation') {
      handleAllocation()
    }
  }

  const resources: React.ReactNode[] = []
  const time = job ? Math.max(job.allocations?.length || 0, toNumber(job.resourceRequirement)) : 0
  times(index => {
    const jobAllocation = job?.allocations ? job?.allocations[index] : null

    resources.push(
      <Avatar
        name={jobAllocation?.resource?.name || ''}
        key={`resourcerquired-${index}`}
        className={classnames('cx-ml-1 first:cx-ml-0', {
          'cx-bg-blue-100 cx-border cx-border-dotted cx-border-blue-500': !jobAllocation
        })}
        showTooltip={!!jobAllocation?.resource?.name}
        size="small"
        preserveName={false}
      />
    )
  }, time > 0 ? time : 1)

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
        <span className="cx-h-full" style={durationStyle} onDoubleClick={onCardClick} />
        <span className="cx-flex">
          {resources}
        </span>
        <span className="cx-pl-2" style={{ width: 'max-content' }}>
          {parseDurationValue(job.duration)}
        </span>
      </div>
    </Draggable>
  )
}

export default memo(ScheduledCard)
