import React, { memo, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classnames from 'classnames'
import { lowerCase, keyBy } from 'lodash'
import { Icon } from '@skedulo/sked-ui'
import { format } from 'date-fns'

import { fetchResourcesByRegion, getTeamSuggestions } from '../../../Services/DataServices'
import { updateResources, updateSuggestions } from '../../../Store/action'
import { Resource, State, TeamFilterParams } from '../../types'
import { DATE_FORMAT } from '../../constants'

import SearchBox from '../SearchBox'
import ResourceCard from '../ResourceCard'
import { useGlobalLoading } from '../GlobalLoading'

interface ResourceSidebarProps {
  filterParams: TeamFilterParams
}

const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ filterParams }) => {
  const dispatch = useDispatch()
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const storeResources = useSelector<State, Resource[]>(state => state.resources)
  const showResourceSidebar = useSelector<State, boolean>(state => state.showResourceSidebar)

  const [displayResources, setDisplayResources] = useState<Resource[]>([])

  // const [searchText, setSearchText] = useState<string>('')

  const getResources = useCallback(async (regionId: string) => {
    startGlobalLoading()
    const res = await fetchResourcesByRegion(regionId)
    dispatch(updateResources(res))
    endGlobalLoading()
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    setDisplayResources(storeResources.filter(item => lowerCase(item.name).includes(lowerCase(value))))
  }, [storeResources])

  const onGetResourceSuggestion = useCallback(async (resource: Resource) => {
    startGlobalLoading()
    const suggestions = await getTeamSuggestions({
      resource: resource,
      regionIds: filterParams.regionIds || '',
      startDate: format(filterParams.startDate, DATE_FORMAT),
      endDate: format(filterParams.endDate, DATE_FORMAT),
      // tagIds: resource.tags?.map(tag => tag.id).join(',') || '',
      timezoneSid: resource.region?.timezoneSid || ''
    })
    endGlobalLoading()
    dispatch(updateSuggestions(keyBy(suggestions, 'id')))
  }, [filterParams])

  useEffect(() => {
    getResources(filterParams.regionIds || '')
  }, [filterParams.regionIds])

  useEffect(() => {
    setDisplayResources(storeResources)
    // setSearchText('')
  }, [storeResources])

  return (
    <div
      className={classnames('cx-w-240px cx-bg-neutral-200 cx-h-full cx-overflow-auto cx-border-r-4', {
        'cx-hidden': !showResourceSidebar
      })}
    >
      <SearchBox
        className="cx-border-t-0 cx-border-r-0 cx-border-b cx-sticky cx-top-0"
        placeholder="resources"
        onChange={onSearchTextChange}
      />
      {displayResources.map(resource => (
        <ResourceCard
          key={resource.id}
          className="cx-p-2 cx-mx-2 cx-mt-2 cx-border cx-border-neutral-500 cx-rounded"
          resource={resource}
          actionButton={
            <Icon
              name="suggest"
              className="cx-ml-1 cx-text-neutral-600 cx-cursor-pointer hover:cx-text-primary"
              onClick={async () => await onGetResourceSuggestion(resource)}
            />
          }
        />
      ))}
    </div>
  )
}

export default memo(ResourceSidebar)