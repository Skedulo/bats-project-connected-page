import React, { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { Resource, State } from '../../types'
import { Icon } from '@skedulo/sked-ui'
import { useDispatch, useSelector } from 'react-redux'
import { fetchResourcesByRegion } from '../../../Services/DataServices'
import { startLoading, endLoading, updateResources } from '../../../Store/action'
import SearchBox from '../SearchBox'
import { lowerCase } from 'lodash'
import ResourceCard from '../ResourceCard'

interface ResourceSidebarProps {
  regionId: string
}

const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ regionId }) => {
  const dispatch = useDispatch()
  const storeResources = useSelector<State, Resource[]>(state => state.resources)
  const [displayResources, setDisplayResources] = useState<Resource[]>([])

  const [searchText, setSearchText] = useState<string>('')

  const getResources = useCallback(async (regionId: string) => {
    dispatch(startLoading())
    const res = await fetchResourcesByRegion(regionId)
    dispatch(updateResources(res))
    dispatch(endLoading())
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    setDisplayResources(storeResources.filter(item => lowerCase(item.name).includes(lowerCase(value))))
  }, [storeResources])

  useEffect(() => {
    getResources(regionId)
  }, [regionId])

  useEffect(() => {
    setDisplayResources(storeResources)
    setSearchText('')
  }, [storeResources])

  return (
    <div className="cx-w-240px cx-bg-neutral-200 cx-h-full cx-overflow-auto cx-border-r-4 cx-border-neutral-400">
      <SearchBox
        className="cx-border-t-0 cx-border-r-0 cx-border-b cx-border-neutral-400 cx-sticky cx-top-0"
        placeholder="resources"
        onChange={onSearchTextChange}
      />
      {displayResources.map(resource => (
        <ResourceCard
          key={resource.id}
          className="cx-mx-2 cx-mt-2 cx-border cx-border-neutral-500 cx-rounded"
          resource={resource}
          actionButton={
            <Icon name="suggest" className="cx-ml-1 cx-text-neutral-600" />
          }
        />
      ))}
    </div>
  )
}

export default memo(ResourceSidebar)
