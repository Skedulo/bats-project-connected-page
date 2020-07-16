import React, { useEffect, useCallback, memo, useState } from 'react'
import { connect, useSelector, useDispatch } from 'react-redux'
import { initSubscriptionService, registerNewSubscription } from '../../Store/reducers/subscription'
import { getResources, getConfigs } from '../../Store/reducers/fetch'
import { updateAvailability } from '../../Mutations/input'
import { State, Availability } from '../../Store/types'
import { classes } from '../../common/utils/classes'
import TimeRangeControl from '../../Components/TimeRangeControl'
import DashboardFilter from './DashboardFilter'
import DashboardSummary from '../../Components/DashboardSummary'

import './DashboardPage.scss'
import { IconButton } from '@skedulo/sked-ui'
import { routes } from '..'
import { Link } from 'react-router-dom'
import { getAvailabilities } from '../../Store/reducers/availabilities'
import LoadingTrigger from '../../Components/GlobalLoading/LoadingTrigger';
import UnavailabilityTable from '../../Components/UnavailabilityTable';

const bem = classes('dashboard-page')

type ReduxProps = Pick<State, 'subscriptionStatus'>

interface IProps extends ReduxProps {
  getConfigs: typeof getConfigs
  getResources: typeof getResources
  updateAvailability: typeof updateAvailability
  initSubscriptionService: typeof initSubscriptionService
  registerNewSubscription: typeof registerNewSubscription
}

const DashboardPage: React.FC<IProps> = () => {
  const dispatch = useDispatch()
  const {
    subscriptionStatus,
    region,
    regions,
    timeRange,
    resources
  } = useSelector((state: State) => ({
    subscriptionStatus: state.subscriptionStatus,
    regions: state.configs?.regions || [],
    region: state.region,
    timeRange: state.timeRange,
    resources: state.resources
  }))
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchAvailabilities = useCallback(async () => {
    try {
      setIsLoading(true)
      await dispatch(getAvailabilities())
    } catch (error) {
      console.log('error: ', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const onRecall = useCallback(async (unavailability: Availability) => {
    try {
      setIsLoading(true)
      await dispatch(updateAvailability({
        UID: unavailability.UID,
        Status: 'Pending',
        Resource: unavailability!.Resource,
        Start: unavailability!.Start
      }))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    registerNewSubscription('AvailabilityUpdate', undefined, true)
  }, [subscriptionStatus])

  useEffect(() => {
    if (region) {
      dispatch(getResources())
    }
  }, [region])

  useEffect(() => {
    fetchAvailabilities()
  }, [timeRange, resources])

  return (
    <>
      {isLoading && <LoadingTrigger />}
      <section className={ bem('filters') }>
        <Link to={routes.settings()}>
          <IconButton icon="settings" tooltipContent="Setting" />
        </Link>
        <TimeRangeControl />
        {regions.length > 0 && region && <DashboardFilter />}
      </section>
      <section>
        <DashboardSummary />
      </section>
      <section>
        <UnavailabilityTable
          onRecall={onRecall}
        />
      </section>
    </>
  )
}

export default memo(DashboardPage)
