import React from 'react'
import { format, differenceInCalendarDays } from 'date-fns'

import { classes } from '../../common/utils/classes'
import UnavailabilityDetail from './UnavailabilityDetail'

import './UnavailabilityDetails.scss'

const bem = classes('unavailability-details')

const formatDate = (date: string)  => format(new Date(date), 'eee, d LLL Y')

interface UnavailabilityDetailsProps {
  data: {
    Start: string,
    Finish: string,
    CreatedDate: string
  }
}

const UnavailabilityDetails: React.FC<UnavailabilityDetailsProps> = ({ data: {
  Start,
  Finish,
  CreatedDate
} }) => {
  const durationNumber = differenceInCalendarDays(new Date(Finish), new Date(Start))
  const submittedNumber = differenceInCalendarDays(Date.now(), new Date(CreatedDate))

  const Duration = `${ durationNumber } ${ durationNumber === 1 ? 'day' : 'days' }`
  const SubmittedDiff = `${ submittedNumber === 0
    ? 'today'
    : submittedNumber + (submittedNumber === 1 ? ' day ' : ' days ') + 'ago'
  }`

  return (
    <div className={ bem() }>
      <UnavailabilityDetail
        iconName="actions"
        title="requested"
        value={ Duration }
      />
      <UnavailabilityDetail
        iconName="calendar"
        title="leave start"
        value={ formatDate(Start) }
      />
      <UnavailabilityDetail
        iconName="calendar"
        title="leave end"
        value={ formatDate(Finish) }
      />
      <UnavailabilityDetail
        iconName="tasks"
        title="submitted"
        value={ SubmittedDiff }
      />
    </div>
  )
}

export default UnavailabilityDetails
