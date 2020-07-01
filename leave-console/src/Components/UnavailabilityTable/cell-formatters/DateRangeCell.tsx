import * as React from 'react'
import { format, parseISO } from 'date-fns'

export const DateRangeCell = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
  const startDateLabel = startDate ? format(parseISO(startDate), 'd MMM K:mm aaa') : '-- --'
  const endDateLabel = endDate ? format(parseISO(endDate), 'd MMM K:mm aaa, yyyy') : '-- -- ----'
  return (
    <span>
      { `${ startDateLabel } - ${ endDateLabel}` }
    </span>
  )
}
