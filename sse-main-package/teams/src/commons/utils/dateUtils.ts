import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz/fp'
import { flow } from 'lodash/fp'

export type getTime = (timezone: string, date: Date) => string

export const timezoneWrapper = (
  ...baseFns: Array<(a: Date | number) => Date>
): getTime => (timezone, date) =>
  flow(
    utcToZonedTime(timezone),
    ...baseFns,
    zonedTimeToUtc(timezone),
    (val: Date) => val.toISOString()
  )(date)
