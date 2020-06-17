import React from 'react'
import { times, toNumber, pickBy } from 'lodash/fp'
import classnames from 'classnames'
import { format } from 'date-fns-tz'
import { getDaysInMonth, eachDayOfInterval, add, isToday } from 'date-fns'
import { RangeType, Avatar } from '@skedulo/sked-ui'
import { IJobDetail, ITimeOption, ISwimlaneSettings, IWorkingHours } from '../../commons/types'
import {
  SCHEDULE_JOB_STATUS_COLOR,
  DATE_FORMAT,
} from '../../commons/constants'
import {
  getTimePickerOptions,
  parseDurationValue,
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
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled
  const isDayWorkingHour = rangeType === 'day' && workingHours.enabled
  const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))

  const dateCols: React.ReactElement[] = []

  if (job || rangeType !== 'month') {
    times(dateRangeIndex => {
      if (rangeType === 'week' && workingHours.enabled || rangeType === 'month' && workingHours.enabled) {
        // display schedule data
        const formattedDateString = format(dateRange[dateRangeIndex], DATE_FORMAT)
        const matched = formattedDateString === job.startDate
          && job.startTime >= workingHours.startTime
          && job.endTime <= workingHours.endTime
        const resources: React.ReactNode[] = []

        if (matched) {
          const time = Math.max(job.allocations?.length || 0, toNumber(job.resourceRequirement))
          times(index => {
            const jobAllocation = job.allocations ? job.allocations[index] : null

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
        }

        dateCols.push(
          <div className="timeslot" key={`${workingHours.startTime}-${dateRangeIndex}`}>
            {matched && (
              <div className="cx-flex cx-items-center cx-absolute" style={{
                height: '80%',
                zIndex: 1,
                left: `${(parseDurationFromTimeValueRange(workingHours.startTime, job.startTime) / totalMinutes) * slotWidth}${SLOT_WIDTH_UNIT}`,
              }}>
                <span className="cx-h-full" style={{
                  width: `${(job.duration / totalMinutes) * slotWidth}px`,
                  backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                }} />
                <span className="cx-flex">
                  {resources}
                </span>
                <span className="cx-pl-2" style={{ width: 'max-content' }}>
                  {parseDurationValue(job.duration)}
                </span>
              </div>
            ) }
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
          const formattedDateString = format(dateRange[dateRangeIndex], DATE_FORMAT)
          let matched = formattedDateString === job.startDate && job.startTime >= item.numberValue
          const resources: React.ReactNode[] = []
          if (timeCols[indexTime + 1]) {
            matched = matched && job.startTime < timeCols[indexTime + 1].numberValue
          }
          if (workingHours.enabled) {
            matched = matched && job.startTime >= workingHours.startTime && job.endTime <= workingHours.endTime
          }
          if (matched) {
            const time = Math.max(job.allocations?.length || 0, toNumber(job.resourceRequirement))
            times(index => {
              const jobAllocation = job.allocations ? job.allocations[index] : null

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
          }

          dateCols.push(
            <div className="timeslot" key={`${item.stringValue}-${dateRangeIndex}`}>
              {matched && (
                <div className="cx-flex cx-items-center cx-absolute" style={{
                  height: '80%',
                  zIndex: 1,
                  left: `${(parseDurationFromTimeValueRange(item.numberValue, job.startTime) / timeGap) * slotWidth}${SLOT_WIDTH_UNIT}`,
                }}>
                  <span className="cx-h-full" style={{
                    width: `${(job.duration / timeGap) * slotWidth}${SLOT_WIDTH_UNIT}`,
                    backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                  }} />
                  <span className="cx-flex">
                    {resources}
                  </span>
                  <span className="cx-pl-2" style={{ width: 'max-content' }}>
                    {parseDurationValue(job.duration)}
                  </span>
                </div>
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
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 240 : 1440
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled
  const isDayWorkingHour = rangeType === 'day' && workingHours.enabled
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

  if (workingHours?.enabled && rangeType !== 'day') {
    // if rangeType is day and enable workingHours --> not ignore that date, just disable
    dateRange = dateRange.filter(date => {
      const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))
      return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
    })
  }

  if (isDayWorkingHour) {
    // if rangeType === day and enable workingHours --> filter timeCols base on working hours
    // if rangeType !== day and enable workingHours --> only display custom columns, no need to filter
    timeCols = timeCols.filter(time => {
      return time.numberValue >= workingHours.startTime && time.numberValue < workingHours.endTime
    })
    slotWidth = window.innerWidth * 0.7 / timeCols.length
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
            className="cx-absolute cx-h-full current-time-indicator"
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
