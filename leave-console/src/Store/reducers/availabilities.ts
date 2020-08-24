import { Dispatch } from 'redux'
import getOverlappingDaysInIntervals from 'date-fns/getOverlappingDaysInIntervals'
import { eachDayOfInterval, startOfDay, endOfDay, areIntervalsOverlapping, parseISO, format, add } from 'date-fns'
import { uniq } from 'lodash'
import {
  makeActionsSet,
  makeAsyncActionCreatorSimp,
  makeActionCreator,
  makeReducers
} from '../../common/utils/redux-helpers'

import * as Queries from '../queries'
import { Services } from '../../Services/Services'
import { getResourceAvailabilities, fetchUnavailabilityExceptions, countUnavailabilityExceptions } from '../../Services/DataServices'
import { State, Availability, JobAllocation, UnavailabilityTableItem } from '../types'
import { IResourceAvailability } from '../types/Availability'
import { getUnavailabilityExceptions } from './unavailabilyExceptions'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import moment from 'moment-timezone'
const AVAILABILITY = makeActionsSet('AVAILABILITY')
const dateFilter = (startDate: string, endDate: string) => `Start < ${endDate} AND Finish > ${startDate}`
const arrayFilter = (array: string[]) => `[${array.map(element => `'${element}'`).join(',')}]`
const formatFilterValue = (valueArray: string[]) => valueArray.length === 1
  ? `== '${valueArray[0]}'`
  : `IN ${arrayFilter(valueArray)}`

const createAllAvailabilitiesFilters = (store: State) => {
  const { timeRange: { startDate, endDate }, filters, region } = store
  // we have to format because the diff timezone
  const zonedStartDate = moment.tz(startDate, region.timezoneSid)
  const zonedEndDate = moment.tz(endDate, region.timezoneSid)
  const formattedStartDate = zonedStartDate.subtract(zonedStartDate.utcOffset(), 'minutes')
  const formattedEndDate = zonedEndDate.subtract(zonedEndDate.utcOffset(), 'minutes')

  const appliedFilters = filters
    .filter(filter => filter.value && filter.value.length > 0)
    .map(({
      value, selector
    }) => `${selector} ${formatFilterValue(value)}`)
  const dateFilters = dateFilter(formattedStartDate.toISOString(), formattedEndDate.toISOString())
  // const dateFilters = dateFilter(startDate, endDate)
  return [dateFilters, ...appliedFilters].join(' AND ')
}

export const getAvailabilities = makeAsyncActionCreatorSimp(
  AVAILABILITY, () => async (dispatch: Dispatch, getState: () => State) => {
    const store = getState()
    const { resources, timeRange, region } = store
    const resourceIds = resources?.map(item => item?.id) || []
    const resourceIdsGrapql = resourceIds.map(item => `\"${item}\"`).join(', ')
    const filters = createAllAvailabilitiesFilters(store)
    const [unavailabilitiesResp, availabilitiesResp] = await Promise.all([
      Services.graphQL.fetch<{availabilities: Availability[]}>({
        query: Queries.AllAvailabilitiesQuery,
        variables: {
          filters: `IsAvailable == false AND ResourceId IN [${resourceIdsGrapql}] AND ${filters}`
        }
      }),
      getResourceAvailabilities(resourceIds, [region?.id], timeRange.startDate, timeRange.endDate)
    ])

    const unavailabilityIds = unavailabilitiesResp.availabilities.map(item => item.UID)
    const unavailabilyExceptions = await countUnavailabilityExceptions(unavailabilityIds)
    return {
      availabilities: availabilitiesResp,
      unavailabilities: unavailabilitiesResp.availabilities.map(item => ({
        ...item,
        Exceptions: unavailabilyExceptions[item.UID] ? unavailabilyExceptions[item.UID].length : 0
      })),
    }
  }
)

const availabilityTransform = (
  { availabilities, unavailabilities }:
  { unavailabilities: Availability[], availabilities: Record<string, IResourceAvailability> }
) => {
  const unavailabilityTableData: UnavailabilityTableItem[] = unavailabilities.map(unavailability => {
    const { Start, Finish, Resource: { JobAllocations } } = unavailability
    const unavailabilityStart = parseISO(Start)
    const unavailabilityEnd = parseISO(Finish)
    const conflicts = countConflicts(unavailabilityStart, unavailabilityEnd, JobAllocations) + unavailability.Exceptions
    const conflictsByDay = getConflictsByDay(unavailabilityStart, unavailabilityEnd, JobAllocations)

    return {
      ...unavailability,
      conflicts,
      conflictsByDay
    }
  })

  return {
    availabilities,
    unavailabilities: unavailabilityTableData,
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
  ...makeReducers(AVAILABILITY, { transform: availabilityTransform, dataField: ['unavailabilities'] })
}
