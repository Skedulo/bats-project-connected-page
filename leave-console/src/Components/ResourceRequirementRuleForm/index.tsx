import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation, FormContext } from '@skedulo/sked-ui'
import ResourceRequirementRuleFormChildren from './FormChildren'
import { ResourceRequirementRule } from '../../Store/types/ResourceRequirementRule'

const ResourceRequirementRuleFormConfig = {
  jobType: { isRequired: 'Job type is required' },
  description: {},
  jobConstraints: {},
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
  const handleSubmit = React.useCallback(
    (form: FormContext<ResourceRequirementRule>) => {
      // let hasError = false
      // let validatedJobConstraints: IJobConstraint[] = []
      // if (jobConstraints.length) {
      //   validatedJobConstraints = jobConstraints.map((item, index) => {
      //     const jobId = item.dependentJobId || item.dependentJob?.id
      //     const duplicatedJobId = jobConstraints.find(
      //       (jc, jcIndex) =>
      //         (jc.dependentJobId || jc.dependentJob?.id) === jobId && jcIndex !== index && !jc.action && !item.action
      //     )
      //     if (!item.constraintType || !item.dependencyType || !jobId) {
      //       hasError = true
      //       return {
      //         ...item,
      //         error: 'Constraint is invalid',
      //       }
      //     }
      //     if (duplicatedJobId) {
      //       hasError = true
      //       return {
      //         ...item,
      //         error: 'Dependent job is duplicated',
      //       }
      //     }
      //     return item
      //   })
      // }
      // if (hasError) {
      //   setJobConstraints(validatedJobConstraints)
      //   return
      // }
      // const submitData = {
      //   ...jobTemplate,
      //   ...form.fields,
      //   jobConstraints: jobConstraints.map(item =>
      //     omit(['tempId', 'error', 'sObjectType', 'projectJobTemplateId'], item)
      //   ),
      // }
      // onSubmit(submitData)
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
