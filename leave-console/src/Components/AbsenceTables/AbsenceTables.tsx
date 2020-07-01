import React, { useState, useEffect } from 'react'
import { startOfMonth, parseISO, endOfMonth } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'

import { classes } from '../../common/utils/classes'
import { CalendarControls, Tabs } from '@skedulo/sked-ui'
import WorkConflictsTable from '../../components/WorkConflictsTable'
import AbsenceTable from '../AbsenceTable'
import { UnavailabilityTableItem, State } from '../../Store/types'
import { getJobAllocations } from '../../Store/reducers/conflictingJobAllocations'

import './AbsenceTables.scss'

const bem = classes('absence-tables')

interface TabTitleProps {
  title: string,
  count: number,
  warning?: boolean,
}

const TabTitle: React.FC<TabTitleProps> = ({ title, count, warning }) => (
  <div className={ bem('tab') }>
    { title }
    <div className={ bem('number', { warning: !!warning }) }>{ count }</div>
  </div>
)

enum Tab {
  Off = 'who-is-off',
  Conflicts = 'work-conflicts'
}

interface AbsenceTablesProps {
  data: {
    unavailability?: UnavailabilityTableItem
  }
}

const AbsenceTables: React.FC<AbsenceTablesProps> = ({ data: { unavailability } }) => {
  const [tab, setTab] = useState(Tab.Off)
  const [startDate, handleDateSelect] = useState(startOfMonth(unavailability ? parseISO(unavailability.Start) : new Date()))
  const dispatch = useDispatch()
  const conflictingJobsAllocations = useSelector((state: State) => state.conflictingJobAllocations)

  const [absenceCount, setAbsenceCount] = useState(0)
  useEffect(() => {
    if (unavailability) {
      handleDateSelect(startOfMonth(parseISO(unavailability.Start)))
      dispatch(getJobAllocations(unavailability.Start, unavailability.Finish, unavailability.Resource.UID))
    }
  }, [unavailability])

  return (
    <div className={ bem() }>
      <CalendarControls
        selected={ startOfMonth(startDate) }
        selectedRange="month"
        hideTodayButton
        hideRangePicker
        onDateSelect={ newDate => handleDateSelect(startOfMonth(newDate)) }
        displayMonthOnly
        alignDatepickerRight
      />
      <Tabs
        tabs={ [
          { route: Tab.Off, title: <TabTitle title="Who's Off" count={ absenceCount } /> },
          { route: Tab.Conflicts, title: <TabTitle title="Work Conflicts" count={ conflictingJobsAllocations.length } warning /> }
        ] }
        currentActiveRoute={ tab }
        onClick={ selectedTab => setTab(selectedTab as Tab) }
        className={ bem('tabs') }
      />
      { tab === Tab.Off
        ? (
          <div className={ bem('table') }>
            <AbsenceTable
              unavailability={ unavailability }
              startDate={ startOfMonth(startDate) }
              endDate={ endOfMonth(startDate) }
              onAbsenceCountChange={ setAbsenceCount }
            />
          </div>
        )
        : (
          <div className={ bem('table') }>
            <WorkConflictsTable
              unavailability={ unavailability }
            />
          </div>
        )
      }
    </div>
  )
}

export default AbsenceTables
