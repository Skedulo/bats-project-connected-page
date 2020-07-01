import * as React from 'react'
import { format as formatDate } from 'date-fns'

interface DateTimeCellProps {
  date?: string,
  time?: string,
  format?: string
}

export const DateTimeCell: React.FC<DateTimeCellProps> = ({ date, time, format = 'DD MMMM YYYY HH:mm:ss Z' }) => {
  const dateTime = (!date && !time)
    ? null
    : `${date || '0000-00-00'}T${time || '00:00:00.000'}Z`
  return (
    <span>
      { dateTime ? formatDate(new Date(dateTime), format) : '-' }
    </span>
  )
}
