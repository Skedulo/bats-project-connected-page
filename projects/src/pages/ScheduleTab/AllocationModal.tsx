import React, { memo, useState, useEffect, useCallback } from 'react'
import { times, toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { Avatar, DynamicModal, Icon, AsyncSearchSelect, ISelectItem, SearchSelect } from '@skedulo/sked-ui'
import { parseDurationValue } from '../../commons/utils'
import { IJobDetail, IResource, IBaseModel } from '../../commons/types'
import { fetchResourcesByRegion, fetchGenericOptions } from '../../Services/DataServices';
import { RESOURCE_SORT_OPTIONS } from '../../commons/constants';

interface IAllocationModalProps {
  job: IJobDetail
  // jobPosition: string
  // travelTimeStyle: Record<string, string>
  // durationStyle: Record<string, string>
  onClose: () => void
}

interface IModalHeaderProp {
  onClose: () => void
  title: string
}

const ModalHeader: React.FC<IModalHeaderProp> = ({ onClose, title }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">{title}</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const AllocationModal: React.FC<IAllocationModalProps> = ({
  onClose,
  job
}) => {
  const [selectedRegion, setSelectedRegion] = useState<ISelectItem>({ value: job.region.id, label: job.region.name })
  const [sortType, setSortType] = useState<ISelectItem>(RESOURCE_SORT_OPTIONS[0])
  const [resources, setResources] = useState<IResource[]>([])
  const [sortedResource, setSortedResources] = useState<IResource[]>([])

  const getAvailableResources = async (regionId: string) => {
    const res = await fetchResourcesByRegion(regionId)
    setResources(res)
  }

  const fetchRegions = useCallback((input: string) => {
    return fetchGenericOptions({ sObjectType: 'sked__Region__c', name: input })
  }, [])

  const onRegionSelect = useCallback((newRegion: ISelectItem) => {
    setSelectedRegion(newRegion)
  }, [])

  const onSortTypeSelect = useCallback((newSortType: ISelectItem) => {
    setSortType(newSortType)
  }, [])

  useEffect(() => {
    getAvailableResources(job.region.id)
  }, [job.region.id])

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} title="SELECT RESOURCE(S)" />}
      className="cx-w-2/4"
    >
      <div className="cx-p-4 cx-border-t cx-border-b cx-border-neutral-300">
        <div className="cx-flex cx-items-center cx-justify-between">
          <div className="cx-flex cx-items-center">
            <label className="cx-mr-2 cx-mb-0">Region</label>
            <AsyncSearchSelect
              id="region"
              name="region"
              fetchItems={fetchRegions}
              debounceTime={300}
              onSelectedItemChange={onRegionSelect}
              initialSelectedItem={selectedRegion}
              useCache={true}
              icon="chevronDown"
            />
          </div>
          <div className="cx-flex cx-items-center">
            <label className="cx-mr-2 cx-mb-0">Sort By</label>
            <SearchSelect
              id="region"
              name="region"
              items={RESOURCE_SORT_OPTIONS}
              onSelectedItemChange={onSortTypeSelect}
              initialSelectedItem={sortType}
              icon="chevronDown"
            />
          </div>
        </div>
      </div>
    </DynamicModal>
  )
}

export default memo(AllocationModal)
