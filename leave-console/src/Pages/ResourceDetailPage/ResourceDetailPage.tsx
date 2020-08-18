import React, { memo, FC, useMemo, useCallback } from 'react'
import { startOfDay, startOfMonth, parseISO, endOfDay, endOfMonth } from 'date-fns'
import { useParams } from 'react-router-dom'
import { connect, useSelector, useDispatch } from 'react-redux'

import { classes } from '../../common/utils/classes'
import { Button } from '@skedulo/sked-ui'
import AbsenceTables from '../../Components/AbsenceTables'
import UnavailabilityDetails from '../../Components/UnvailabilityDetails'
import DetailsHeader from '../../Components/DetailsHeader'
import { State, Resource, UnavailabilityTableItem, TimeRange } from '../../Store/types'
import { setTimeRange, setTimeRangeSimp } from '../../Store/reducers/timeRange'
import { updateAvailability } from '../../Mutations/input'
import { useGlobalLoading } from '../../Components/GlobalLoading'

interface Props {
  resources?: Resource[]
  unavailabilities?: UnavailabilityTableItem[]
  setTimeRange: typeof setTimeRange
  setTimeRangeSimp: typeof setTimeRangeSimp
  timeRange: TimeRange
  unavailability?: UnavailabilityTableItem
  updateAvailability: typeof updateAvailability
}

const ResourceDetailPage: FC<Props> = ({ }) => {
  const dispatch = useDispatch()

  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const { availabilityId } = useParams<{ availabilityId?: string }>()

  const { unavailabilities, region } = useSelector((state: State) => ({
    unavailabilities: state.unavailabilities || [],
    region: state.region || {}
  }))

  const unavailability = useMemo(() => {
    return unavailabilities?.find(item => item.UID === availabilityId)
  }, [unavailabilities, availabilityId])

  const handleUpdateStatus = useCallback((status: 'Approved' | 'Declined' | 'Pending') => async () => {
    try {
      startGlobalLoading()
      await dispatch(updateAvailability({
        UID: unavailability!.UID,
        Status: status,
        Resource: unavailability!.Resource,
        Start: unavailability!.Start,
        Finish: unavailability!.Finish,
        Type: unavailability!.Type
      }))
    } catch (error) {
      throw error
    } finally {
      endGlobalLoading()
    }
  }, [unavailability])

  if (!unavailability) {
    return null
  }

  return (
    <div className="cx-bg-white cx-h-full">
      <DetailsHeader
        userData={unavailability.Resource}
        unavailabilityStatus={unavailability.Status}
        onApprove={handleUpdateStatus('Approved')}
        onReject={handleUpdateStatus('Declined')}
        onRecall={handleUpdateStatus('Pending')}
      />
      <UnavailabilityDetails data={unavailability} />
      <AbsenceTables data={{ unavailability }} />
    </div >
  )
}

export default memo(ResourceDetailPage)
