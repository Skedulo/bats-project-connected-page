import React, { memo } from 'react'
import classnames from 'classnames'
import { IJobDetail, IJobSuggestion } from '../../commons/types'

interface SuggestionCardProps {
  suggestion: IJobSuggestion
  cardPosition: number
  travelTimeStyle: Record<string, string>
  durationStyle: Record<string, string>
  travelTime: number
  handleClick?: (zonedDate: string, zonedTime: number) => void
  slotUnit: string
}

const SuggestionCard: React.FC<SuggestionCardProps> = props => {
  const {
    suggestion,
    cardPosition,
    travelTime,
    travelTimeStyle,
    durationStyle,
    handleClick,
    slotUnit,
  } = props

  const onCardClick = () => {
    if (typeof handleClick === 'function') {
      handleClick(suggestion.startDate, suggestion.startTime)
    }
  }

  return (
    <div
      onClick={onCardClick}
      className={classnames('cx-flex cx-items-center cx-absolute cx-z-1', {
        'cx-cursor-pointer': handleClick
      })}
      style={{
        height: '80%',
        left: cardPosition + slotUnit,
      }}
      >
      {travelTime > 0 && (
        <span className="cx-bg-neutral-500" style={travelTimeStyle} />
      )}
      <span
        className="cx-h-full cx-flex cx-items-center cx-justify-center cx-text-primary"
        style={durationStyle}
      >
        +
      </span>
    </div>
  )
}

export default memo(SuggestionCard)
