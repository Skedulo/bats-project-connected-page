import * as React from 'react'
import { format, isDate } from 'date-fns'
import { isEmpty } from 'lodash'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import { IProjectDetail } from '../../../commons/types'
import ProjectFormChildren from './ProjectFormChildren'
import { DATE_FORMAT } from '../../constants'
import { parseTimeValue, parseTimeString } from '../../utils'

const ProjectFormConfig = {
  templateId: {},
  projectName: {
    isRequired: 'Name is required'
  },
  projectDescription: {},
  accountId: {},
  applyAccountForAllJob: {},
  contactId: { },
  applyContactForAllJob: {},
  regionId: { isRequired: 'Region is required' },
  applyRegionForAllJob: {},
  locationId: {},
  applyLocationForAllJob: {},
  startDate: {},
  startTime: {},
  endDate: {},
  endTime: {},
  isTemplate: {},
}

interface IProjectFormProps {
  project?: IProjectDetail
  onSubmit: (project: IProjectDetail) => void
  onCancel?: () => void
}

const ProjectForm: React.FC<IProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [timeError, setTimeError] = React.useState<string>('')
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IProjectDetail>) => {
      if (timeError) {
        return
      }
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
          timeError={timeError}
          setTimeError={setTimeError}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(ProjectForm)
