import React, { memo } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { times, toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { Avatar } from '@skedulo/sked-ui'
import { parseDurationValue, parseTimeString } from '../../commons/utils'
import { IJobDetail } from '../../commons/types'
import { DraggableItemTypes, DATE_FORMAT, TIME_FORMAT } from '../../commons/constants'
import { addMinutes, format, parse } from 'date-fns'

interface IScheduledCardProps {
  job: IJobDetail
  cardPosition: number
  travelTimeStyle: Record<string, string>
  durationStyle: Record<string, string>
  travelTime: number
  handleClick?: () => void
  handleDrag?: (newDate: string, newTime: number) => void
  draggable?: boolean
  slotUnit: string
  widthPerMin: number
  snapUnit?: number
}

const ScheduledCard: React.FC<IScheduledCardProps> = props => {
  const {
    job,
    cardPosition,
    travelTime,
    travelTimeStyle,
    durationStyle,
    handleClick,
    handleDrag,
    slotUnit,
    draggable,
    widthPerMin,
    snapUnit
  } = props
  const [jobPos, setJobPos] = React.useState<number>(cardPosition)
  const dragGrid = widthPerMin * toNumber(snapUnit)

  const onStartDrag = () => {
    setJobPos(prev => ++prev)
  }

  const onStopDrag = (e: DraggableEvent, data: DraggableData) => {
    setJobPos(prev => --prev)
    if (typeof handleDrag === 'function' && snapUnit && job) {
      const draggedMinutes = (data.lastX / dragGrid) * snapUnit
      const currentDate = parse(
        `${job?.startDate} ${job?.startTimeString}`,
        `${DATE_FORMAT} ${TIME_FORMAT}`,
        new Date()
      )
      const newDatetime = addMinutes(currentDate, draggedMinutes)
      const newDate = format(newDatetime, DATE_FORMAT)
      const newTime = toNumber(parseTimeString(format(newDatetime, TIME_FORMAT)))
      if (newDate !== job.startDate || newTime !== job.startTime) {
        handleDrag(newDate, newTime)
      }
    }
  }

  const onCardClick = () => {
    if (typeof handleClick === 'function') {
      handleClick()
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
      // bounds={{ left: '30%' }}
    >
      <div
        onClick={onCardClick}
        className={classnames('cx-flex cx-items-center cx-absolute cx-z-1', {
          'cx-cursor-pointer': draggable || handleClick
        })}
        style={{
          height: '80%',
          left: cardPosition + slotUnit,
        }}
        >
        {travelTime > 0 && (
          <span className="cx-bg-neutral-500" style={travelTimeStyle} />
        )}
        <span className="cx-h-full" style={durationStyle} />
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
