import * as React from 'react'
import { format, isDate } from 'date-fns'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import { ProjectDetailInterface } from '../../../commons/types'
import ProjectFormChildren from './ProjectFormChildren'
import { DATE_FORMAT } from '../../constants'

const ProjectFormConfig = {
  templateId: {},
  //templateId: { isRequired: 'Template is required' },
  projectName: { isRequired: 'Name is required' },
  projectDescription: {},
  accountId: {},
  // accountId: { isRequired: 'Account is required' },
  applyAccountForAllJob: {},
  contactId: { },
  applyContactForAllJob: {},
  regionId: { isRequired: 'Region is required' },
  applyRegionForAllJob: {},
  locationId: {},
  // locationId: { isRequired: 'Location is required' },
  // address: {},
  applyLocationForAllJob: {},
  startDate: {},
  // startDate: { isRequired: 'Start date is required' },
  // endDate: { isRequired: 'End date is required' },
  endDate: {},
  isTemplate: {},
}

interface ProjectFormProps {
  project?: ProjectDetailInterface
  onSubmit: (project: ProjectDetailInterface) => void
  onCancel?: () => void
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<ProjectDetailInterface>) => {
      const submitData = {
        ...project,
        ...form.fields,
        isTemplate: !!form.fields.isTemplate,
        applyAccountForAllJob: !!form.fields.applyAccountForAllJob,
        applyContactForAllJob: !!form.fields.applyContactForAllJob,
        applyRegionForAllJob: !!form.fields.applyRegionForAllJob,
        applyLocationForAllJob: !!form.fields.applyLocationForAllJob,
        startDate: isDate(form.fields.startDate) ? format(form.fields.startDate, DATE_FORMAT) : form.fields.startDate,
        endDate: isDate(form.fields.endDate) ? format(form.fields.endDate, DATE_FORMAT) : form.fields.endDate,
      }

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
        <ProjectFormChildren
          formParams={formParams}
          onCancel={onCancel}
          project={project}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(ProjectForm)
