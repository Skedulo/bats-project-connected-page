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

const generateScheduleDataCell = (
  rangeType: RangeType,
  dateRange: Date[],
  totalMinutes: number,
  slotWidth: number,
  timeCols: ITimeOption[],
  workingHours: IWorkingHours,
  job: IJobDetail
) => {
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 240 : 1440
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled

  if (workingHours?.enabled && rangeType !== 'day') {
    // if rangeType is day and enable workingHours --> not ignore that date, just disable
    dateRange = dateRange.filter(date => {
      const excludeDays = Object.keys(pickBy(value => !value, workingHours.days))
      return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
    })
  }

  const dateCols: React.ReactElement[] = []

  if (job || rangeType !== 'month') {
    times(dateRangeIndex => {
      if (isWeekdayWorkingHour) {
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
                left: `${(parseDurationFromTimeValueRange(workingHours.startTime, job.startTime) / totalMinutes) * slotWidth}px`,
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
      } else {
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
                  left: `${((job.startTime - item.numberValue) / timeGap) * 50}px`,
                }}>
                  <span className="cx-h-full" style={{
                    width: `${(job.duration / timeGap) * DEFAULT_SLOT_WIDTH}px`,
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
        currentTimeValue <= workingHours.startTime)
      ) {
        currentTimeIndicatorPosition = (currentTimeInMinute / totalMinutes) * slotWidth * timeCols.length
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
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 240 : 1440
  const isWeekdayWorkingHour = rangeType === 'week' && workingHours.enabled
  const slotWidth = isWeekdayWorkingHour ? DEFAULT_SLOT_WIDTH * 4 : DEFAULT_SLOT_WIDTH
  // total minutes in 1 days
  const totalMinutes = isWeekdayWorkingHour ?
    parseDurationFromTimeValueRange(workingHours.startTime, workingHours.endTime) :
    1440
  const timeCols = isWeekdayWorkingHour ?
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
      timeCols,
      workingHours,
      job
    )
  }
  return (
    <>
      <div className="cx-grid cx-h-full" style={{
        gridTemplateColumns: `repeat(${cols}, ${slotWidth}px)`,
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
