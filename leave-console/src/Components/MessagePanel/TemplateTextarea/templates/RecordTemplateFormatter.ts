/* eslint-disable @typescript-eslint/no-explicit-any */
import * as moment from 'moment-timezone'
import { isPlainObject } from 'lodash'

// Date format from the back-end 'Jan 11, 01:00 PM AEST'
const DEFAULT_INSTANT_FORMAT = 'MMM D, hh:mm A zz'

export function format(o: { Timezone?: string }): object {
  const timezone = o.Timezone
  const opts = { timezone }
  function go(data: { [key: string]: any }): object {
    const obj: { [key: string]: any } = {}
    Object.keys(data).forEach(key => {
      const value = data[key]
      // tslint:disable-next-line: prefer-conditional-expression
      if (value !== null && isPlainObject(value)) {
        obj[key] = go(value)
      } else {
        obj[key] = formatValue(value, { ...opts, isDuration: key === 'Duration' })
      }
    })
    return obj
  }
  return go(o)
}

// a poor implementation of what the backend does; should either ScalaJS or expose ElasticTypeTag
export function formatValue(value: any, opts: { isDuration?: boolean; timezone?: string }): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    const date = opts.timezone ? moment.tz(value, opts.timezone) : moment(value)
    return date.format(DEFAULT_INSTANT_FORMAT)
  }
  if (typeof value === 'number' && opts.isDuration) {
    return formatMins(value)
  }
  return `${value}`
}

export function formatMins(mins: number): string {
  if (mins < 60) {
    return mins === 1 ? `${mins} min` : `${mins} mins`
  }
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60

  const hourStr = hours === 1 ? `${hours} hour` : `${hours} hours`
  const minStr = remainingMins > 0 ? formatMins(remainingMins) : ''
  return `${hourStr} ${minStr}`.trim()
}
