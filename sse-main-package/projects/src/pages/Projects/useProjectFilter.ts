import * as React from 'react'
import { AppContext } from '../../App'
import { cloneDeep } from 'lodash'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchGenericOptions } from '../../Services/DataServices'
import { getLocalFilterSets, setLocalFilterSets } from '../../commons/utils'
import { ISavedFilterSet } from '../../commons/types'

export const useProjectFilter = () => {
  const appContext = React.useContext(AppContext)
  const { projectStatuses = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'projectStatuses',
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
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'Account' })
        return res.map(item => ({ id: item.value, name: item.label }))
      }
    },
    {
      id: 'contactIds',
      name: 'Contact',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'Contact' })
        return res.map(item => ({ id: item.value, name: item.label }))
      }
    },
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
      id: 'locationIds',
      name: 'Location',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Location__c' })
        return res.map(item => ({ id: item.value, name: item.label }))
      }
    }
  ]), [projectStatuses])
  const [filterBar, setFilterBar] = React.useState<IFilter<{ id: string; name: string; }>[]>([])
  const [appliedFilter, setAppliedFilter] = React.useState<any>([])
  const [savedFilterSets, setSavedFilterSets] = React.useState<ISavedFilterSet[]>(getLocalFilterSets())

  const saveFilterSets = React.useCallback((newFilterSet: any) => {
    setLocalFilterSets([...getLocalFilterSets(), newFilterSet])
    setSavedFilterSets(getLocalFilterSets())
  }, [savedFilterSets])

  const deleteFilterSet = React.useCallback((id: string) => {
    setLocalFilterSets(getLocalFilterSets().filter((item: ISavedFilterSet) => item.id !== id))
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
