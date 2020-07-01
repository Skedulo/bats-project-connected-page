import * as React from 'react'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  AsyncSearchSelect,
} from '@skedulo/sked-ui'
import { ResourceRequirementRule, IGenericSelectItem } from '../../Store/types'
import { fetchGenericOptions } from '../../Services/DataServices'

interface IFormChildrenProps {
  formParams: SkedFormChildren<ResourceRequirementRule>
  onCancel?: () => void
  rule: ResourceRequirementRule | null
}

const FormChildren: React.FC<IFormChildrenProps> = ({
  formParams,
  onCancel,
  rule,
}) => {
  const { fields, customFieldUpdate, errors, submitted, isFormReadonly } = formParams

  const handleFetchRegions = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'sked__Region__c'
      })
    },
    []
  )

  const onSelectLookupField = React.useCallback(
    (fieldName: keyof ResourceRequirementRule) => (selectedItem: IGenericSelectItem) => {
      if (selectedItem) {
        customFieldUpdate(fieldName)({ ...selectedItem, id: selectedItem.value, name: selectedItem.label })
      } else {
        customFieldUpdate(fieldName)('')
      }
    },
    [customFieldUpdate, fields]
  )

  return (
    <>
      <div className="vertical-panel cx-p-4">
        <div className="cx-mb-4">
          <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Region</span>
          <FormElementWrapper
            name="regionId"
            validation={{ isValid: submitted ? !errors.regionId : true, error: submitted ? errors.regionId : '' }}
            readOnlyValue={rule?.region?.name || ''}
            isReadOnly={isFormReadonly}
          >
            <AsyncSearchSelect
              name="regionId"
              fetchItems={handleFetchRegions}
              debounceTime={300}
              onSelectedItemChange={onSelectLookupField('regionId')}
              initialSelectedItem={
                rule?.region ? { value: rule.region.id, label: rule.region.name } : undefined
              }
              useCache={true}
              placeholder="Search region..."
              icon="chevronDown"
            />
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
