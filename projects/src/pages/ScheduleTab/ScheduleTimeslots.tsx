import React, { memo, useCallback, useMemo } from 'react'
import { times, toNumber, pickBy } from 'lodash/fp'
import classnames from 'classnames'
import { format } from 'date-fns-tz'
import { getDaysInMonth, eachDayOfInterval, add, isToday } from 'date-fns'
import { RangeType, Avatar, GroupAvatars, Tooltip, Icon } from '@skedulo/sked-ui'
import { IJobDetail, ITimeOption, ISwimlaneSettings, IWorkingHours, IJobSuggestion } from '../../commons/types'
import ScheduledCard from './ScheduledCard'
import SuggestionCard from './SuggestionCard'
import Timeslot from './Timeslot'
import {
  SCHEDULE_JOB_STATUS_COLOR,
  DATE_FORMAT,
} from '../../commons/constants'
import {
  getTimePickerOptions,
  parseTimeValue,
  parseDurationFromTimeRange,
  parseTimeString,
  addTimeValue
} from '../../commons/utils'

const DEFAULT_SLOT_WIDTH = 50
const SLOT_WIDTH_UNIT = 'px'
const DRAGGABLE_JOB_STATUS = ['Pending Allocation', 'Pending Dispatch', 'Dispatched']

const generateScheduleHeaderCell = (
  rangeType: RangeType,
  dateRange: Date[],
  totalMinutes: number,
  slotWidth: number,
  timeCols: ITimeOption[],
  workingHours: IWorkingHours
) => {
  const dateCols: React.ReactElement[] = []
  let currentTimeIndicatorPosition = null

  dateRange.forEach((date, index) => {
    const formattedWeekday = rangeType !== 'month' ? format(date, 'EEEE dd') : format(date, 'eee dd')
    const today = isToday(date)
    if (today) {
      // get current time indicator
      const currentDate = new Date()
      const currentHours = currentDate.getHours()
      const currentMinutes = currentDate.getMinutes()
      // parse to minutes
      const currentTimeValue = currentHours * 100 + currentMinutes
      const currentTimeInMinute = currentHours * 60 + currentMinutes
      // width of current time compare with 1 day + width of before days (base on the index)
      if (!workingHours.enabled ||
        (workingHours.enabled &&
        currentTimeValue >= workingHours.startTime &&
        currentTimeValue <= workingHours.endTime)
      ) {
        const ignoredTime = workingHours.enabled ? parseDurationFromTimeRange(0, workingHours.startTime) : 0

        currentTimeIndicatorPosition = (
          (currentTimeInMinute - ignoredTime) / totalMinutes) * slotWidth * timeCols.length
          + index * slotWidth * timeCols.length
      }
    }

    dateCols.push(
      <div
        key={formattedWeekday}
        className={classnames('day cx-w-full cx-uppercase', {
          'cx-text-primary': !!today
        })}
        style={{
          gridColumnStart: index * timeCols.length + 1,
          gridColumnEnd: index * timeCols.length + 1 + timeCols.length,
          justifySelf: 'center',
        }
      }>
        {formattedWeekday}
      </div>
    )
  })

  if (rangeType !== 'month') {
    times(dateRangeIndex => {
      if (workingHours.enabled && rangeType === 'week') {
        dateCols.push(
          <div className="timeslot cx-text-center" key={`${workingHours.startTime}-${dateRangeIndex}`}>
            {`${parseTimeValue(workingHours.startTime)} - ${parseTimeValue(workingHours.endTime)}`}
          </div>
        )
      } else {
        timeCols.forEach((item: ITimeOption, indexTime) => {
          dateCols.push(
            <div className="timeslot" key={`${item.stringValue}-${dateRangeIndex}`}>
              {item.stringValue}
            </div>
          )
        })
      }
    }, dateRange.length)
  }

  return { dateCols, currentTimeIndicatorPosition }
}

const generateScheduleDataCell = (
  rangeType: RangeType,
  dateRange: Date[],
  totalMinutes: number,
  slotWidth: number,
  timeGap: number,
  timeCols: ITimeOption[],
  swimlaneSettings: ISwimlaneSettings,
  job: IJobDetail,
  suggestions?: IJobSuggestion[],
  handleDragJob?: (newZonedDate: string, newZonedTime: number) => void,
  handleAllocation?: (zonedDate: string, zonedTime: number) => void,
) => {
  const { workingHours, snapUnitConsole } = swimlaneSettings
  const isDayWorkingHour = rangeType === 'day' && workingHours.enabled
  const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))
  const dateCols: React.ReactElement[] = []

  const isUnscheduled = !job.startDate || !job.startTime
  const minutesPerBlock = workingHours.enabled && ['month', 'week'].includes(rangeType) ? totalMinutes : timeGap
  const resourceTravelTime = job.allocations ? job.allocations.filter(item => !!item.plannedTravelTime) : []
  const maxTravelTime = resourceTravelTime.length ?
    Math.max(...resourceTravelTime.map(item => item.plannedTravelTime)) :
    0

  times(dateRangeIndex => {
    const formattedDateString = format(dateRange[dateRangeIndex], DATE_FORMAT)
    // display disabled cell data
    if (isDayWorkingHour && excludeDays.includes(format(dateRange[dateRangeIndex], 'EEEE').toLowerCase())) {
      timeCols.forEach((item: ITimeOption, indexTime) => {
        dateCols.push(
          <Timeslot
            className="cx-bg-neutral-350"
            key={`${item.stringValue}-${dateRangeIndex}`}
            slotDate={formattedDateString}
            slotTime={item.numberValue}
          />
        )
      })
    } else {
      // display week and month view when working hours is enable
      timeCols.forEach((item: ITimeOption, indexTime) => {
        // display schedule data
        const isMatchedJob = formattedDateString === job.startDate &&
          job.startTime >= item.numberValue &&
          job.startTime < item.boundValue

        const matchedSuggestion =  suggestions?.find(sg => {
          return sg.startDate === formattedDateString &&
            sg.startTime >= item.numberValue &&
            sg.startTime < item.boundValue
        })

        const widthPerMin = slotWidth / minutesPerBlock

        dateCols.push(
          <Timeslot
            key={`${item.stringValue}-${dateRangeIndex}`}
            handleClick={isUnscheduled ? handleAllocation : undefined}
            slotDate={formattedDateString}
            slotTime={item.numberValue}
          >
            {isMatchedJob && (
              <ScheduledCard
                job={job}
                key={`${job.startDate}-${job.startTime}`}
                widthPerMin={widthPerMin}
                slotUnit={SLOT_WIDTH_UNIT}
                snapUnit={snapUnitConsole}
                cardPosition={parseDurationFromTimeRange(item.numberValue, job.startTime) * widthPerMin}
                travelTime={maxTravelTime}
                travelTimeStyle={{
                  height: '2px',
                  width: `${(maxTravelTime / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  marginLeft: `-${(maxTravelTime / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`
                }}
                durationStyle={{
                  width: `${(job.duration / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                }}
                draggable={DRAGGABLE_JOB_STATUS.includes(job.status)}
                handleDrag={handleDragJob}
              />
            )}
            {matchedSuggestion && (
              <SuggestionCard
                suggestion={matchedSuggestion}
                cardPosition={parseDurationFromTimeRange(item.numberValue, matchedSuggestion.startTime) * widthPerMin}
                slotUnit={SLOT_WIDTH_UNIT}
                travelTime={matchedSuggestion.travelTime}
                travelTimeStyle={{
                  height: '2px',
                  width: `${(matchedSuggestion.travelTime / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  marginLeft: `-${(matchedSuggestion.travelTime / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`
                }}
                durationStyle={{
                  width: `${(matchedSuggestion.duration / minutesPerBlock) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  backgroundColor: '#e6f4ff',
                  border: '1px dashed #008cff'
                }}
                handleClick={handleAllocation}
              />
            )}
          </Timeslot>
        )
      })
    }
  }, dateRange.length)

  return dateCols
}

interface IScheduleTimeslotsProps {
  selectedDate: Date,
  rangeType: RangeType,
  swimlaneSettings: ISwimlaneSettings,
  openAllocationModal?: (job: IJobDetail, zonedDate: string, zonedTime: number) => void,
  job?: IJobDetail,
  navigateToJob?: (startDate: Date) => void,
  suggestions?: IJobSuggestion[]
  dragJob?: (job: IJobDetail, newDate: string, newTime: number) => void
}

const ScheduleTimeslots: React.FC<IScheduleTimeslotsProps> = ({
  selectedDate,
  rangeType,
  swimlaneSettings,
  openAllocationModal,
  job,
  navigateToJob,
  suggestions,
  dragJob
}) => {
  const { workingHours } = swimlaneSettings
  // total minutes in 1 days
  const totalMinutes = workingHours.enabled ?
    parseDurationFromTimeRange(workingHours.startTime, workingHours.endTime) :
    1440
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 360 : 1440
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled

  // width of 1 cell
  let slotWidth = isWeekdayWorkingHour ? DEFAULT_SLOT_WIDTH * 4 : DEFAULT_SLOT_WIDTH

  // number of time columns
  let timeCols = useMemo(() => getTimePickerOptions(timeGap), [timeGap])

  let dateRange = useMemo(() => eachDayOfInterval({
    start: selectedDate,
    end: add(selectedDate, {
      days: (rangeType === 'day' ? 1 : rangeType === 'week' ? 7 : getDaysInMonth(selectedDate)) - 1
    })
  }), [selectedDate, rangeType])

  if (workingHours.enabled) {
    if (rangeType === 'day') {
      timeCols = timeCols.filter(time => {
        return time.numberValue >= workingHours.startTime && time.numberValue < workingHours.endTime
      })
      // 32 is schedule table padding
      slotWidth = (window.innerWidth - 32) * 0.7 / timeCols.length
    } else {
      // if rangeType is day and enable workingHours --> not ignore that date, just disable
      dateRange = dateRange.filter(date => {
        const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))
        return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
      })
      timeCols = [{
        numberValue: workingHours.startTime,
        stringValue: parseTimeValue(workingHours.startTime),
        boundValue: addTimeValue(workingHours.startTime, totalMinutes)
      }]
      slotWidth = (window.innerWidth - 32) * 0.7 / dateRange.length
    }
  }
  const cols = timeCols.length * dateRange.length
  const shouldNavigateLeft = job?.startDate && format(dateRange[0], DATE_FORMAT) > job.startDate
  const shouldNavigateRight = job?.startDate && format(dateRange[dateRange.length - 1], DATE_FORMAT) < job.startDate

  const handNavigateToJob = useCallback(() => {
    if (navigateToJob && job?.startDate) {
      navigateToJob(new Date(job?.startDate))
    }
  }, [job?.startDate])

  const handleDragJob = useCallback(async (newDate: string, newTime: number) => {
    if (typeof dragJob === 'function' && job) {
      dragJob(job, newDate, newTime)
    }
  }, [job])

  const handleAllocation = useCallback((zonedDate: string, zonedTime: number) => {
    if (typeof openAllocationModal === 'function' && job) {
      openAllocationModal(job, zonedDate, zonedTime)
    }
  }, [job])

  let cells: React.ReactElement[] = []

  let currentTimePosition = null

  if (!job) {
    const { dateCols, currentTimeIndicatorPosition } = generateScheduleHeaderCell(
      rangeType,
      dateRange,
      totalMinutes,
      slotWidth,
      timeCols,
      workingHours
    )
    cells = dateCols
    currentTimePosition = currentTimeIndicatorPosition
  }

  if (job) {
    cells = generateScheduleDataCell(
      rangeType,
      dateRange,
      totalMinutes,
      slotWidth,
      timeGap,
      timeCols,
      swimlaneSettings,
      job,
      suggestions,
      handleDragJob,
      handleAllocation
    )
  }

  return (
    <>
      <div
        className="cx-grid cx-h-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${slotWidth}${SLOT_WIDTH_UNIT})`,
          position: 'relative'
        }}
      >
        {shouldNavigateLeft && (
          <Tooltip
            content={`${job?.startDate} ${job?.startTimeString}`}
            position="top"
            className="navigate-btn-tooltip"
          >
            <Icon
              name="chevronLeft"
              className="cx-text-neutral-700 cx-z-1 navigate-btn"
              onClick={handNavigateToJob}
            />
          </Tooltip>
        )}
        {shouldNavigateRight && (
          <Tooltip
            content={`${job?.startDate} ${job?.startTimeString}`}
            position="top" className="navigate-btn-tooltip">
            <Icon
              name="chevronRight"
              className="cx-text-neutral-700 cx-z-1 navigate-btn"
              onClick={handNavigateToJob}
            />
          </Tooltip>
        )}
        {cells}
      </div>
      {currentTimePosition !== null && (
        <div
          className="cx-absolute cx-h-full current-time-indicator cx-z-1"
          style={{
            left: `calc(30% + ${currentTimePosition}px)`,
          }}
        />
      )}
    </>
  )
}

export default memo(ScheduleTimeslots)
