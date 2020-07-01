import { Dispatch } from 'redux'
import getOverlappingDaysInIntervals from 'date-fns/getOverlappingDaysInIntervals'
import parseISO from 'date-fns/parseISO'
import { eachDayOfInterval, startOfDay, endOfDay, areIntervalsOverlapping } from 'date-fns'

import {
  makeActionsSet,
  makeAsyncActionCreatorSimp,
  makeActionCreator,
  makeReducers
} from '../../common/utils/redux-helpers'

import * as Queries from '../queries'
import { Services } from '../../Services/Services'
import { State, Availability, JobAllocation, UnavailabilityTableItem } from '../types'

const AVAILABILITY = makeActionsSet('AVAILABILITY')
const dateFilter = (startDate: string, endDate: string) => `Start < ${endDate} AND Finish > ${startDate}`
const arrayFilter = (array: string[]) => `[${array.map(element => `'${element}'`).join(',')}]`
const formatFilterValue = (valueArray: string[]) => valueArray.length === 1
  ? `== '${valueArray[0]}'`
  : `IN ${arrayFilter(valueArray)}`

const createAllAvailabilitiesFilters = (store: State) => {
  const { timeRange: { startDate,endDate }, filters } = store

  const appliedFilters = filters
    .filter(filter => filter.value && filter.value.length > 0)
    .map(({
       value, selector
    }) => `${selector} ${formatFilterValue(value)}`)
  const dateFilters = dateFilter(startDate,endDate)
  return ['IsAvailable == false', dateFilters, ...appliedFilters].join(' AND ')
}

export const getAvailabilities = makeAsyncActionCreatorSimp(
  AVAILABILITY, () => async (dispatch: Dispatch, getState: () => State) => {
    const store = getState()
    const filters = createAllAvailabilitiesFilters(store)
    const resp = await Services.graphQL.fetch<{availability: Availability[]}>({
      query: Queries.AllAvailabilitiesQuery,
      variables: {
        filters
      }
    })
    return resp
  }
)

const availabilityTransform = ({ availabilities }: {availabilities: Availability[] }) => {
  const unavailabilityTableData: UnavailabilityTableItem[] = availabilities.map(availability => {
    const { Start, Finish, Resource: { JobAllocations } } = availability

    const unavailabilityStart = parseISO(Start)
    const unavailabilityEnd = parseISO(Finish)
    const conflicts = countConflicts(unavailabilityStart, unavailabilityEnd, JobAllocations)
    const conflictsByDay = getConflictsByDay(unavailabilityStart, unavailabilityEnd, JobAllocations)

    return {
      ...availability,
      conflicts,
      conflictsByDay
    }
  })

  return {
    availabilities: unavailabilityTableData
  }
}

const countConflicts = (unavailabilityStart: Date, unavailabilityEnd: Date, jobAllocations: JobAllocation[]) => {
  let conflicts = 0

  jobAllocations.map(jobAllocation => {
    const overlappingDays = getOverlappingDaysInIntervals(
      { start: parseISO(jobAllocation.Start), end: parseISO(jobAllocation.End) },
      { start: unavailabilityStart, end: unavailabilityEnd }
    )
    if (overlappingDays > 0) {
      conflicts += 1
    }
  })

  return conflicts
}

const getConflictsByDay = (unavilabilityStart: Date, unavailabilityEnd: Date, jobAllocations: JobAllocation[]) => {
  const conflicts = new Map<string, number>()
  const unavailabilityIntervals = toDayIntervals({ start: unavilabilityStart, end: unavailabilityEnd })
  const allocationIntervals: Interval[] = jobAllocations
    .map(allocation => ({ start: parseISO(allocation.Start), end: parseISO(allocation.End) }))

  unavailabilityIntervals.forEach(dayInterval =>  {
    const key = startOfDay(dayInterval.start).toString()

    allocationIntervals.forEach(allocationInterval =>  {
      if (areIntervalsOverlapping(dayInterval, allocationInterval)) {
        conflicts.set(key, (conflicts.get(key) || 0) + 1)
      }
    })
  })

  return conflicts
}

const toDayIntervals: (interval: Interval) => Interval[] = interval => {
  const days = eachDayOfInterval(interval)
  return days.map((day, index, allDays) => {
    const start = index === 0 ? interval.start : startOfDay(day)
    const end = index === allDays.length - 1 ? interval.end : endOfDay(day)
    return { start, end }
  })
}

export default {
  ...makeReducers(AVAILABILITY, { transform: availabilityTransform })
}
