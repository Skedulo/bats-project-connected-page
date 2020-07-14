import * as React from 'react'
import { useSelector } from 'react-redux'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchGenericOptions } from '../../Services/DataServices'
import { State } from '../../Store/types'

export const useRuleFilter = () => {
  const { coreSkills, categories } = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills || [],
    categories: state.configs?.resourceCategories || [],
  }))

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'regionIds',
      name: 'Region',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Region__c' })
        return res.map(item => ({ id: item.value, name: item.label }))
      }
    },
    {
      id: 'depotIds',
      name: 'Depot',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Location__c' })
        return res.filter(item => item.isDepot).map(item => ({ id: item.value, name: item.label }))
      }
    },
    {
      id: 'coreSkills',
      name: 'Core skill',
      items: coreSkills,
      selectedIds: [],
      inputType: 'checkbox'
    },
    {
      id: 'categories',
      name: 'Category',
      items: categories,
      selectedIds: [],
      inputType: 'checkbox'
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
