import React, { memo, useMemo, useState, useCallback } from 'react'
import { Rnd } from 'react-rnd'
import classnames from 'classnames'
import { differenceInCalendarDays, add, format, isSameDay, isAfter, isBefore } from 'date-fns'
import { Avatar, StatusIcon, Tooltip } from '@skedulo/sked-ui'
import { useSelector, useDispatch } from 'react-redux'

import { TeamAllocation } from '../../types/Team'
import { allocateTeamMember } from '../../../Services/DataServices'
import { LEAVE_DATE_FORMAT, DATE_FORMAT } from '../../constants'
import { useGlobalLoading } from '../GlobalLoading'
import { toastMessage } from '../../utils'
import { SelectedSlot, State, Period } from '../../types'
import { updateReloadTeamsFlag } from '../../../Store/action'

interface TeamAllocationCardProps {
  teamAllocation: TeamAllocation
  onSelectSlot?: (selectedSlot: SelectedSlot) => void
  draggable?: boolean
  slotUnit: string
  slotWidth: number
  timezoneSid?: string
}

const CrownIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        d="M14.1284816,6.96147184 C14.3823279,6.50449353 14.2356012,5.90794248 13.7876195,5.64930438 C13.3294359,5.38087171 12.7542311,5.5403397 12.5003848,5.99731801 C12.2666422,6.40471126 12.36446,6.93239419 12.7056222,7.22041602 C12.0062718,7.5728408 11.1150391,7.95742805 10.0319239,8.37417777 L8.10458328,4.41943134 C8.60177394,4.38943544 8.98224331,3.97224761 8.98224331,3.46507208 C8.98224331,2.93769523 8.56306688,2.5 8.02656906,2.5 L7.9779602,2.5 C7.45196429,2.5 7.02288606,2.93769523 7.02288606,3.464766 C7.02288606,3.97194153 7.40275532,4.38943544 7.89994597,4.41912526 L6.05147572,8.37417777 C4.88891765,7.95742805 3.9682942,7.57273878 3.28960537,7.22010994 C3.65027113,6.93208811 3.74808896,6.40440518 3.51344618,5.99701193 C3.2502982,5.54003361 2.67539338,5.38087171 2.21720984,5.64930438 C1.77852985,5.9076364 1.61289965,6.50449353 1.87604763,6.96147184 C2.12959386,7.39916708 2.66579163,7.56842964 3.12367511,7.33948136 L4.00073503,12.5 L12.013396,12.5 L12.8907559,7.33948136 C13.3393377,7.56842964 13.8752354,7.398861 14.1284816,6.96147184 Z"
        strokeLinejoin="round"
        fill="#FFFFFF"
        fillRule="evenodd"
        strokeLinecap="round"
      />
    </svg>
  )
}

const TeamAllocationCard: React.FC<TeamAllocationCardProps> = props => {
  const {
    teamAllocation,
    onSelectSlot,
    slotUnit,
    slotWidth,
    draggable,
    timezoneSid
  } = props
  const dispatch = useDispatch()
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const selectedSlot = useSelector<State, SelectedSlot | null>(state => state.selectedSlot)
  const selectedPeriod = useSelector<State, Period>(state => state.selectedPeriod)
  const { startDate, endDate } = useMemo(() => ({ startDate: new Date(teamAllocation.startDate), endDate: new Date(teamAllocation.endDate) }), [teamAllocation])
  const duration = useMemo(() => differenceInCalendarDays(endDate, startDate) + 1, [startDate, endDate])

  const { isConflict, conflictContent } = useMemo(() => {
    const unavailabilities = teamAllocation.unavailabilities?.map(period => {
      return `Unavailability: ${format(new Date(period.startDate), LEAVE_DATE_FORMAT)} - ${format(new Date(period.endDate), LEAVE_DATE_FORMAT)}`
    }) || []
    const conflicts = teamAllocation.conflicts?.map(period => {
      return `Team: ${period.team.name} ${format(new Date(period.startDate), LEAVE_DATE_FORMAT)} - ${format(new Date(period.endDate), LEAVE_DATE_FORMAT)}`
    }) || []
    return {
      isConflict: teamAllocation.isAvailable === false || !!teamAllocation.isConflict,
      conflictContent: [...unavailabilities, ...conflicts].join('\n') || 'Conflicted'
    }
  }, [teamAllocation])

  const [allocationSize, setAllocationSize] = useState<{ width: string, height: string }>({
    width: `${(duration * slotWidth)}${slotUnit}`,
    height: '100%'
  })

  const updateAllocation = useCallback(async (id: string, resourceId: string, newStartDate: Date, newEndDate: Date) => {
    startGlobalLoading()
    const success = await allocateTeamMember({
      id: id,
      startDate: format(newStartDate, DATE_FORMAT),
      endDate: format(newEndDate, DATE_FORMAT),
      timezoneSid,
      resourceId: resourceId
    })
    endGlobalLoading()
    if (success) {
      dispatch(updateReloadTeamsFlag(true))
    } else {
      toastMessage.error('Unsuccessfully!')
    }
  }, [timezoneSid, teamAllocation])

  const onCardClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    if (typeof onSelectSlot === 'function') {
      onSelectSlot({
        startDate,
        endDate,
        id: teamAllocation.id,
        resource: teamAllocation.resource,
        teamLeader: teamAllocation.teamLeader
      })
    }
  }, [startDate, endDate, teamAllocation])

  const onStopResize = useCallback((e: MouseEvent | TouchEvent, direction: string, ref: HTMLElement, delta: any, position: any) => {
    e.stopPropagation()
    if (direction === 'top' || direction === 'bottom' || !delta.width) {
      return
    }
    let newStartDate = startDate
    let newEndDate = endDate
    const newDuration = Math.round(delta.width / slotWidth)

    if (direction === 'left') {
      newStartDate = add(startDate, { days: -newDuration })
    }
    if (direction === 'right') {
      newEndDate = add(endDate, { days: newDuration })
    }

    if ((isSameDay(newStartDate, startDate) && isSameDay(newEndDate, endDate)) ||
      isAfter(newEndDate, selectedPeriod.endDate) ||
      isBefore(newStartDate, selectedPeriod.startDate) ||
      isBefore(newEndDate, newStartDate)
    ) {
      return
    }

    setAllocationSize({
      width: ref.style.width,
      height: ref.style.height
    })

    if (!selectedSlot && teamAllocation.id) {
      updateAllocation(teamAllocation.id, teamAllocation.resource?.id || '', newStartDate, newEndDate)
    } else {
      console.log('newStartDate: ', newStartDate)
    }
  }, [startDate, endDate, slotWidth])

  return (
    <Rnd
      size={allocationSize}
      onResizeStop={onStopResize}
      resizeGrid={[slotWidth, 0]}
      dragAxis="x"
      minHeight='100%'
      disableDragging={true}
      enableResizing={!selectedSlot && {
        bottom: false,
        bottomLeft: false,
        bottomRight: false,
        left: true,
        right: true,
        top: false,
        topLeft: false,
        topRight: false
      }}
      style={{
        zIndex: teamAllocation.isPlanning ? 2 : 1
      }}
      bounds=".slot-wrapper"
    >
      <div
        className={classnames('cx-flex cx-items-center cx-full cx-p-1 cx-m-2px cx-rounded', {
          'cx-cursor-pointer': draggable || onSelectSlot
        })}
        onClick={onCardClick}
        style={{
          height: 'calc(100% - 4px)',
          backgroundColor: isConflict ? 'white' : teamAllocation.isPlanning ? '#008CFF' : '#4A556A',
          border: `1px solid ${isConflict ? 'red' : 'white'}`,
          color: isConflict ? '#4A556A' : 'white'
        }}
      >
        {!selectedSlot && <Avatar name={teamAllocation.resource?.name || ''} size="tiny" />}
        <div className="cx-ml-2 cx-truncate">
          <div className="cx-text-xs cx-font-semibold cx-truncate">
            {!selectedSlot ? teamAllocation.resource?.name : teamAllocation.name}
          </div>
          {!selectedSlot && <div className="cx-text-xxs cx-mt-2px">{teamAllocation.resource?.category}</div>}
        </div>
        {teamAllocation.teamLeader && <div className="cx-ml-1"><CrownIcon /></div>}
        {isConflict && conflictContent && (
          <Tooltip content={conflictContent} position="top" className="cx-absolute cx-right-1 cx-top-1 cx-z-10">
            <StatusIcon status="error" />
          </Tooltip>
        )}
      </div>
    </Rnd>
  )
}

export default memo(TeamAllocationCard)
