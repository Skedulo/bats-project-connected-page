import React, { useState, useCallback, ReactText, useMemo } from 'react'
import {
  SkedFormChildren,
  Button,
  FormLabel,
  FormElementWrapper,
  NumberInput,
  AsyncSearchSelect,
  ISelectItem,
  AsyncMultiSearchSelect,
  ButtonGroup
} from '@skedulo/sked-ui'
import { toNumber, times, uniqBy } from 'lodash'
import classnames from 'classnames'

import { Team, TeamRequirement } from '../../../types'
import { fetchGenericOptions } from '../../../../Services/DataServices'
import { DEFAULT_PALETTE_COLORS } from '../../../constants'

import WrappedFormInput from '../../WrappedFormInput'
import ColorPicker from '../../ColorPicker'

interface TeamChildrenProps {
  formParams: SkedFormChildren<Team>
  onCancel?: () => void
  team?: Team
  teamRequirements: TeamRequirement[]
  setTeamRequirements: React.Dispatch<React.SetStateAction<TeamRequirement[]>>
  toggleConfirmModal: () => void
}

const TeamChildren: React.FC<TeamChildrenProps> = ({
  formParams,
  onCancel,
  team,
  teamRequirements,
  setTeamRequirements,
  toggleConfirmModal
}) => {
  const { fields, resetFieldsToInitialValues, errors, submitted, customFieldUpdate } = formParams
  const [requiredPeople, setRequiredPeople] = useState<number>(teamRequirements.length)
  const [paletteColors, setPaletteColors] = useState(DEFAULT_PALETTE_COLORS)
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
    const newTeamRequirements = teamRequirements.length > numOfPeople
      ? teamRequirements.slice(0, numOfPeople)
      : [...teamRequirements, ...Array(numOfPeople - teamRequirements.length).fill({ tags: [], preferredResourceId: '' })]
    setRequiredPeople(numOfPeople)
    setTeamRequirements(() => {
      return newTeamRequirements
    })
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

  const onTagsSelect = useCallback((index: number) => (selectedItems: ISelectItem[]) => {
    const selectedTags = uniqBy(selectedItems, item => item.value)
    setTeamRequirements((prev: TeamRequirement[]) => prev.map((item, arrIndex) => {
      if (index !== arrIndex) {
        return item
      }
      return {
        ...item,
        tags: selectedTags.map(item => ({ name: item.label, tagId: item.value })),
        preferredResource: undefined,
        preferredResourceId: ''
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

  const onNewColor = useCallback(
    (color: string | null) => {
      if (color && !paletteColors.includes(color)) {
        setPaletteColors([...paletteColors, color])
      }
    },
    [paletteColors]
  )

  const onSelectColor = useCallback((color: string) => {
    customFieldUpdate('teamColour')(color)
  }, [])

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
              initialSelectedItem={
                team?.region ? { value: team.region.id, label: team.region.name } : undefined
              }
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
            <NumberInput
              value={requiredPeople}
              onValueChange={handleChangeRequiredPeople}
              min={team?.teamRequirements?.length || 2}
              max={20}
            />
          </FormElementWrapper>
        </div>

        <div className="cx-mb-4">
          <FormLabel>Team Colour</FormLabel>
          <ColorPicker
            onColorSelect={onSelectColor}
            onNewColor={onNewColor}
            colors={paletteColors}
            selectedColor={fields.teamColour || DEFAULT_PALETTE_COLORS[0]}
          />
        </div>

        <h3 className="cx-font-semibold cx-mb-4">Team members</h3>
        {times(requiredPeople, index => {
          // if (![teamRequirements[index]]) {
          //   return <div key={`team-member-${index}`} />
          // }
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
                    initialSelectedItems={teamRequirements[index]?.tags?.map(item => ({ value: item.tagId || '', label: item.name || '' }))}
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
                    initialSelectedItem={teamRequirements[index]?.preferredResource ? { value: teamRequirements[index]?.preferredResource?.id || '', label: teamRequirements[index]?.preferredResource?.name || '' } : undefined}
                    onSelectedItemChange={onResourceSelect(index)}
                    useCache={false}
                  />
                </FormElementWrapper>
              </div>
            </div>
          )
        })}
      </div>
      <div
        className={classnames('cx-flex cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky', {
          'cx-justify-end': !team?.id,
          'cx-justify-between': team?.id
        })}
      >
        {team?.id && (
          <Button buttonType="secondary" onClick={toggleConfirmModal}>
            Deactivate
          </Button>
        )}
        <ButtonGroup>
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
        </ButtonGroup>
      </div>
    </>
  )
}

export default React.memo(TeamChildren)
