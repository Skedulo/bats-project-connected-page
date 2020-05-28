import * as React from 'react'
import { format, isDate } from 'date-fns'
import { isEmpty } from 'lodash'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import { ProjectDetailInterface } from '../../../commons/types'
import ProjectFormChildren from './ProjectFormChildren'
import { DATE_FORMAT } from '../../constants'
import { parseTimeValue, parseTimeString } from '../../utils'

const ProjectFormConfig = {
  templateId: {},
  //templateId: { isRequired: 'Template is required' },
  projectName: {
    isRequired: 'Name is required',
    // isMaxLength: {
    //   length: 80,
    //   message: 'Max length is 80'
    // }
  },
  projectDescription: {
    // isMaxLength: {
    //   length: 255,
    //   message: 'Max length is 255'
    // }
  },
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
  startTime: {},
  // startDate: { isRequired: 'Start date is required' },
  // endDate: { isRequired: 'End date is required' },
  endDate: {},
  endTime: {},
  isTemplate: {},
}

interface ProjectFormProps {
  project?: ProjectDetailInterface
  onSubmit: (project: ProjectDetailInterface) => void
  onCancel?: () => void
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [timeError, setTimeError] = React.useState<string>('')
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<ProjectDetailInterface>) => {
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
      {(formParams: SkedFormChildren<ProjectDetailInterface>) => (
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
