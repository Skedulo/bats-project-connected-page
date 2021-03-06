import React, { useMemo, useEffect, useState } from 'react'
import { keyBy, uniqBy } from 'lodash'
import { useSelector } from 'react-redux'
import { addDays, parseISO, eachDayOfInterval } from 'date-fns'
import { utcToZonedTime, format } from 'date-fns-tz'
import { classes } from '../../common/utils/classes'
import Tile from '../Tile'
import AvailabilityChart from '../AvailabilityChart'
import AvailabilityByTypeChart from '../AvailabilityByTypeChart'
import { State, Resource, IResource, IBaseModel } from '../../Store/types'
import './DashboardSummary.scss'
import { AvailabilityChartData } from '../../Store/types/Availability'
import { fetchGenericOptions } from '../../Services/DataServices'
import { DATE_FORMAT } from '../../common/constants'
import { getEachDayOfInterval } from '../../common/utils/dateTimeHelpers'

const bem = classes('dashboard-summary')

const DashboardSummary: React.FC = () => {
  const { availabilities, unavailabilities, resources, timeRange, region } = useSelector((state: State) => ({
    availabilities: state.availabilities,
    unavailabilities: state.unavailabilities?.filter(item => !item.IsAvailable) || [],
    resources: state.resources,
    timeRange: state.timeRange,
    region: state.region || { timezoneSid: '' }
  }))
  const [depots, setDepots] = useState<IBaseModel[]>([])

  const getDepots = async(regionId: string) => {
    const resp = await fetchGenericOptions({ name: '', sObjectType: 'sked__Region_Area__c', regionIds: regionId })
    const formattedResp = resp.map(item => ({ id: item.value, name: item.label }))
    setDepots(formattedResp)
  }

  const daysBetween = useMemo(() => {
    return getEachDayOfInterval(
      utcToZonedTime(parseISO(timeRange.startDate), region.timezoneSid),
      // utcToZonedTime(parseISO(timeRange.endDate), region.timezoneSid)
      addDays(utcToZonedTime(parseISO(timeRange.endDate), region.timezoneSid), -1)
    )
  }, [timeRange])

  const unavailableResources = useMemo(() => {
    if (!unavailabilities) {
      return 0
    }
    return uniqBy(unavailabilities.filter(item => item.Status === 'Approved'), 'Resource.UID').length
  }, [unavailabilities])

  const requestsStats = useMemo(() => {
    let requestsCount = 0
    let approvedCount = 0

    unavailabilities?.forEach(unavailability => {
      requestsCount += 1
      if (unavailability.Status === 'Approved') {
        approvedCount += 1
      }
    })

    return `${approvedCount} / ${requestsCount} approved`
  }, [unavailabilities])

  const conflictsStat = useMemo(() => {
    let conflictsCount = 0

    unavailabilities?.forEach(unavailability => {
      conflictsCount += unavailability.conflicts!
    })

    return conflictsCount.toString()
  }, [unavailabilities])

  const availabilityData = useMemo(() => {
    const data = Array.from({ length: daysBetween.length })
    const resourcesKeyById = keyBy(resources, 'id')
    daysBetween.forEach((date, i) => {
      const formattedDate = format(date, DATE_FORMAT)
      let resourcesCount = 0
      const availabilityResources: IResource[] = []
      if (availabilities) {
        Object.keys(availabilities).forEach(resourceId => {
          if (availabilities[resourceId].availability.records[0]?.length) {
            // const availabilityRecords = availabilities[resourceId].availability.records[0]
            const approvedUnavailability = unavailabilities.find(item => {
              const startDate = format(utcToZonedTime(item.Start, region.timezoneSid), DATE_FORMAT, { timeZone: region.timezoneSid })
              const endDate = format(utcToZonedTime(item.Finish, region.timezoneSid), DATE_FORMAT, { timeZone: region.timezoneSid })
              return formattedDate >= startDate && formattedDate <= endDate && item.Status === 'Approved' && item.Resource.UID === resourceId
            })
            const availabilityRecords = availabilities[resourceId].available
            const matchedRecord = availabilityRecords.find(item => {
              const startDate = format(utcToZonedTime(item.start, region.timezoneSid), DATE_FORMAT, { timeZone: region.timezoneSid })
              const endDate = format(utcToZonedTime(item.end, region.timezoneSid), DATE_FORMAT, { timeZone: region.timezoneSid })
              return formattedDate >= startDate && formattedDate <= endDate
            })

            if (matchedRecord && !approvedUnavailability) {
              resourcesCount += 1
              availabilityResources.push(resourcesKeyById[resourceId])
            }
          }
        })
      }

      const chartItem = {
        date,
        resourcesCount,
        shortDate: format(date, 'M/d'),
        resources: availabilityResources,
      }
      data[i] = chartItem
    })
    return data as AvailabilityChartData[]
  }, [daysBetween, availabilities, resources, unavailabilities])

  useEffect(() => {
    if (region?.id) {
      getDepots(region.id)
    }
  }, [region])

  return (
    <div className={ bem() }>
      <Tile
        className={ bem('tile') }
        title="Total Resources"
        amount={resources?.length || 0}
        iconName="resource"
      />
      <Tile
        className={ bem('tile') }
        title="Unavailable Resources"
        amount={unavailableResources}
        iconName="resourceRemove"
      />
      <Tile
        className={ bem('tile') }
        title="Number of Requests"
        amount={requestsStats}
        iconName="availability"
      />
      <Tile
        className={ bem('tile') }
        title="Conflicts"
        amount={conflictsStat}
        iconName="warning"
        warning
      />
      <AvailabilityChart
        className={bem('availability-chart')}
        data={availabilityData}
        depots={depots}
        totalResources={resources?.length || 0}
      />
      <AvailabilityByTypeChart
        className={bem('availability-chart-by-type')}
        data={availabilityData}
        depots={depots}
      />
    </div>
  )
}

export default React.memo(DashboardSummary)
