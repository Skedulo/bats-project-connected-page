import React, { memo, useMemo, useCallback } from 'react'
import { differenceInCalendarDays } from 'date-fns'

import { TeamSuggestionPeriod, SelectedSlot } from '../../types'

interface SuggestionCardProps {
  suggestion: TeamSuggestionPeriod
  cardPosition: number
  handleClick?: (selectedSlot: SelectedSlot) => void
  slotUnit: string
  slotWidth: number
}

const SuggestionCard: React.FC<SuggestionCardProps> = props => {
  const {
    suggestion,
    slotUnit,
    slotWidth,
    handleClick
  } = props
  const duration = useMemo(() => differenceInCalendarDays(suggestion.endDate, suggestion.startDate) + 1, [suggestion])

  const onCardClick = useCallback(() => {
    if (typeof handleClick === 'function') {
      handleClick(suggestion)
    }
  }, [suggestion])

  return (
    <div
      onClick={onCardClick}
      className={'cx-flex cx-items-center cx-absolute cx-z-1 cx-cursor-pointer'}
      style={{
        height: '90%',
        top: '2px'
      }}
    >
      <span
        className="cx-h-full cx-flex cx-items-center cx-justify-center cx-text-primary cx-rounded"
        style={{
          width: `${duration * slotWidth}${slotUnit}`,
          backgroundColor: '#e6f4ff',
          border: '1px dashed #008cff'
        }}
      >
        +
      </span>
    </div>
  )
}

export default memo(SuggestionCard)
