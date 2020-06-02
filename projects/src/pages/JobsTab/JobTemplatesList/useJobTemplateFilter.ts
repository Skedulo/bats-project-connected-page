import * as React from 'react'
import { AppContext } from '../../../App'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'

const useJobFilter = () => {
  const appContext = React.useContext(AppContext)
  const { jobTypes = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

  const defaultFilterBar: IFilter<{ id: string; name: string; }>[] = React.useMemo(() => ([
    {
      id: 'jobTypes',
      name: 'Job Types',
      items: jobTypes,
      selectedIds: [],
      inputType: 'checkbox',
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
