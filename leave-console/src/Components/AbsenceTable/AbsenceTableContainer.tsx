import React, { useEffect } from 'react'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { useSelector } from 'react-redux'

import { AbsenceTable } from './AbsenceTable'
import { State, UnavailabilityTableItem, Resource } from '../../Store/types'
import { AbsenceRowData } from './types/AbsenceRowData'
import { getDefaultAvatar } from '../../common/utils/avatars'

interface Props {
  unavailability?: UnavailabilityTableItem,
  startDate?: Date
  endDate?: Date
  onAbsenceCountChange: (count: number) => void
}

export const AbsenceTableContainer: React.FC<Props> = ({ unavailability, startDate, endDate, onAbsenceCountChange }) => {
  const unavailabilities = useSelector<State, UnavailabilityTableItem[] | undefined>(state => state.availabilities)
  const resources = useSelector<State, Resource[] | undefined>(state => state.resources)

  const leaveRequest = createLeaveRequest(unavailability, resources)
  const absenceData = getAbsenceData(unavailabilities, resources, leaveRequest ? leaveRequest.resource.UID : undefined)
  const startOfRequestMonth = leaveRequest ? startOfMonth(leaveRequest.leave.start) : new Date()
  const endOfRequestMonth = endOfMonth(startOfRequestMonth)

  useEffect(() => {
    onAbsenceCountChange(absenceData.length)
  }, [absenceData])

  return (
    <AbsenceTable
      startDate={ startDate || startOfRequestMonth }
      endDate={ endDate || endOfRequestMonth }
      leaveRequest={ leaveRequest }
      absenceData={ absenceData }
    />
  )
}

const createLeaveRequest = (unavailability?: UnavailabilityTableItem, resources?: Resource[]) => {
  if (!unavailability || !resources) {
    return undefined
  }

  const resource = resources.find(resourceItem => resourceItem.UID === unavailability.Resource.UID)
  if (!resource) {
    return undefined
  }

  return {
    resource: {
      UID: resource.UID,
      name: resource.Name,
      category: resource.Category,
      avatarUrl: resource!.User
        ? resource!.User.SmallPhotoUrl
        : getDefaultAvatar()
    },
    leave: {
      name: unavailability.Name,
      start: parseISO(unavailability.Start),
      end: parseISO(unavailability.Finish),
      conflictsByDay: unavailability.conflictsByDay,
      conflicts: unavailability.conflicts
    }
  }
}

const getAbsenceData = (unavailabilities?: UnavailabilityTableItem[], resources?: Resource[], requestingResourceId?: string) => {
  if (!unavailabilities || !resources) {
    return []
  }

  const absenceData = new Map<string, AbsenceRowData>()
  for (const unavailability of unavailabilities) {
    const absenceKey = unavailability.Resource.UID
    if (requestingResourceId && absenceKey === requestingResourceId) {
      continue
    }

    appendUserIfNotExists(absenceData, absenceKey, resources)

    absenceData.get(absenceKey)!.leaves.push({
      name: 'Annual Leave',
      start: new Date(unavailability.Start),
      end: new Date(unavailability.Finish),
      conflictsByDay: unavailability.conflictsByDay,
      conflicts: unavailability.conflicts
    })
  }

  return Array.from(absenceData.values())
}

const appendUserIfNotExists = (absenceData: Map<string, AbsenceRowData>, resourceId: string, resources: Resource[]) => {
  if (!absenceData.has(resourceId)) {
    const resource = resources.find(res => res.UID === resourceId)
    absenceData.set(resourceId, {
      resource: {
        UID: resource!.UID,
        name: resource!.Name,
        category: resource!.Category,
        avatarUrl: resource!.User
          ? resource!.User.SmallPhotoUrl
          : getDefaultAvatar()
      },
      leaves: []
    })
  }
}

export default AbsenceTableContainer
