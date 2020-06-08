import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation, ISelectItem } from '@skedulo/sked-ui'
import JobTemplateFormChildren from './JobTemplateFormChildren'
import { IJobTemplate, IJobConstraint } from '../../types'

const JobTemplateFormConfig = {
  jobType: { isRequired: 'Job type is required' },
  description: {},
  jobConstraints: {},
}

interface IJobTemplateFormProps {
  jobTemplate: IJobTemplate | null
  onSubmit: (jobTemplate: IJobTemplate) => void
  onCancel?: () => void
  totalJobTemplates: number
  projectId: string
}

const JobTemplateForm: React.FC<IJobTemplateFormProps> = ({
  jobTemplate,
  onSubmit,
  onCancel,
  totalJobTemplates,
  projectId,
}) => {
  const [jobConstraints, setJobConstraints] = React.useState<IJobConstraint[]>(jobTemplate?.jobConstraints || [])
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IJobTemplate>) => {
      const submitData = {
        ...jobTemplate,
        ...form.fields,
        jobConstraints: jobConstraints.map((item) => omit('tempId', item)),
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
          jobConstraints={jobConstraints}
          setJobConstraints={setJobConstraints}
          totalJobTemplates={totalJobTemplates}
          projectId={projectId}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(JobTemplateForm)
