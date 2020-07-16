import * as React from 'react'
import { AppContext } from '../../../App'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import { fetchProjectById, fetchJobTemplateOptions } from '../../../Services/DataServices'

const useJobFilter = (projectId: string) => {
  const appContext = React.useContext(AppContext)
  const {
    jobTypes = [],
    constraintTypes = [],
    dependencyTypes = []
  } = React.useMemo(() => appContext?.config || {}, [appContext])

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'jobTypes',
      name: 'Job Type',
      items: jobTypes,
      selectedIds: [],
      inputType: 'checkbox',
    },
    // {
    //   id: 'constraintTypes',
    //   name: 'Constraint Type',
    //   items: constraintTypes,
    //   selectedIds: [],
    //   inputType: 'checkbox',
    // },
    // {
    //   id: 'dependencyTypes',
    //   name: 'Dependency Type',
    //   items: dependencyTypes,
    //   selectedIds: [],
    //   inputType: 'checkbox',
    // },
    // {
    //   id: 'dependentJobs',
    //   name: 'Dependent Job',
    //   selectedIds: [],
    //   items: [],
    //   inputType: 'checkbox',
    //   useFetch: async (searchTerm: string) => {
    //     const resp = await fetchJobTemplateOptions({ projectId, searchText: searchTerm })
    //     return resp.map(item => ({ id: item.value, name: item.label }))
    //   },
    // }
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
