import React, { useEffect } from 'react'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { useSelector } from 'react-redux'

import { AbsenceTable } from './AbsenceTable'
import { State, UnavailabilityTableItem, Resource, IResource } from '../../Store/types'
import { AbsenceRowData } from './types/AbsenceRowData'
import { getDefaultAvatar } from '../../common/utils/avatars'

interface Props {
  unavailability?: UnavailabilityTableItem,
  startDate?: Date
  endDate?: Date
  onAbsenceCountChange: (count: number) => void
}

export const AbsenceTableContainer: React.FC<Props> = ({ unavailability, startDate, endDate, onAbsenceCountChange }) => {
  const { unavailabilities, resources, region } = useSelector((state: State) => ({
    unavailabilities: state.unavailabilities || [],
    resources: state.resources || [],
    region: state.region
  }))

  const leaveRequest = createLeaveRequest(unavailability, resources, region.timezoneSid)
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

const createLeaveRequest = (unavailability?: UnavailabilityTableItem, resources?: IResource[], timezone: string) => {
  if (!unavailability || !resources) {
    return undefined
  }

  const resource = unavailability.Resource
  if (!resource) {
    return undefined
  }

  return {
    resource: {
      UID: resource.UID,
      name: resource.Name,
      category: resource.CoreSkill,
      avatarUrl: resource!.User
        ? resource!.User.SmallPhotoUrl
        : getDefaultAvatar()
    },
    leave: {
      name: unavailability.Name,
      start: utcToZonedTime(unavailability.Start, timezone),
      end: utcToZonedTime(unavailability.Finish, timezone),
      conflictsByDay: unavailability.conflictsByDay,
      conflicts: unavailability.conflicts
    }
  }
}

const getAbsenceData = (unavailabilities?: UnavailabilityTableItem[], resources?: IResource[], requestingResourceId?: string) => {
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

const appendUserIfNotExists = (absenceData: Map<string, AbsenceRowData>, resourceId: string, resources: IResource[]) => {
  if (!absenceData.has(resourceId)) {
    const resource = resources.find(res => res.id === resourceId)
    absenceData.set(resourceId, {
      resource: {
        UID: resource!.id,
        name: resource!.name,
        category: resource!.coreSkill || '',
        avatarUrl: resource!.avatarUrl || getDefaultAvatar()
      },
      leaves: []
    })
  }
}

export default AbsenceTableContainer
