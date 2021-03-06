import * as React from 'react'
import { AppContext } from '../../App'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchGenericOptions } from '../../Services/DataServices'

const useJobFilter = () => {
  const appContext = React.useContext(AppContext)
  const { jobTypes = [], jobStatuses = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'jobTypes',
      name: 'Job Types',
      items: jobTypes,
      selectedIds: [],
      inputType: 'checkbox',
    },
    {
      id: 'jobStatuses',
      name: 'Job Status',
      items: jobStatuses,
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
    // {
    //   id: 'regionIds',
    //   name: 'Region',
    //   items: [],
    //   selectedIds: [],
    //   inputType: 'radio',
    //   useFetch: async (searchTerm: string) => {
    //     const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Region__c' })
    //     return res.map(item => ({ id: item.value, name: item.label }))
    //   }
    // },
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
  ]), [jobTypes])
  const [filterBar, setFilterBar] = React.useState<IFilter<{ id: string; name: string; }>[]>([])
  const [appliedFilter, setAppliedFilter] = React.useState<any>([])

  React.useEffect(() => {
    if (jobTypes.length) {
      setFilterBar(defaultFilterBar)
    }
  }, [jobTypes])

  return React.useMemo(() => ({
    filterBar,
    setFilterBar,
    appliedFilter,
    setAppliedFilter
  }), [appliedFilter, filterBar])
}

export default useJobFilter
