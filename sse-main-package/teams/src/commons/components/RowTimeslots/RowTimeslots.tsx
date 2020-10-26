import React, { memo, useState, useEffect, useMemo } from 'react'
import classnames from 'classnames'
import { format } from 'date-fns-tz'
import { isToday, isWithinInterval, isBefore, isAfter, isSameDay } from 'date-fns'

import { TeamAllocation, SelectedSlot, HighlightDays, TeamSuggestion, TeamSuggestionPeriod } from '../../types'
import { DATE_FORMAT } from '../../constants'

import AllocationCard from '../AllocationCard'
import SuggestionCard from '../SuggestionCard'

const DEFAULT_SLOT_WIDTH = 100
const SLOT_WIDTH_UNIT = 'px'

interface HeaderCellsProps {
  dateRange: Date[]
  highlightDays?: HighlightDays
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
  highlightDays?: HighlightDays
  onSelectSlot?: (selectedSlot: SelectedSlot) => void
  suggestions: TeamSuggestionPeriod[]
}

const TimeslotCells: React.FC<TimeslotCellsProps> = ({
  dateRange,
  slotWidth,
  isFirstRow,
  teamAllocations,
  highlightDays,
  onSelectSlot,
  suggestions
}) => {
  return (
    <>
      {dateRange.map((date, index) => {
        const formattedDateString = format(date, DATE_FORMAT)
        const matchedAllocation = teamAllocations.find(item => item.startDate === formattedDateString)
        const matchedSuggestion = suggestions.find(item => isSameDay(item.startDate, date))
        const onAllocation = () => !matchedAllocation && !matchedSuggestion && onSelectSlot ? onSelectSlot({ startDate: date, endDate: date }) : undefined
        const isHighlight = highlightDays ? isWithinInterval(date, { start: highlightDays.startDate, end: highlightDays.endDate }) : false

        return (
          <div
            className={classnames('cx-border-b cx-border-r', {
              'cx-cursor-pointer': !!onSelectSlot,
              'cx-bg-blue-100': isHighlight,
              'cx-bg-white': !isHighlight,
              'cx-border-t': isFirstRow
            })}
            onClick={onAllocation}
            key={`${formattedDateString}-${index}`}
          >
            {matchedAllocation && (
              <AllocationCard
                teamAllocation={matchedAllocation}
                key={`${matchedAllocation.startDate}-${matchedAllocation.resource?.id || ''}`}
                dateRange={dateRange}
                slotUnit={SLOT_WIDTH_UNIT}
                slotWidth={slotWidth}
                isConflict={false}
                draggable={true}
                cardPosition={slotWidth * index}
              />
            )}
            {!matchedAllocation && matchedSuggestion && (
              <SuggestionCard
                suggestion={matchedSuggestion}
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
  highlightDays?: HighlightDays
  isFirstRow?: boolean
}

const RowTimeslots: React.FC<RowTimeslotsProps> = ({
  dateRange,
  teamAllocations,
  onSelectSlot,
  highlightDays,
  isFirstRow,
  suggestion
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const validSuggestion = useMemo(() => {
    if (suggestion?.periods) {
      return suggestion.periods.map(item => {
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
      className="cx-grid cx-h-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${slotWidth}${SLOT_WIDTH_UNIT})`,
        position: 'relative'
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
        />
      )}
    </div>
  )
}

export default memo(RowTimeslots)