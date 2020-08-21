import React, { memo, useMemo } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'

import { classes } from '../../common/utils/classes'
import UnavailabilityDetail from './UnavailabilityDetail'

import './UnavailabilityDetails.scss'
import { useSelector } from 'react-redux'
import { State, Resource } from '../../Store/types'
import { LONG_DATE_FORMAT } from '../../common/constants'
import { extractRemainingALDaysWithHours } from '../../common/utils/dateTimeHelpers'

const bem = classes('unavailability-details')

const formatDate = (date: string, timezone: string)  => format(utcToZonedTime(date, timezone), LONG_DATE_FORMAT)

interface UnavailabilityDetailsProps {
  data: {
    Start: string,
    Finish: string,
    CreatedDate: string,
    Status: string,
    Resource: Resource
  }
}

const UnavailabilityDetails: React.FC<UnavailabilityDetailsProps> = ({ data: {
  Start,
  Finish,
  CreatedDate,
  Status,
  Resource
} }) => {
  const { region, resources } = useSelector((state: State) => ({ region: state.region, resources: state.resources || [] }))
  const leaveResource = useMemo(() => resources.find(item => item.id === Resource.UID), [resources])
  const durationNumber = differenceInCalendarDays(new Date(Finish), new Date(Start))
  const submittedNumber = differenceInCalendarDays(Date.now(), new Date(CreatedDate))
  const Duration = `${durationNumber} ${durationNumber === 1 ? 'day' : 'days'}`
  const SubmittedDiff = submittedNumber === 0 ? 'today' : `${submittedNumber} ${submittedNumber === 1 ? 'day' : 'days'} ago`

  const LeaveRemaining = useMemo(() => {
    if (!leaveResource) {
      return '-- --'
    }
    const leaveAllowance = leaveResource.annualLeaveAllowance || 0
    const remainingDaysWithHours = extractRemainingALDaysWithHours(leaveResource.annualLeaveRemaining, leaveResource.dailyHours)
    return `${remainingDaysWithHours} of ${leaveAllowance} day${leaveAllowance > 1 ? 's' : ''} remaining`
  }, [resources, leaveResource])

  return (
    <div className={ bem() }>
      <UnavailabilityDetail
        iconName="actions"
        title="requested"
        value={Duration}
      />
      <UnavailabilityDetail
        iconName="infoFill"
        title="status"
        value={Status}
      />
      <UnavailabilityDetail
        iconName="recurring"
        title="leave allowance"
        value={LeaveRemaining}
      />
      <UnavailabilityDetail
        iconName="calendar"
        title="leave start"
        value={formatDate(Start, region.timezoneSid)}
      />
      <UnavailabilityDetail
        iconName="calendar"
        title="leave end"
        value={formatDate(Finish, region.timezoneSid)}
      />
      <UnavailabilityDetail
        iconName="tasks"
        title="submitted"
        value={SubmittedDiff}
      />
    </div>
  )
}

export default memo(UnavailabilityDetails)
