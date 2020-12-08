import * as React from 'react'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import JobTemplateFormChildren from './JobTemplateFormChildren'
import { IJobTemplate } from '../../../types'

const JobTemplateFormConfig = {
  jobType: { isRequired: 'Job type is required' },
  duration: { isRequired: 'Duration is required' },
  description: {},
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
  projectRegionId,
  onDelete
}) => {
  const handleDelete = React.useCallback(() => {
    if (jobTemplate?.id) {
      onDelete(jobTemplate.id)
    }
  }, [jobTemplate])

  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IJobTemplate>) => {
      const submitData = {
        ...jobTemplate,
        ...form.fields,
      }
      onSubmit(submitData)
    },
    [jobTemplate]
  )

  return (
    <SkedFormValidation
      config={JobTemplateFormConfig}
      options={{ clickToEdit: false }}
      onSubmit={handleSubmit}
      initialValues={jobTemplate || {}}
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
