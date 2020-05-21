import * as React from 'react'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import { ProjectDetailInterface } from '../../../commons/types'
import ProjectFormChildren from './ProjectFormChildren'

const ProjectFormConfig = {
  templateId: { isRequired: 'Template is required' },
  projectName: { isRequired: 'Name is required' },
  projectDescription: {},
  accountId: { isRequired: 'Account is required' },
  applyAccountForAllJob: {},
  contactId: { isRequired: 'Contact is required' },
  applyContactForAllJob: {},
  regionId: { isRequired: 'Region is required' },
  applyRegionForAllJob: {},
  location: {},
  applyLocationForAllJob: {},
}

interface ProjectFormProps {
  project?: ProjectDetailInterface
  onSubmit: (project: ProjectDetailInterface) => void
  onCancel?: () => void
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<ProjectDetailInterface>) => {
      const submitData = { ...project, ...form.fields }
      onSubmit(submitData)
    },
    [project]
  )

  return (
    <SkedFormValidation
      config={ProjectFormConfig}
      options={{ clickToEdit: !!project?.id }}
      onSubmit={handleSubmit}
      initialValues={project || {}}
    >
      {(formParams: SkedFormChildren<ProjectDetailInterface>) => (
        <ProjectFormChildren formParams={formParams} onCancel={onCancel} />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(ProjectForm)
