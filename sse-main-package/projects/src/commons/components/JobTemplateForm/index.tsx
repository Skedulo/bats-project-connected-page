import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation, ISelectItem } from '@skedulo/sked-ui'
import JobTemplateFormChildren from './JobTemplateFormChildren'
import { IJobTemplate, IJobConstraint } from '../../types'

const JobTemplateFormConfig = {
  jobType: { isRequired: 'Job type is required' },
  description: {},
  jobConstraints: {},
  resourceId: {}
}

interface IJobTemplateFormProps {
  jobTemplate: IJobTemplate | null
  onSubmit: (jobTemplate: IJobTemplate) => void
  onCancel?: () => void
  totalJobTemplates: number
  projectId: string
  projectRegionId: string
  onDelete: (id: string) => void
}

const JobTemplateForm: React.FC<IJobTemplateFormProps> = ({
  jobTemplate,
  onSubmit,
  onCancel,
  totalJobTemplates,
  projectId,
  projectRegionId,
  onDelete
}) => {
  const [jobConstraints, setJobConstraints] = React.useState<IJobConstraint[]>(jobTemplate?.jobConstraints || [])
  const handleDelete = React.useCallback(() => {
    if (jobTemplate?.id) {
      onDelete(jobTemplate.id)
    }
  }, [jobTemplate])

  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IJobTemplate>) => {
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
      const submitData = {
        ...jobTemplate,
        ...form.fields,
        // jobConstraints: jobConstraints.map(item =>
        //   omit(['tempId', 'error', 'sObjectType', 'projectJobTemplateId'], item)
        // ),
      }
      onSubmit(submitData)
    },
    [jobTemplate, jobConstraints]
  )

  return (
    <SkedFormValidation
      config={JobTemplateFormConfig}
      options={{ clickToEdit: false }}
      onSubmit={handleSubmit}
      initialValues={jobTemplate || { jobConstraints: [] }}
    >
      {(formParams: SkedFormChildren<IJobTemplate>) => (
        <JobTemplateFormChildren
          formParams={formParams}
          onCancel={onCancel}
          jobTemplate={jobTemplate}
          projectRegionId={projectRegionId}
          onDelete={handleDelete}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(JobTemplateForm)
