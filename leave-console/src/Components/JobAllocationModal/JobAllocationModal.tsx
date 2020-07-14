import React, { memo, useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react'
import { sortBy, toNumber } from 'lodash/fp'
import classnames from 'classnames'
import { useDispatch } from 'react-redux'

import {
  Avatar,
  DynamicModal,
  Icon,
  AsyncSearchSelect,
  ISelectItem,
  SearchSelect,
  FormInputElement,
  ButtonGroup,
  Button,
  LoadingSpinner
} from '@skedulo/sked-ui'
import { IResource, ResourceSortType, Job, UnavailabilityTableItem } from '../../Store/types'
import { fetchGenericOptions, fetchAvailableResources, reallocateResources } from '../../Services/DataServices'
import { RESOURCE_SORT_OPTIONS } from '../../common/constants'
import SearchBox from '../../Components/SearchBox'
import { getJobAllocations } from '../../Store/reducers/conflictingJobAllocations'
import { useGlobalLoading } from '../GlobalLoading'

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

interface IJobAllocationModalProps {
  job: Job
  unavailability: UnavailabilityTableItem
  onClose: () => void
  isOpen: boolean
}

const JobAllocationModal: React.FC<IJobAllocationModalProps> = ({
  isOpen,
  onClose,
  job,
  unavailability
}) => {
  const dispatch = useDispatch()
  const [selectedRegion, setSelectedRegion] = useState<ISelectItem>({ label: '', value: '' })
  const [sortType, setSortType] = useState<ISelectItem>(RESOURCE_SORT_OPTIONS[0])
  const [searchText, setSearchText] = useState<string>('')
  const [sortedResources, setSortedResources] = useState<IResource[]>([])
  const [displayResources, setDisplayResources] = useState<IResource[]>([])
  const [selectedResources, setSelectedResources] = useState<IResource[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReallocating, setIsReallocating] = useState<boolean>(false)
  const suggestedResources = useMemo(() => sortedResources.filter(item => item.isSuggested), [sortedResources])

  const getAvailableResources = async (
    targetJob: Job,
    regionId: string,
  ) => {
    setIsLoading(true)
    const res = await fetchAvailableResources(targetJob, regionId)
    const allocatedResources = targetJob.JobAllocations.map(item => item.Resource.UID)
    const filterResources = res.filter(item => !allocatedResources.includes(item.id))
    const sortedList = handleSort(filterResources, sortType.value)
    setIsLoading(false)
    setSortedResources(sortedList)
  }

  const handleSort = useCallback((resources: IResource[], type: ResourceSortType) => {
    switch (type) {
      case ResourceSortType.TravelDistanceFromHome:
        return sortBy((resource: IResource) => resource.suggestion?.travel?.distanceFromHome, resources)
      case ResourceSortType.TravelDurationFromHome:
        return sortBy((resource: IResource) => resource.suggestion?.travel?.durationFromHome, resources)
      case ResourceSortType.BestFit:
        return sortBy((resource: IResource) => !resource.isSuggested, resources)
      case ResourceSortType.Name:
        return sortBy((resource: IResource) => resource.name, resources)
      case ResourceSortType.Rating:
        return sortBy((resource: IResource) => resource.rating, resources)
      case ResourceSortType.Utilised:
        return sortBy((resource: IResource) => {
          if (resource.suggestion?.currentCapacityInSeconds) {
            return resource.suggestion?.currentCapacityInSeconds * -1
          }
          return 0
        }, resources)
      default:
        return resources
    }
  }, [])

  const fetchRegions = useCallback((input: string) => {
    return fetchGenericOptions({ sObjectType: 'sked__Region__c', name: input })
  }, [])

  const onRegionSelect = useCallback((newRegion: ISelectItem) => {
    setSelectedRegion(newRegion)
  }, [])

  const onSortTypeSelect = useCallback((newSortType: ISelectItem) => {
    setSortType(newSortType)
    setSortedResources((prev => {
      return handleSort(prev, newSortType.value)
    }))
  }, [])

  const onSearchTextChange = useCallback((input: string) => {
    setSearchText(input)
    if (!input) {
      setDisplayResources(sortedResources)
      return
    }
    setDisplayResources(sortedResources.filter(item => item.name.toLowerCase().includes(input.toLowerCase())))
  }, [sortedResources])

  const onSelectResource = useCallback((resource: IResource) => (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = selectedResources.some(({ id }) => id === resource.id)
    if (isChecked) {
      setSelectedResources(prev => prev.filter(item => item.id !== resource.id))
    } else {
      setSelectedResources(prev => [...prev, resource])
    }
  }, [selectedResources])

  const onSave = useCallback(async () => {
    try {
      setIsReallocating(true)
      const success = await reallocateResources(
        job.UID,
        job.JobAllocations.map(item => item.UID),
        selectedResources.map(item => item.id),
      )
      if (success) {
        await dispatch(getJobAllocations(unavailability.Start, unavailability.Finish, unavailability.Resource.UID))
      }
    } catch (error) {
      
    } finally {
      setIsReallocating(false)
      onClose()
    }
  }, [selectedResources, job, unavailability])

  useEffect(() => {
    setDisplayResources(sortedResources)
  }, [sortedResources])

  useEffect(() => {
    if (selectedRegion.value) {
      getAvailableResources(job, selectedRegion.value)
    }
  }, [selectedRegion.value, job])

  useEffect(() => {
    if (!isOpen) {
      setSelectedResources([])
    } else {
      setSelectedRegion({ label: job.Region.Name, value: job.Region?.UID })
    }
  }, [isOpen, job])

  if (!isOpen) {
    return null
  }

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} title="SELECT RESOURCE(S)" />}
      className="cx-w-2/4"
    >
      <div className="cx-p-4 cx-border-t cx-border-b cx-border-neutral-300 cx-text-xs">
        <div className="cx-flex cx-items-center cx-justify-around">
          <div className="cx-flex cx-items-center">
            <label className="cx-mr-2 cx-mb-0">Region</label>
            <AsyncSearchSelect
              id="region"
              name="region"
              fetchItems={fetchRegions}
              debounceTime={300}
              onSelectedItemChange={onRegionSelect}
              selectedItem={selectedRegion}
              useCache={true}
              icon="chevronDown"
            />
          </div>
          <div className="cx-flex cx-items-center">
            <label className="cx-mr-2 cx-mb-0">Sort By</label>
            <SearchSelect
              id="sortType"
              name="sortType"
              items={RESOURCE_SORT_OPTIONS}
              onSelectedItemChange={onSortTypeSelect}
              initialSelectedItem={sortType}
              icon="chevronDown"
            />
          </div>
        </div>
        <div className="cx-px-2 cx-pt-4 cx-pb-1 cx-border-b cx-border-neutral-300">
          {`${suggestedResources.length} available resources out of ${sortedResources.length}`}
        </div>
        <div>
          <div className="cx-py-4 cx-w-1/2">
            <SearchBox
              className="searchbox cx-mb-0 cx-border cx-mr-2"
              onChange={onSearchTextChange}
              placeholder="resources"
              clearable={!!searchText}
              value={searchText}
              autoFocus={false}
            />
          </div>
          {isLoading && <LoadingSpinner color="#008CFF" />}
          {!isLoading && (
            <div className="cx-overflow-y-scroll cx-max-h-300px">
              {!!displayResources.length && displayResources.map(item => {
                return (
                  <div className="cx-flex cx-items-center cx-my-2 cx-w-1/2" key={item.id}>
                    <FormInputElement
                      id={item.id}
                      className="cx-mr-4"
                      type="checkbox"
                      checked={selectedResources.some(({ id }) => id === item.id)}
                      onChange={onSelectResource(item)}
                    />
                    <div
                      className={classnames('cx-flex cx-items-center cx-p-2 cx-shadow-sm cx-w-full', {
                        'cx-bg-neutral-200': !item.isSuggested
                      })}
                    >
                      <Avatar name={item.name} imageUrl={item.avatarUrl || ''} />
                      <div className="cx-pl-4">
                        <div>{item.name}</div>
                        <div className="cx-text-neutral-700">{item.category}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!isLoading && !displayResources.length && (
                <div className="cx-py-2">No resources found.</div>
              )}
            </div>
          )}
        </div>
        <div className="cx-px-2 cx-pt-4 cx-pb-1 cx-border-t cx-border-neutral-300 cx-flex cx-items-center">
          <Icon name="resource" className="cx-text-neutral-700 cx-mr-4" />
          <span>{selectedResources.map(item => item.name).join(', ')}</span>
        </div>
      </div>
      <div className="cx-p-4 cx-text-right">
        <ButtonGroup>
          <Button buttonType="secondary" onClick={onClose}>Cancel</Button>
          <Button
            buttonType="primary"
            disabled={!selectedResources.length}
            onClick={onSave}
            loading={isReallocating}
          >
            Save
          </Button>
        </ButtonGroup>
      </div>
    </DynamicModal>
  )
}

export default memo(JobAllocationModal)
