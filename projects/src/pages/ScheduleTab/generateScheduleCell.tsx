import React from 'react'
import { times, toNumber, pickBy } from 'lodash/fp'
import classnames from 'classnames'
import { format } from 'date-fns-tz'
import { getDaysInMonth, eachDayOfInterval, add, isToday } from 'date-fns'
import { RangeType, Avatar, GroupAvatars, Tooltip } from '@skedulo/sked-ui'
import { IJobDetail, ITimeOption, ISwimlaneSettings, IWorkingHours } from '../../commons/types'
import ScheduledJob from './ScheduledJob'
import {
  SCHEDULE_JOB_STATUS_COLOR,
  DATE_FORMAT,
} from '../../commons/constants'
import {
  getTimePickerOptions,
  parseTimeValue,
  parseDurationFromTimeValueRange
} from '../../commons/utils'

const DEFAULT_SLOT_WIDTH = 50
const SLOT_WIDTH_UNIT = 'px'

const generateScheduleDataCell = (
  rangeType: RangeType,
  dateRange: Date[],
  totalMinutes: number,
  slotWidth: number,
  timeGap: number,
  timeCols: ITimeOption[],
  workingHours: IWorkingHours,
  job: IJobDetail,
) => {
  const isDayWorkingHour = rangeType === 'day' && workingHours.enabled
  const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))

  const dateCols: React.ReactElement[] = []

  if (job || rangeType !== 'month') {
    const resourceTravelTime = job.allocations ? job.allocations.filter(item => !!item.plannedTravelTime) : []
    const maxTravelTime = resourceTravelTime.length ?
      Math.max(...resourceTravelTime.map(item => item.plannedTravelTime)) :
      0

    times(dateRangeIndex => {
      const formattedDateString = format(dateRange[dateRangeIndex], DATE_FORMAT)
      if (['week', 'month'].includes(rangeType) && workingHours.enabled) {
        // display schedule data
        const matched = formattedDateString === job.startDate
          && job.startTime >= workingHours.startTime
          && job.endTime <= workingHours.endTime

        dateCols.push(
          <div className="timeslot" key={`${workingHours.startTime}-${dateRangeIndex}`}>
            {matched && (
              <ScheduledJob
                job={job}
                jobPosition={
                  parseDurationFromTimeValueRange(workingHours.startTime, job.startTime) / totalMinutes * slotWidth
                  + SLOT_WIDTH_UNIT
                }
                travelTime={maxTravelTime}
                travelTimeStyle={{
                  height: '2px',
                  width: `${(maxTravelTime / totalMinutes) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  marginLeft: `-${(maxTravelTime / totalMinutes) * slotWidth}${SLOT_WIDTH_UNIT}`
                }}
                durationStyle={{
                  width: `${(job.duration / totalMinutes) * slotWidth}${SLOT_WIDTH_UNIT}`,
                  backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                }}
              />
            )}
          </div>
        )
      } else if (isDayWorkingHour && excludeDays.includes(format(dateRange[dateRangeIndex], 'EEEE').toLowerCase())) {
        // display disabled cell data
        timeCols.forEach((item: ITimeOption, indexTime) => {
          dateCols.push(
            <div className="timeslot cx-bg-neutral-350" key={`${item.stringValue}-${dateRangeIndex}`} />
          )
        })
      } else {
        // display normal cell data
        timeCols.forEach((item: ITimeOption, indexTime) => {
          // display schedule data
          let matched = formattedDateString === job.startDate && job.startTime >= item.numberValue
          if (timeCols[indexTime + 1]) {
            matched = matched && job.startTime < timeCols[indexTime + 1].numberValue
          }
          if (workingHours.enabled) {
            matched = matched && job.startTime >= workingHours.startTime && job.endTime <= workingHours.endTime
          }

          dateCols.push(
            <div className="timeslot" key={`${item.stringValue}-${dateRangeIndex}`}>
              {matched && (
                <ScheduledJob
                  job={job}
                  jobPosition={
                    parseDurationFromTimeValueRange(item.numberValue, job.startTime) / timeGap * slotWidth
                    + SLOT_WIDTH_UNIT
                  }
                  travelTime={maxTravelTime}
                  travelTimeStyle={{
                    height: '2px',
                    width: `${(maxTravelTime / timeGap) * slotWidth}${SLOT_WIDTH_UNIT}`,
                    marginLeft: `-${(maxTravelTime / timeGap) * slotWidth}${SLOT_WIDTH_UNIT}`
                  }}
                  durationStyle={{
                    width: `${(job.duration / timeGap) * slotWidth}${SLOT_WIDTH_UNIT}`,
                    backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                  }}
                />
              ) }
            </div>
          )
        })
      }
    }, dateRange.length)
  }

  return dateCols
}

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
        const ignoredTime = workingHours.enabled ? parseDurationFromTimeValueRange(0, workingHours.startTime) : 0

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

const generateScheduleCell = (
  selectedDate: Date,
  rangeType: RangeType,
  swimlaneSettings: ISwimlaneSettings,
  job?: IJobDetail
) => {
  const workingHours = swimlaneSettings.workingHours
  // total minutes in 1 days
  const totalMinutes = workingHours.enabled ?
    parseDurationFromTimeValueRange(workingHours.startTime, workingHours.endTime) :
    1440
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 360 : 1440
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled

  // width of 1 cell
  let slotWidth = isWeekdayWorkingHour ? DEFAULT_SLOT_WIDTH * 4 : DEFAULT_SLOT_WIDTH

  // number of time columns
  let timeCols = isWeekdayWorkingHour ?
    [{ stringValue: parseTimeValue(workingHours.startTime), numberValue: workingHours.startTime }] :
    getTimePickerOptions(timeGap)

  let dateRange = eachDayOfInterval({
    start: selectedDate,
    end: add(selectedDate, {
      days: (rangeType === 'day' ? 1 : rangeType === 'week' ? 7 : getDaysInMonth(selectedDate)) - 1
    })
  })

  if (workingHours.enabled) {
    if (rangeType === 'day') {
      timeCols = timeCols.filter(time => {
        return time.numberValue >= workingHours.startTime && time.numberValue < workingHours.endTime
      })
      slotWidth = (window.innerWidth - 48) * 0.7 / timeCols.length
    } else {
      // if rangeType is day and enable workingHours --> not ignore that date, just disable
      dateRange = dateRange.filter(date => {
        const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))
        return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
      })
      slotWidth = (window.innerWidth - 48 - 32) * 0.7 / dateRange.length
    }
  }

  const cols = timeCols.length * dateRange.length

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
  } else {
    cells = generateScheduleDataCell(
      rangeType,
      dateRange,
      totalMinutes,
      slotWidth,
      timeGap,
      timeCols,
      workingHours,
      job
    )
  }

  return (
    <>
      <div className="cx-grid cx-h-full" style={{
        gridTemplateColumns: `repeat(${cols}, ${slotWidth}${SLOT_WIDTH_UNIT})`,
      }}>
        {cells}
        {currentTimePosition !== null && (
          <div
            className="cx-absolute cx-h-full current-time-indicator cx-z-1"
            style={{
              left: `calc(30% + ${currentTimePosition}px)`,
            }}
          />
        )}
      </div>
    </>
  )
}

export default generateScheduleCell
