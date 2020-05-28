import * as React from 'react'
import { AppContext } from '../../App'
import { cloneDeep } from 'lodash'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchRegions, fetchAccounts, fetchContacts, getLocalFilterSets, setLocalFilterSets, fetchLocations } from '../../Services/DataServices'
import { SavedFilterSetInterface } from '../../commons/types'

export const useProjectFilter = () => {
  const appContext = React.useContext(AppContext)
  const { projectStatuses = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
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
      id: 'contactIds',
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
  ]), [projectStatuses])
  const [filterBar, setFilterBar] = React.useState<IFilter<{ id: string; name: string; }>[]>([])
  const [appliedFilter, setAppliedFilter] = React.useState<any>([])
  const [savedFilterSets, setSavedFilterSets] = React.useState<SavedFilterSetInterface[]>(getLocalFilterSets())

  const saveFilterSets = React.useCallback((newFilterSet: any) => {
    setLocalFilterSets([...getLocalFilterSets(), newFilterSet])
    setSavedFilterSets(getLocalFilterSets())
  }, [savedFilterSets])

  const deleteFilterSet = React.useCallback((id: string) => {
    setLocalFilterSets(getLocalFilterSets().filter((item: SavedFilterSetInterface) => item.id !== id))
    setSavedFilterSets(getLocalFilterSets())
  }, [])

  React.useEffect(() => {
    if (projectStatuses.length) {
      setFilterBar(defaultFilterBar)
    }
  }, [projectStatuses])

  return React.useMemo(() => ({
    filterBar,
    setFilterBar,
    appliedFilter,
    setAppliedFilter,
    savedFilterSets,
    saveFilterSets,
    deleteFilterSet
  }), [appliedFilter, savedFilterSets, filterBar])
}
