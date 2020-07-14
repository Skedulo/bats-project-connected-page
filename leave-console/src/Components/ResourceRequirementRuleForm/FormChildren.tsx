import * as React from 'react'
import { useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  AsyncSearchSelect,
  Icon,
  Datepicker,
  SearchSelect,
  NumberInput,
  FormLabel,
} from '@skedulo/sked-ui'
import { isDate, isAfter } from 'date-fns'
import WrappedFormInput from '../WrappedFormInput'
import { ResourceRequirementRule, IGenericSelectItem, IBaseModel, State } from '../../Store/types'
import { fetchGenericOptions, fetchDepotOptions } from '../../Services/DataServices'
import { DATE_FORMAT, WEEKDAYS } from '../../common/constants'

interface IFormChildrenProps {
  formParams: SkedFormChildren<ResourceRequirementRule>
  onCancel?: () => void
  rule: ResourceRequirementRule | null
}

const FormChildren: React.FC<IFormChildrenProps> = ({
  formParams,
  onCancel,
  rule
}) => {
  const { coreSkills, categories } = useSelector((state: State) => ({
    coreSkills: state.configs?.coreSkills || [],
    categories: state.configs?.resourceCategories || [],
  }))

  const [selectedOption, setSelectedOption] = React.useState<IGenericSelectItem | null>(null)

  const coreSkillOptions = React.useMemo(() => {
    return coreSkills.map(item => ({ value: item.id, label: item.name }))
  }, [coreSkills])

  const categoryOptions = React.useMemo(() => {
    return categories.map(item => ({ value: item.id, label: item.name }))
  }, [categories])

  const { fields, customFieldUpdate, errors, submitted, isFormReadonly } = formParams

  const startDate = React.useMemo(() => {
    if (!fields.startDate || isDate(fields.startDate)) {
      return fields.startDate
    }
    return new Date(fields.startDate)
  }, [fields.startDate])

  const endDate = React.useMemo(() => {
    if (!fields.endDate || isDate(fields.endDate)) {
      return fields.endDate
    }
    return new Date(fields.endDate)
  }, [fields.endDate])

  const handleFetchRegions = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'sked__Region__c'
      })
    },
    []
  )

  const handleFetchLocations = React.useCallback(
    async (searchTerm: string) => {
      const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Location__c' })
      return res.filter(item => item.isDepot)
    },
    [fields.region]
  )

  const onSelectLookupField = React.useCallback(
    (fieldName: keyof ResourceRequirementRule) => (selectedItem: IGenericSelectItem) => {
      if (selectedItem) {
        customFieldUpdate(fieldName)({ ...selectedItem, id: selectedItem.value, name: selectedItem.label })
      } else {
        customFieldUpdate(fieldName)('')
      }
      setSelectedOption({ ...selectedItem, fieldName })
    },
    [customFieldUpdate, fields]
  )

  const onSelectDate = React.useCallback(
    (fieldName: keyof ResourceRequirementRule) => (value: Date) => {
      if (fieldName === 'endDate' && (isAfter(value, startDate))) {
        customFieldUpdate(fieldName)(value)
      }
      if (fieldName === 'startDate') {
        customFieldUpdate(fieldName)(value)
      }
    },
    [startDate, endDate]
  )

  const onNumberResourcesChange = React.useCallback(
    (value: React.ReactText) => {
      customFieldUpdate('numberOfResources')(toNumber(value))
    },
    [startDate, endDate]
  )

  React.useEffect(() => {
    if (selectedOption?.fieldName === 'region' &&
      fields.depot?.id &&
      fields.depot?.id !== selectedOption?.value
    ) {
      customFieldUpdate('depot')(undefined)
    }
    if (selectedOption?.fieldName === 'depot' &&
      fields.region?.id && selectedOption?.region &&
      fields.region?.id !== selectedOption?.region?.id
    ) {
      customFieldUpdate('region')(selectedOption?.region)
    }
  }, [selectedOption, fields.depot])

  return (
    <>
      <div className="vertical-panel cx-p-4">
        <WrappedFormInput
          className="cx-mb-4"
          label="Description"
          isReadOnly={isFormReadonly}
          value={rule?.description || ''}
          isRequired={true}
          name="description"
          type="textarea"
        />
        <div className="cx-mb-4">
          <FormLabel status="required">Region</FormLabel>
          <FormElementWrapper
            className="cx-mt-1"
            name="regionId"
            validation={{ isValid: submitted ? !errors.regionId : true, error: submitted ? errors.regionId : '' }}
            readOnlyValue={rule?.region?.name || ''}
            isReadOnly={isFormReadonly}
          >
            <AsyncSearchSelect
              name="regionId"
              fetchItems={handleFetchRegions}
              debounceTime={300}
              onSelectedItemChange={onSelectLookupField('region')}
              initialSelectedItem={
                rule?.region ? { value: rule.region.id, label: rule.region.name } : undefined
              }
              useCache={true}
              placeholder="Search region..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4">
            <FormLabel>Start date</FormLabel>
            <FormElementWrapper
              className="cx-relative cx-mt-1"
              name="startDate"
              readOnlyValue={rule?.startDate}
              isReadOnly={isFormReadonly}
            >
              <div className="cx-absolute cx-inset-y-0 cx-right-0 cx-flex cx-items-center cx-p-2">
                <Icon name="calendar" size={18} className="cx-text-neutral-500" />
              </div>
              <Datepicker
                selected={startDate}
                onChange={onSelectDate('startDate')}
                dateFormat={DATE_FORMAT}
                disabled={isFormReadonly}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-ml-4">
            <FormLabel>End date</FormLabel>
            <FormElementWrapper
              className="cx-relative cx-mt-1"
              name="endDate"
              readOnlyValue={rule?.endDate}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: submitted ? !errors.endDate : true,
                error: submitted ? errors.endDate : '',
              }}
            >
              <div className="cx-absolute cx-inset-y-0 cx-right-0 cx-flex cx-items-center cx-p-2">
                <Icon name="calendar" size={18} className="cx-text-neutral-500" />
              </div>
              <Datepicker
                selected={endDate}
                onChange={onSelectDate('endDate')}
                dateFormat={DATE_FORMAT}
                disabled={isFormReadonly}
              />
            </FormElementWrapper>
          </div>
        </div>
        <div className="cx-flex cx-justify-start">
          {WEEKDAYS.map(item => (
            <div key={item.value} className="cx-flex cx-flex-col cx-mr-2">
              <label className="cx-mb-1">{item.label}</label>
              <WrappedFormInput
                name={item.value}
                type="checkbox"
                isReadOnly={isFormReadonly}
                label=""
                value={fields[item.value]}
                isRequired={false}
              />
            </div>
          ))}
        </div>
        <div className="cx-mb-4">
          <FormLabel>Category</FormLabel>
          <FormElementWrapper
            className="cx-mt-1"
            name="category"
            readOnlyValue={rule?.category || ''}
            isReadOnly={isFormReadonly}
          >
            <SearchSelect
              name="categoryId"
              onSelectedItemChange={onSelectLookupField('category')}
              initialSelectedItem={
                rule?.category ? { value: rule.category, label: rule.category } : undefined
              }
              items={categoryOptions}
              placeholder="Search category..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <div className="cx-mb-4">
          <FormLabel>Core skill</FormLabel>
          <FormElementWrapper
            className="cx-mt-1"
            name="coreSkill"
            readOnlyValue={rule?.coreSkill}
            isReadOnly={isFormReadonly}
          >
            <SearchSelect
              name="coreSkill"
              items={coreSkillOptions}
              onSelectedItemChange={onSelectLookupField('coreSkill')}
              initialSelectedItem={
                rule?.coreSkill ? { value: rule.coreSkill, label: rule.coreSkill } : undefined
              }
              placeholder="Search core skill..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <div className="cx-mb-4">
          <FormLabel>Depot</FormLabel>
          <FormElementWrapper
            className="cx-mt-1"
            name="depotId"
            readOnlyValue={rule?.depot?.name || ''}
            isReadOnly={isFormReadonly}
          >
            <AsyncSearchSelect
              name="depotId"
              fetchItems={handleFetchLocations}
              key={`${fields.region?.id}${fields.depot?.id}`}
              debounceTime={300}
              onSelectedItemChange={onSelectLookupField('depot')}
              selectedItem={fields?.depot ? { value: fields.depot.id, label: fields.depot.name } : undefined}
              useCache={false}
              placeholder="Search depot..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <div className="cx-mb-4 cx-w-1/2">
          <FormLabel status="required">Minimum resources</FormLabel>
          <FormElementWrapper
            className="cx-mt-1"
            name="numberOfResources"
            readOnlyValue={(rule?.numberOfResources || 0).toString()}
            validation={{ isValid: submitted ? !errors.numberOfResources : true, error: submitted ? errors.numberOfResources : '' }}
            isReadOnly={isFormReadonly}
          >
            <NumberInput min={1} value={fields.numberOfResources} onValueChange={onNumberResourcesChange} />
          </FormElementWrapper>
        </div>
      </div>
      <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
        <Button buttonType="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button buttonType="primary" className="cx-ml-2" type="submit">
          Save
        </Button>
      </div>
    </>
  )
}

export default React.memo(FormChildren)
