import { differenceInMinutes, parseISO } from 'date-fns'

export const calculateDurationInMinutes = (startISO?: string, endISO?: string) => {
  if (!startISO || !endISO) {
    return undefined
  }

  const totalMinutes = differenceInMinutes(parseISO(endISO!), parseISO(startISO!))
  return totalMinutes
}

const hoursLabel = (hours: number) => {
  return hours > 0
    ? `${hours}h`
    : ''
}

const minutesLabel = (minutes: number) => {
  return minutes > 0
    ? `${minutes} min`
    : ''
}

export const minutesToDuration = (totalMinutes?: number) => {
  if (totalMinutes === null || totalMinutes === undefined) {
    return undefined
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hoursLabel(hours)} ${minutesLabel(minutes)}`
}

export const breakMilisecondsToHoursAndMinutes = (miliseconds: number) => {
  const minutes = Math.floor(miliseconds / 60000)
  const hours = Math.floor(minutes / 60)

  return { hours, minutes: minutes % 60 }
}

export const breakHoursToHoursAndMinutes = (totalHours: number) => {
  const hours = Math.floor(totalHours)
  const minutes = Math.floor((totalHours - hours) * 60)

  return { hours, minutes }
}

export const hoursToDuration = (totalHours: number) => {
  if (totalHours === null || totalHours === undefined) {
    return undefined
  }

  const { hours, minutes } = breakHoursToHoursAndMinutes(totalHours)
  const hLabel = hoursLabel(hours)
  const mLabel = minutesLabel(minutes)
  return hLabel ? `${hLabel} ${mLabel}` : mLabel
}

export const instantToDateTime = (instant: string) => {
  const [date, time] = new Date(instant!).toISOString().split('T')
  return [
    date,
    time.slice(0, -1)
  ]
}
