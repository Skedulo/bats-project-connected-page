import * as React from 'react'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'

const UnavailabilityStatus = [
  { id: 'Pending', name: 'Pending' }
]

export const useRuleFilter = () => {
  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'status',
      name: 'Status',
      items: UnavailabilityStatus,
      selectedIds: [],
      inputType: 'checkbox',
    }
  ]), [])
  const [filterBar, setFilterBar] = React.useState<IFilter<{ id: string; name: string; }>[]>(defaultFilterBar)
  const [appliedFilter, setAppliedFilter] = React.useState<any>([])

  return React.useMemo(() => ({
    filterBar,
    setFilterBar,
    appliedFilter,
    setAppliedFilter,
  }), [appliedFilter, filterBar])
}
