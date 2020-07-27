import React, { useMemo, useEffect, useState } from 'react'
import { keyBy } from 'lodash'
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
import { fetchDepotByRegion, fetchGenericOptions } from '../../Services/DataServices'
import { DATE_FORMAT } from '../../common/constants'

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
    const resp = await fetchGenericOptions({ name: '', sObjectType: 'sked_Depot__c', regionIds: regionId })
    const formattedResp = resp.map(item => ({ id: item.value, name: item.label }))
    setDepots(formattedResp)
  }

  const daysBetween = useMemo(() => eachDayOfInterval({
    start: utcToZonedTime(parseISO(timeRange.startDate), region.timezoneSid),
    end: addDays(utcToZonedTime(parseISO(timeRange.endDate), region.timezoneSid), -1)
  }), [timeRange])

  const unavailableResources = useMemo(() => {
    return unavailabilities?.filter(item => item.Status === 'Approved').length || 0
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
      let resourcesCount = 0
      const availabilityResources: IResource[] = []
      if (availabilities) {
        Object.keys(availabilities).forEach(resourceId => {
          if (availabilities[resourceId].availability.records[0]?.length) {
            const formattedDate = format(date, DATE_FORMAT)
            const availabilityRecords = availabilities[resourceId].availability.records[0]
            const matchedRecord = availabilityRecords.find(item => {
              const startDate = format(parseISO(item.start), DATE_FORMAT, { timeZone: region.timezoneSid })
              const endDate = format(parseISO(item.end), DATE_FORMAT, { timeZone: region.timezoneSid })
              return formattedDate >= startDate && formattedDate <= endDate
            })
            if (matchedRecord) {
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
  }, [daysBetween, availabilities, resources])

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
