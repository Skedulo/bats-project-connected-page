import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz/fp'
import { flow } from 'lodash/fp'
import { isNumber } from 'lodash'

export type getTime = (timezone: string, date: Date) => string

export const timezoneWrapper = (...baseFns: ((a: Date | number) => Date)[]): getTime => (timezone, date) =>
  flow(utcToZonedTime(timezone), ...baseFns, zonedTimeToUtc(timezone), (val: Date) => val.toISOString())(date)

export const getTimePickerOptions = (step = 30, is24hFormat = false) => {
  const timeOptions = []
  let optionHour = 0

  while (Math.floor(optionHour / 60) < 24) {
    const hour = Math.floor(optionHour / 60)
    const minute = optionHour % 60
    const timeVal = hour * 100 + minute
    timeOptions.push({
      numberValue: timeVal,
      stringValue: parseTimeValue(timeVal, is24hFormat)
    })
    optionHour += step
  }
  return timeOptions
}

/**
 * check if time value is a number with format hhmm
 */
const isValidTimeVal = (timeVal: number) => {
  const formatReg = /^([0-1][0-9]|2[0-4])([0-5][0-9])$/
  return isNumber(timeVal) && timeVal >= 0 && formatReg.test(('0000' + timeVal).substr(-4))
}

/**
 * parse time value (number from 0 - 2400) to time string
 */
export const parseTimeValue = (timeVal: number, is24hFormat = false) => {
  const timeValParser = /^([0-1][0-9]|2[0-4])([0-5][0-9])$/
  if (isValidTimeVal(timeVal)) {
    const parsedTimeVal = timeValParser.exec(('0000' + timeVal).substr(-4))
    const hVal = parsedTimeVal ? parsedTimeVal[1] : '00'
    const mVal = parsedTimeVal ? parsedTimeVal[2] : '00'
    return `${hVal}:${mVal}`
  }
  return `00:00`
}

/**
 * parse time string to time value (number from 0 - 2400)
 */
export const parseTimeString = (timeStr: string) => {
  if (!timeStr) {
    return timeStr
  }
  let hVal = 0
  let mVal = 0
  const timeStringParts = timeStr.split(':')
  try {
    hVal = parseInt(timeStringParts[0], 10)
    mVal = parseInt(timeStringParts[1], 10)
  } catch (ex) {
    hVal = 0
    mVal = 0
  }
  return hVal * 100 + mVal
}

/**
 * parse duration minutes to string value
 */
export const parseDurationValue = (duration: number) => {
  if (!duration) {
    return ''
  }
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  const hUnit = hours === 0 ? '' : hours === 1 ? `${hours} hr` : `${hours} hrs`
  const mUnit = minutes === 0 ? '' : minutes === 1 ? `${minutes} min` : `${minutes} mins`

  return `${hUnit} ${mUnit}`
}