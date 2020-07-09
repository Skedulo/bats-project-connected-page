import React, { useState, useEffect, memo, useCallback } from 'react'
import { startOfMonth, parseISO, endOfMonth } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'

import { classes } from '../../common/utils/classes'
import { CalendarControls, Tabs } from '@skedulo/sked-ui'
import WorkConflictsTable from '../../components/WorkConflictsTable'
import ExceptionsTable from '../../components/ExceptionsTable'
import AbsenceTable from '../AbsenceTable'
import { UnavailabilityTableItem, State } from '../../Store/types'
import { getJobAllocations } from '../../Store/reducers/conflictingJobAllocations'

import './AbsenceTables.scss'
import { useGlobalLoading } from '../GlobalLoading'

const bem = classes('absence-tables')

interface TabTitleProps {
  title: string,
  count: number,
  warning?: boolean,
}

enum Tab {
  Off = 'who-is-off',
  Conflicts = 'work-conflicts',
  Exceptions = 'exceptions',
}

interface AbsenceTablesProps {
  data: {
    unavailability?: UnavailabilityTableItem
  }
}

const AbsenceTables: React.FC<AbsenceTablesProps> = ({ data: { unavailability } }) => {
  const [tab, setTab] = useState(Tab.Off)

  const dispatch = useDispatch()

  const [startDate, handleDateSelect] = useState(startOfMonth(unavailability ? parseISO(unavailability.Start) : new Date()))

  const conflictingJobsAllocations = useSelector((state: State) => state.conflictingJobAllocations)

  const [absenceCount, setAbsenceCount] = useState(0)

  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const fetchJobAllocations = useCallback(async (start: string, end: string, resourceId: string) => {
    startGlobalLoading()
    await dispatch(getJobAllocations(start, end, resourceId))
    endGlobalLoading()
  }, [])

  useEffect(() => {
    if (unavailability) {
      handleDateSelect(startOfMonth(parseISO(unavailability.Start)))
      fetchJobAllocations(unavailability.Start, unavailability.Finish, unavailability.Resource.UID)
    }
  }, [unavailability])

  return (
    <div className={ bem() }>
      <Tabs
        tabs={ [
          { route: Tab.Off, title: `Who's Off (${absenceCount})` },
          { route: Tab.Conflicts, title: `Work Conflicts (${conflictingJobsAllocations.length})` },
          { route: Tab.Exceptions, title: `Exceptions (${conflictingJobsAllocations.length})` }
        ] }
        currentActiveRoute={ tab }
        onClick={ selectedTab => setTab(selectedTab as Tab) }
        className={ bem('tabs') }
      />
      {tab === Tab.Off && (
        <div className="cx-py-4">
          <AbsenceTable
            unavailability={unavailability}
            startDate={startOfMonth(startDate)}
            endDate={endOfMonth(startDate)}
            onAbsenceCountChange={setAbsenceCount}
          />
        </div>
      )}
      {tab === Tab.Conflicts && (
        <div className="cx-py-4">
          <WorkConflictsTable unavailability={unavailability} />
        </div>
      )}
      {tab === Tab.Exceptions && (
        <div className="cx-py-4">
          <ExceptionsTable unavailability={unavailability} />
        </div>
      )}
    </div>
  )
}

export default memo(AbsenceTables)
