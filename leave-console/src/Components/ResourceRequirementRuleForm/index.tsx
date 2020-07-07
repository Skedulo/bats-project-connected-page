import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import ResourceRequirementRuleFormChildren from './FormChildren'
import { ResourceRequirementRule, IBaseModel } from '../../Store/types/ResourceRequirementRule'
import { isDate, format } from 'date-fns'
import { DATE_FORMAT } from '../../common/constants'

const ResourceRequirementRuleFormConfig = {
  region: { isRequired: 'Region is required' },
  startDate: {},
  endDate: {},
  coreSkill: {},
  depot: {},
  numberOfResources: { isRequired: { message: 'Number of resources is required' } }
}

interface IResourceRequirementRuleFormProps {
  rule: ResourceRequirementRule | null
  onSubmit: (rule: ResourceRequirementRule) => void
  onCancel?: () => void
}

const ResourceRequirementRuleForm: React.FC<IResourceRequirementRuleFormProps> = ({
  rule,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = React.useCallback(form => {
    const submitData = {
      ...rule,
      ...form.fields,
      regionId: form.fields.region.id,
      region: { id: form.fields.region.id, name: form.fields.region.name },
      depotId: form.fields.depot?.id,
      depot: form.fields.depot ? { id: form.fields.depot?.id, name: form.fields.depot?.name } : undefined,
      startDate: isDate(form.fields.startDate) ? format(form.fields.startDate, DATE_FORMAT) : form.fields.startDate,
      endDate: isDate(form.fields.endDate) ? format(form.fields.endDate, DATE_FORMAT) : form.fields.endDate,
      coreSkill: form.fields.coreSkill.id
    }

    onSubmit(submitData)
  },
    [rule]
  )

  return (
    <SkedFormValidation
      config={ResourceRequirementRuleFormConfig}
      options={{ clickToEdit: false }}
      onSubmit={handleSubmit}
      initialValues={rule || undefined}
    >
      {(formParams: SkedFormChildren<ResourceRequirementRule>) => (
        <ResourceRequirementRuleFormChildren
          formParams={formParams}
          onCancel={onCancel}
          rule={rule}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(ResourceRequirementRuleForm)
