import { areIntervalsOverlapping, isSameDay, startOfDay, endOfDay, isWithinInterval, addDays, subDays } from 'date-fns'

interface Interval {
  start: Date
  end: Date
}

export const getOverlappingIntervalDays = (interval1: Interval, interval2: Interval) => {
  if (!areIntervalsOverlapping(interval1, interval2)) {
    return undefined
  }

  if (isSameDay(interval1.start, interval2.end)) {
    return interval1
  }

  const normalizedInterval1 = { start: startOfDay(interval1.start), end: endOfDay(interval1.end) }
  const normalizedInterval2 = { start: startOfDay(interval2.start), end: endOfDay(interval2.end) }

  let start = normalizedInterval1.start
  while (!isWithinInterval(start, normalizedInterval2)) {
    start = addDays(start, 1)
  }

  let end = normalizedInterval1.end
  while (!isWithinInterval(end, normalizedInterval2)) {
    end = subDays(end, 1)
  }

  return {
    start,
    end
  }
}

export const isWithinDays = (date: Date, days: Date[]) => {
  return isWithinInterval(date, { start: startOfDay(days[0]), end: endOfDay(days[days.length - 1]) })
}

export const isOverlappingDays = (start: Date, end: Date, days: Date[]) => {
  return areIntervalsOverlapping(
    { start, end },
    { start: startOfDay(days[0]), end: endOfDay(days[days.length - 1]) }
  )
}
