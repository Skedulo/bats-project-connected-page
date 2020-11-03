import React, { memo, useState, useEffect, useMemo } from 'react'
import classnames from 'classnames'
import { Lozenge } from '@skedulo/sked-ui'
import { format } from 'date-fns-tz'
import { isToday, isWithinInterval, isBefore, isAfter, isSameDay, endOfDay, startOfDay } from 'date-fns'

import { TeamAllocation, SelectedSlot, Period, TeamSuggestion, TeamSuggestionPeriod, Unavailability } from '../../types'
import { DATE_FORMAT } from '../../constants'

import AllocationCard from '../AllocationCard'
import SuggestionCard from '../SuggestionCard'

const DEFAULT_SLOT_WIDTH = 100
const SLOT_WIDTH_UNIT = 'px'

interface HeaderCellsProps {
  dateRange: Date[]
  highlightDays?: Period
}

const HeaderCells: React.FC<HeaderCellsProps> = ({ dateRange, highlightDays }) => {
  return (
    <>
      {dateRange.map((date, index) => {
        const formattedWeekday = format(date, 'EEE dd')
        const today = isToday(date)
        const isHighlight = highlightDays ? isWithinInterval(date, { start: highlightDays.startDate, end: highlightDays.endDate }) : false

        return (
          <div
            key={formattedWeekday}
            className={classnames('cx-flex cx-items-center cx-justify-center cx-border-r cx-border-b cx-w-full cx-uppercase',
              {
                'cx-text-primary': !!today,
                'cx-bg-blue-100': isHighlight
              })
            }
            style={{
              gridColumnStart: index + 1,
              gridColumnEnd: index + 2,
              justifySelf: 'center'
            }}
          >
            {formattedWeekday}
          </div>
        )
      })}
    </>
  )
}

const MemoizedHeaderCells = memo(HeaderCells)

interface TimeslotCellsProps {
  dateRange: Date[]
  slotWidth: number
  isFirstRow: boolean
  teamAllocations: TeamAllocation[]
  highlightDays?: Period
  onSelectSlot?: (selectedSlot: SelectedSlot) => void
  suggestions: TeamSuggestionPeriod[]
  timezoneSid?: string
  unavailabilities: Unavailability[]
}

const TimeslotCells: React.FC<TimeslotCellsProps> = ({
  dateRange,
  slotWidth,
  isFirstRow,
  teamAllocations,
  highlightDays,
  onSelectSlot,
  suggestions,
  timezoneSid,
  unavailabilities
}) => {
  return (
    <>
      {dateRange.map((date, index) => {
        const formattedDateString = format(date, DATE_FORMAT)
        const matchingAllocations = teamAllocations.filter(item => item.startDate === formattedDateString)
        const matchingSuggestion = suggestions.find(item => isSameDay(item.startDate, date))
        const onAllocation = () => !matchingAllocations.length && !matchingSuggestion && onSelectSlot ? onSelectSlot({ startDate: date, endDate: date }) : undefined
        const isHighlight = highlightDays ? isWithinInterval(date, { start: highlightDays.startDate, end: highlightDays.endDate }) : false
        const unavailability = unavailabilities ? unavailabilities.find(item => isWithinInterval(date, { start: startOfDay(new Date(item.startDate)), end: endOfDay(new Date(item.endDate)) })) : undefined

        return (
          <div
            className={classnames('cx-border-b cx-border-r cx-relative', {
              'cx-cursor-pointer': !!onSelectSlot,
              'cx-bg-blue-100': isHighlight && !unavailability,
              'cx-bg-neutral-500': !!unavailability,
              'cx-bg-white': !isHighlight && !unavailability,
              'cx-border-t': isFirstRow
            })}
            onClick={onAllocation}
            key={`${formattedDateString}-${index}`}
          >
            {unavailability && <Lozenge className="cx-m-2" color="neutral-light" label={unavailability.name} />}
            {matchingAllocations.map(matchingAllocation => (
              <AllocationCard
                teamAllocation={matchingAllocation}
                key={`${slotWidth}-${matchingAllocation.startDate}-${matchingAllocation.endDate}-${matchingAllocation.resource?.id || ''}`}
                slotUnit={SLOT_WIDTH_UNIT}
                slotWidth={slotWidth - 0.5} // cheating for resize two serried slots
                draggable={true}
                onSelectSlot={onSelectSlot}
                timezoneSid={timezoneSid}
              />
            ))}
            {!matchingAllocations.length && matchingSuggestion && (
              <SuggestionCard
                suggestion={matchingSuggestion}
                cardPosition={slotWidth * index}
                slotUnit={SLOT_WIDTH_UNIT}
                slotWidth={slotWidth}
                handleClick={onSelectSlot}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

const MemoizedTimeslotCells = memo(TimeslotCells)

interface RowTimeslotsProps {
  dateRange: Date[]
  teamAllocations?: TeamAllocation[]
  suggestion?: TeamSuggestion
  onSelectSlot?: (selectedSlot: SelectedSlot) => void
  highlightDays?: Period
  isFirstRow?: boolean
  timezoneSid?: string
  unavailabilities: Unavailability[]
}

const RowTimeslots: React.FC<RowTimeslotsProps> = ({
  dateRange,
  teamAllocations,
  onSelectSlot,
  highlightDays,
  isFirstRow,
  suggestion,
  timezoneSid,
  unavailabilities
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const validSuggestion = useMemo(() => {
    if (suggestion?.availabilities) {
      return suggestion.availabilities.filter(item => !isBefore(endOfDay(item.startDate), new Date())).map(item => {
        const formattedPeriod = { ...item }
        if (isBefore(item.startDate, dateRange[0])) {
          formattedPeriod.startDate = dateRange[0]
        }
        if (isAfter(item.endDate, dateRange[dateRange.length - 1])) {
          formattedPeriod.endDate = dateRange[dateRange.length - 1]
        }
        return formattedPeriod
      })
    }
    return []
  }, [suggestion, dateRange])

  // total columns
  const cols = dateRange.length
  // width of 1 cell
  const slotWidth = Math.max(((windowWidth - 210 - 32) * 0.8 / cols), DEFAULT_SLOT_WIDTH)

  useEffect(() => {
    const onWindowResized = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', onWindowResized)
    return () => {
      window.removeEventListener('resize', onWindowResized)
    }
  }, [])

  return (
    <div
      className="cx-grid cx-h-full cx-relative"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${slotWidth}${SLOT_WIDTH_UNIT})`
      }}
    >
      {/* {timeSlots} */}
      {!teamAllocations && <MemoizedHeaderCells dateRange={dateRange} highlightDays={highlightDays} />}
      {teamAllocations && (
        <MemoizedTimeslotCells
          dateRange={dateRange}
          highlightDays={highlightDays}
          slotWidth={slotWidth}
          isFirstRow={!!isFirstRow}
          teamAllocations={teamAllocations}
          onSelectSlot={onSelectSlot}
          suggestions={validSuggestion}
          timezoneSid={timezoneSid}
          unavailabilities={unavailabilities}
        />
      )}
    </div>
  )
}

export default memo(RowTimeslots)
