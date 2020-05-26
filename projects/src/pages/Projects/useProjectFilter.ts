import * as React from 'react'
import { AppContext } from '../../App'
import { cloneDeep } from 'lodash'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchRegions, fetchAccounts, fetchContacts, getFilterSets, setFilterSets, fetchLocations } from '../../Services/DataServices'
import { SavedFilterSetInterface } from '../../commons/types'

export const useProjectFilter = () => {
  const appContext = React.useContext(AppContext)
  const { projectStatuses = [] } = appContext?.config || {}

  const defaultFilterBar: IFilter<{ id: string; name: string;  }>[] = [
    {
      id: 'projectStatus',
      name: 'Status',
      items: projectStatuses,
      selectedIds: [],
      inputType: 'checkbox',
    },
    {
      id: 'accountIds',
      name: 'Account',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchAccounts(searchTerm)
        return res.map(item => ({ id: item.UID, name: item.Name }))
      }
    },
    {
      id: 'contactId',
      name: 'Contact',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchContacts(searchTerm)
        return res.map(item => ({ id: item.UID, name: item.Name }))
      }
    },
    {
      id: 'regionIds',
      name: 'Region',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchRegions(searchTerm)
        return res.map(item => ({ id: item.UID, name: item.Name }))
      }
    },
    {
      id: 'locationIds',
      name: 'Location',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchLocations(searchTerm)
        return res.map(item => ({ id: item.UID, name: item.Name }))
      }
    }
  ]
  const filterBar = defaultFilterBar
  // const [filterBar, setFilterBar] = React.useState(defaultFilterBar)
  const [appliedFilter, setAppliedFilter] = React.useState<any>([])
  const [savedFilterSets, setSavedFilterSets] = React.useState<SavedFilterSetInterface[]>([])

  const saveFilterSets = React.useCallback((name: string, filterSet: any) => {
    setFilterSets([...savedFilterSets, { name, filterSet, id: new Date().valueOf() }])
  }, [setSavedFilterSets])

  React.useEffect(() => {
    setSavedFilterSets(getFilterSets())
  }, [])

  React.useEffect(() => {
    const newFilters = cloneDeep(defaultFilterBar)
    appliedFilter.forEach(item => {
      const matchIndex = newFilters.findIndex(newItem => item.id === newItem.id)
      if (matchIndex !== -1) {
        newFilters[matchIndex] = {...newFilters[matchIndex], selectedIds: item.selectedItems.map(i => i.id)}
        // setFilterBar(newFilters)
      }
    })
  }, [appliedFilter])

  return React.useMemo(() => ({
    filterBar,
    appliedFilter,
    setAppliedFilter,
    savedFilterSets,
    saveFilterSets
  }), [appliedFilter, savedFilterSets, filterBar])
}
