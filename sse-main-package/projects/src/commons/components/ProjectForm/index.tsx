import * as React from 'react'
import { format, isDate } from 'date-fns'
import { isEmpty, omit } from 'lodash'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import { IProjectDetail } from '../../../commons/types'
import ProjectFormChildren from './ProjectFormChildren'
import { DATE_FORMAT } from '../../constants'
import { parseTimeValue, parseTimeString } from '../../utils'

const ProjectFormConfig = {
  template: {},
  projectName: {
    isRequired: 'Name is required'
  },
  projectDescription: {},
  // accountId: {},
  applyAccountForAllJob: {},
  // contactId: { },
  applyContactForAllJob: {},
  // regionId: { isRequired: 'Region is required' },
  applyRegionForAllJob: {},
  // locationId: {},
  applyLocationForAllJob: {},
  startDate: {},
  startTime: {},
  endDate: {},
  endTime: {},
  isTemplate: {},
  account: {},
  contact: {},
  region: { isRequired: 'Region is required' },
  location: {},
  promisCode: {},
  simsCode: {},
  projectCode: {},
  jobRequestor: {}
}

interface IProjectFormProps {
  project?: IProjectDetail
  onSubmit: (project: IProjectDetail) => void
  onCancel?: () => void
}

const ProjectForm: React.FC<IProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IProjectDetail>) => {
      if (form.fields.isTemplate) {
        const errors: Record<string, string> = {}

        if (!form.fields.jobRequestor && !project?.jobRequestor) {
          errors.jobRequestor = 'Job Requestor is required.'
        }

        if (!form.fields.projectCode) {
          errors.projectCode = 'Project Code is required.'
        }

        setValidationErrors(errors)

        if (!isEmpty(errors)) {
          return
        }
      }

      const submitData = {
        ...project,
        ...form.fields,
        isTemplate: !!form.fields.isTemplate,
        accountId: form.fields.account?.id,
        contactId: form.fields.contact?.id,
        regionId: form.fields.region?.id,
        locationId: form.fields.location?.id,
        templateId: form.fields.template?.id,
        account: { id: form.fields.account?.id, name: form.fields.account?.name },
        contact: { id: form.fields.contact?.id, name: form.fields.contact?.name },
        region: { id: form.fields.region?.id, name: form.fields.region?.name },
        location: { id: form.fields.location?.id, name: form.fields.location?.name },
        jobRequestor: form.fields.jobRequestor || project?.jobRequestor,
        applyAccountForAllJob: !!form.fields.applyAccountForAllJob,
        applyContactForAllJob: !!form.fields.applyContactForAllJob,
        applyRegionForAllJob: !!form.fields.applyRegionForAllJob,
        applyLocationForAllJob: !!form.fields.applyLocationForAllJob,
        startDate: isDate(form.fields.startDate) ? format(form.fields.startDate, DATE_FORMAT) : form.fields.startDate,
        endDate: isDate(form.fields.endDate) ? format(form.fields.endDate, DATE_FORMAT) : form.fields.endDate,
        startTime: form.fields.startTime ? parseTimeString(form.fields.startTime) : '',
        endTime: form.fields.endTime ? parseTimeString(form.fields.endTime) : ''
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
      {(formParams: SkedFormChildren<IProjectDetail>) => (
        <ProjectFormChildren
          formParams={formParams}
          onCancel={onCancel}
          project={project}
          validationErrors={validationErrors}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(ProjectForm)
