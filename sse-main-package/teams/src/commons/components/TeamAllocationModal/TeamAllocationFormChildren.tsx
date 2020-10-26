import React, { useState, useCallback, ReactText, useMemo, useEffect } from 'react'
import { SkedFormChildren, Button, FormLabel, FormElementWrapper, NumberInput, AsyncSearchSelect, ISelectItem, AsyncMultiSearchSelect, SearchSelect } from '@skedulo/sked-ui'
import { toNumber, times, fill } from 'lodash'
import { useSelector } from 'react-redux'

import { Team, TeamRequirement, State, Resource } from '../../types'
import { fetchGenericOptions } from '../../../Services/DataServices'

import WrappedFormInput from '../WrappedFormInput'

interface TeamAllocationFormChildrenProps {
  formParams: SkedFormChildren<Team>
  onCancel?: () => void
  team?: Team
  teamRequirements: TeamRequirement[]
  handleChangeTeamRequirements: (newTeamRequirements: TeamRequirement[]) => void
}

const TeamAllocationFormChildren: React.FC<TeamAllocationFormChildrenProps> = ({
  formParams,
  onCancel,
  teamRequirements,
  handleChangeTeamRequirements
}) => {
  const storeResources = useSelector<State, Resource[]>(state => state.resources)
  const { fields, resetFieldsToInitialValues, errors, submitted, customFieldUpdate } = formParams
  const [requiredPeople, setRequiredPeople] = useState<number>(2)

  const isReadonly = false
  const { selectedRequiredTags, selectedPreferredResource} = useMemo(() => {
    let tags: string[] = []
    let resources: string[] = []
    teamRequirements.forEach(item => {
      if (item.tags?.length) {
        item.tags.forEach(tag => {
          if (tag.tagId) {
            tags.push(tag.tagId)
          }
        })
      }
      resources = item.preferredResourceId ? [...resources, item.preferredResourceId] : resources
    })
    return { selectedRequiredTags: tags, selectedPreferredResource: resources }
  }, [teamRequirements])

  const resourceOptions = useMemo(() => {
    return storeResources.map(item => ({ value: item.id, label: item.name }))
    // return storeResources.filter(item => !selectedPreferredResource.includes(item.id)).map(item => ({ value: item.id, label: item.name }))
  }, [storeResources, selectedPreferredResource])

  const handleCancel = useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    // resetFieldsToInitialValues()
  }, [onCancel, resetFieldsToInitialValues])

  const handleChangeRequiredPeople = useCallback((value: ReactText) => {
    const numOfPeople = toNumber(value)
    setRequiredPeople(numOfPeople)
    const newTeamRequirements = teamRequirements.length > numOfPeople ?
      teamRequirements.slice(0, numOfPeople) :
      [...teamRequirements, { tags: [], preferredResourceId: '' }]
    handleChangeTeamRequirements(newTeamRequirements)
  }, [teamRequirements, handleChangeTeamRequirements])

  const fetchRegions = useCallback((input: string) => {
    return fetchGenericOptions({ sObjectType: 'sked__Region__c', name: input })
  }, [])

  const fetchTags = useCallback((input: string) => {
    return fetchGenericOptions({ sObjectType: 'sked__Tag__c', name: input })
  }, [])

  const onRegionSelect = useCallback((selectedRegion: ISelectItem) => {
    customFieldUpdate('regionId')(selectedRegion?.value || '')
  }, [])

  const onTagsSelect = useCallback((index: number) => (selectedTags: ISelectItem[]) => {
    const requirement = { ...teamRequirements[index], tags: selectedTags.map(item => ({ tagId: item.value })) }
    const newTeamRequirements = fill(teamRequirements, requirement, index, index + 1)
    handleChangeTeamRequirements(newTeamRequirements)
  }, [teamRequirements, handleChangeTeamRequirements])

  const onResourceSelect = useCallback((index: number) => (selectedResource: ISelectItem) => {
    const requirement = { ...teamRequirements[index], preferredResourceId: selectedResource.value }
    const newTeamRequirements = fill(teamRequirements, requirement, index, index + 1)
    handleChangeTeamRequirements(newTeamRequirements)
  }, [teamRequirements, handleChangeTeamRequirements])

  useEffect(() => {
    console.log('change teamRequirements', teamRequirements);
  }, [teamRequirements])

  return (
    <>
      <div className="cx-p-4">
        <WrappedFormInput
          name="name"
          isReadOnly={isReadonly}
          label="Name"
          value={fields?.name}
          error={submitted ? errors?.name : ''}
          isRequired={true}
          maxLength={255}
        />

        <div className="cx-mb-4">
          <FormLabel status="required">Primary Region</FormLabel>
          <FormElementWrapper
            className="cx-w-200px"
            // readOnlyValue={fields.region?.name}
            isReadOnly={isReadonly}
            validation={{ isValid: !submitted ? true : !errors?.regionId, error: submitted ? errors?.regionId : '' }}
          >
            <AsyncSearchSelect
              id="region"
              name="region"
              fetchItems={fetchRegions}
              debounceTime={300}
              onSelectedItemChange={onRegionSelect}
              useCache={true}
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>

        <div className="cx-mb-4">
          <FormLabel status="required">How many people are required?</FormLabel>
          <FormElementWrapper
            className="cx-w-200px"
            readOnlyValue={requiredPeople.toString()}
            isReadOnly={isReadonly}
          >
            <NumberInput value={requiredPeople} onValueChange={handleChangeRequiredPeople} min={2} />
          </FormElementWrapper>
        </div>

        <h3 className="cx-font-semibold cx-mb-4">Team members</h3>
        {times(requiredPeople, index => {
          return (
            <div className="cx-flex cx-items-center" key={`team-member-${index}`}>
              <span className="cx-mx-4">{index + 1}</span>
              <div className="cx-mb-4 cx-mr-4 cx-w-1/2">
                <FormLabel status="optional">Tag required</FormLabel>
                <FormElementWrapper>
                  <AsyncMultiSearchSelect
                    id="tags"
                    name="tags"
                    fetchItems={fetchTags}
                    debounceTime={300}
                    onSelectedItemsChange={onTagsSelect(index)}
                    useCache={true}
                  />
                </FormElementWrapper>
              </div>
              <div className="cx-mb-4 cx-w-1/2">
                <FormLabel>Preferred Resource</FormLabel>
                <FormElementWrapper>
                  <SearchSelect
                    id="preferredResource"
                    name="preferredResource"
                    items={resourceOptions}
                    // key={selectedPreferredResource.join(',')}
                    onSelectedItemChange={onResourceSelect(index)}
                  />
                </FormElementWrapper>
              </div>
            </div>
          )
        })}
      </div>
      <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
        <Button buttonType="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          className="cx-ml-2"
          type="submit"
          disabled={isReadonly}
        >
          Save
        </Button>
      </div>
    </>
  )
}

export default React.memo(TeamAllocationFormChildren)
