import React, { useState, useCallback, ReactText, useMemo } from 'react'
import {
  SkedFormChildren,
  Button,
  FormLabel,
  FormElementWrapper,
  NumberInput,
  AsyncSearchSelect,
  ISelectItem,
  AsyncMultiSearchSelect
} from '@skedulo/sked-ui'
import { toNumber, times } from 'lodash'

import { Team, TeamRequirement } from '../../../types'
import { fetchGenericOptions } from '../../../../Services/DataServices'

import WrappedFormInput from '../../WrappedFormInput'

interface TeamChildrenProps {
  formParams: SkedFormChildren<Team>
  onCancel?: () => void
  team?: Team
  teamRequirements: TeamRequirement[]
  setTeamRequirements: React.Dispatch<React.SetStateAction<TeamRequirement[]>>
}

const TeamChildren: React.FC<TeamChildrenProps> = ({
  formParams,
  onCancel,
  teamRequirements,
  setTeamRequirements
}) => {
  const { fields, resetFieldsToInitialValues, errors, submitted, customFieldUpdate } = formParams
  const [requiredPeople, setRequiredPeople] = useState<number>(2)

  const isReadonly = false
  const { selectedRequiredTags, selectedPreferredResource } = useMemo(() => {
    const tags: string[] = []
    let resources: string[] = []
    teamRequirements.forEach(item => {
      if (item.tags?.length) {
        item.tags.forEach(item => {
          if (item.tagId) {
            tags.push(item.tagId)
          }
        })
      }
      resources = item.preferredResourceId ? [...resources, item.preferredResourceId] : resources
    })
    return { selectedRequiredTags: tags, selectedPreferredResource: resources }
  }, [teamRequirements])

  const handleCancel = useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    // resetFieldsToInitialValues()
  }, [onCancel, resetFieldsToInitialValues])

  const handleChangeRequiredPeople = useCallback((value: ReactText) => {
    const numOfPeople = toNumber(value)
    setRequiredPeople(numOfPeople)
    const newTeamRequirements = teamRequirements.length > numOfPeople
      ? teamRequirements.slice(0, numOfPeople)
      : [...teamRequirements, { tags: [], preferredResourceId: '' }]
    setTeamRequirements(newTeamRequirements)
  }, [teamRequirements, setTeamRequirements])

  const fetchRegions = useCallback(async (input: string) => {
    return await fetchGenericOptions({ sObjectType: 'sked__Region__c', name: input })
  }, [])

  const fetchTags = useCallback(async (input: string) => {
    return await fetchGenericOptions({ sObjectType: 'sked__Tag__c', name: input })
  }, [])

  const fetchResources = useCallback((index: number) => async (input: string) => {
    const res = await fetchGenericOptions({
      sObjectType: 'sked__Resource__c',
      name: input,
      regionIds: fields.regionId,
      tagIds: teamRequirements[index].tags?.map(tag => tag.tagId).join(',')
    })
    return res?.filter(item => !selectedPreferredResource.includes(item.value)) || []
  }, [fields.regionId, teamRequirements])

  const onRegionSelect = useCallback((selectedRegion: ISelectItem) => {
    customFieldUpdate('regionId')(selectedRegion?.value || '')
    setTeamRequirements(prev => prev.map(item => ({ ...item, preferredResource: undefined, preferredResourceId: '' })))
  }, [])

  const onTagsSelect = useCallback((index: number) => (selectedTags: ISelectItem[]) => {
    setTeamRequirements((prev: TeamRequirement[]) => prev.map((item, arrIndex) => {
      if (index !== arrIndex) {
        return item
      }
      return {
        ...item,
        tags: selectedTags.map(item => ({ name: item.label, tagId: item.value }))
      }
    }))
  }, [teamRequirements, setTeamRequirements])

  const onResourceSelect = useCallback((index: number) => (selectedResource: ISelectItem) => {
    setTeamRequirements((prev: TeamRequirement[]) => prev.map((item, arrIndex) => {
      if (index !== arrIndex) {
        return item
      }
      return {
        ...item,
        preferredResourceId: selectedResource?.value || '',
        preferredResource: selectedResource ? {
          id: selectedResource.value,
          name: selectedResource.label
        } : undefined
      }
    }))
  }, [teamRequirements, setTeamRequirements])

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
                    key={selectedRequiredTags.join(',')}
                    initialSelectedItems={teamRequirements[index].tags?.map(item => ({ value: item.tagId || '', label: item.name || '' }))}
                    useCache={false}
                  />
                </FormElementWrapper>
              </div>
              <div className="cx-mb-4 cx-w-1/2">
                <FormLabel>Preferred Resource</FormLabel>
                <FormElementWrapper>
                  <AsyncSearchSelect
                    id="preferredResource"
                    name="preferredResource"
                    fetchItems={fetchResources(index)}
                    key={`${selectedPreferredResource.join(',')}-${fields.regionId}-${selectedRequiredTags.join(',')}`}
                    initialSelectedItem={teamRequirements[index].preferredResource ? { value: teamRequirements[index].preferredResource?.id || '', label: teamRequirements[index].preferredResource?.name || '' } : undefined}
                    onSelectedItemChange={onResourceSelect(index)}
                    useCache={false}
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

export default React.memo(TeamChildren)
