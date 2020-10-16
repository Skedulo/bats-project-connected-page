import React, { memo, useCallback, useMemo, useState, useEffect } from 'react'
import { times, toNumber, pickBy } from 'lodash/fp'
import classnames from 'classnames'
import { format, utcToZonedTime } from 'date-fns-tz'
import { getDaysInMonth, eachDayOfInterval, add, isToday, toDate } from 'date-fns'
// import { IJobDetail, ITimeOption, ISwimlaneSettings, IWorkingHours, IJobSuggestion } from '../../commons/types'
import Timeslot from './Timeslot'

import { SwimlaneSetting } from '../../types'
import { Team, TeamRequirement } from '../../types/Team'
import { DATE_FORMAT } from '../../constants'
import AllocationCard from './\bAllocationCard'

const DEFAULT_SLOT_WIDTH = 100
const SLOT_WIDTH_UNIT = 'px'
const DRAGGABLE_JOB_STATUS = ['Pending Allocation', 'Pending Dispatch', 'Dispatched']

const generateHeaderCells = (dateRange: Date[]) => {
  const dateCols: React.ReactElement[] = []

  dateRange.forEach((date, index) => {
    const formattedWeekday = format(date, 'EEE dd')
    const today = isToday(date)

    dateCols.push(
      <div
        key={formattedWeekday}
        className={classnames('day cx-w-full cx-uppercase', {
          'cx-text-primary': !!today
        })}
        style={{
          gridColumnStart: index + 1,
          gridColumnEnd: index + 2,
          justifySelf: 'center',
        }
      }>
        {formattedWeekday}
      </div>
    )
  })

  return dateCols
}

const generateTimeslots = (dateRange: Date[], teamRequirement: TeamRequirement, slotWidth: number) => {
  const dateCols = dateRange.map((date, index) => {
    const formattedDateString = format(date, DATE_FORMAT)
    const matchedAllocation = teamRequirement.allocations.find(item => item.startDate === formattedDateString)

    return (
      <Timeslot
        key={`${date.valueOf()}-${index}`}
        // handleAllocation={isUnscheduled && !suggestions?.length ? handleAllocation : undefined}
        slotDate={formattedDateString}
      >
        {matchedAllocation && (
          <AllocationCard
            teamAllocation={matchedAllocation}
            key={`${matchedAllocation.startDate}-${matchedAllocation.resource.id}`}
            dateRange={dateRange}
            slotUnit={SLOT_WIDTH_UNIT}
            slotWidth={slotWidth}
            isConflict={false}
            draggable={true}
            cardPosition={slotWidth * index}
            // handleDrag={handleDragJob}
            // handleAllocation={handleAllocation}
          />
        )}
        {/* {matchedSuggestion && (
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
        )} */}
      </Timeslot>
    )
  })

  return dateCols
}

interface RowTimeslotsProps {
  dateRange: Date[],
  teamRequirement?: TeamRequirement,
  // openAllocationModal?: (job: IJobDetail, zonedDate?: string, zonedTime?: number) => void,
  // type?: IJobDetail,
  // navigateToJob?: (startDate: Date) => void,
  // suggestions?: IJobSuggestion[]
  // dragJob?: (job: IJobDetail, newDate: string, newTime: number) => void
}

const RowTimeslots: React.FC<RowTimeslotsProps> = ({
  dateRange,
  teamRequirement
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  // total columns
  const cols = dateRange.length
  // width of 1 cell
  const slotWidth = Math.max(((windowWidth - 210 - 32) * 0.8 / cols), DEFAULT_SLOT_WIDTH)

  let timeSlots: React.ReactElement[] = !teamRequirement ? generateHeaderCells(dateRange) : generateTimeslots(dateRange, teamRequirement, slotWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div
        className="cx-grid cx-h-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${slotWidth}${SLOT_WIDTH_UNIT})`,
          position: 'relative'
        }}
      >
        {timeSlots}
      </div>
    </>
  )
}

export default memo(RowTimeslots)
