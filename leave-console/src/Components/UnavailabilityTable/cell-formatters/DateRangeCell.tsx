import * as React from 'react'
import { format, utcToZonedTime } from 'date-fns-tz'
import { parseISO } from 'date-fns'
import { useSelector } from 'react-redux'
import { State } from '../../../Store/types'
import { LONG_DATE_FORMAT, LONG_DATETIME_FORMAT } from '../../../common/constants'

const DateRangeCell = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
  const { region } = useSelector((state: State) => ({ region: state.region }))
  const zonedStartDate = utcToZonedTime(startDate, region?.timezoneSid)
  const zonedEndDate = utcToZonedTime(endDate, region?.timezoneSid)
  const startDateLabel = startDate ? format(zonedStartDate, `${LONG_DATE_FORMAT} K:mm aaa`) : '-- -- ----'
  const endDateLabel = endDate ? format(zonedEndDate, `${LONG_DATE_FORMAT} K:mm aaa`) : '-- -- ----'

  return (
    <span>
      { `${ startDateLabel } - ${ endDateLabel}` }
    </span>
  )
}

export default React.memo(DateRangeCell)
