import * as React from 'react'
import { useSelector } from 'react-redux'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchGenericOptions } from '../../Services/DataServices'
import { State } from '../../Store/types'

export const useDashboardFilter = () => {
  const { regions, region } = useSelector((state: State) => {
    return ({
      regions: state.configs?.regions || [],
      region: state.region
    })
  })

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'regionIds',
      name: 'Region',
      items: regions,
      selectedIds: region ? [region.id] : [],
      inputType: 'radio',
      removable: false
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
