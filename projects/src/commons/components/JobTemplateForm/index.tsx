import * as React from 'react'
import { format, isDate } from 'date-fns'
import { isEmpty } from 'lodash'
import { SkedFormChildren, SkedFormValidation } from '@skedulo/sked-ui'
import JobTemplateFormChildren from './JobTemplateFormChildren'
import { DATE_FORMAT } from '../../constants'
import { parseTimeValue, parseTimeString } from '../../utils'
import { IJobTemplateDetail } from '../../types/jobTemplate'

const JobTemplateFormConfig = {
  templateId: {},
  //templateId: { isRequired: 'Template is required' },
  jobTemplateName: {
    isRequired: 'Name is required',
    // isMaxLength: {
    //   length: 80,
    //   message: 'Max length is 80'
    // }
  },
  jobTemplateDescription: {
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

interface JobTemplateFormProps {
  jobTemplate?: IJobTemplateDetail
  onSubmit: (jobTemplate: IJobTemplateDetail) => void
  onCancel?: () => void
}

const JobTemplateForm: React.FC<JobTemplateFormProps> = ({ jobTemplate, onSubmit, onCancel }) => {
  const [timeError, setTimeError] = React.useState<string>('')
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IJobTemplateDetail>) => {
      if (timeError) {
        return
      }
      const submitData = {
        ...jobTemplate,
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
    [jobTemplate]
  )

  return (
    <SkedFormValidation
      config={JobTemplateFormConfig}
      options={{ clickToEdit: !!jobTemplate?.id }}
      onSubmit={handleSubmit}
      initialValues={jobTemplate || {}}
    >
      {(formParams: SkedFormChildren<IJobTemplateDetail>) => (
        <JobTemplateFormChildren
          formParams={formParams}
          onCancel={onCancel}
          jobTemplate={jobTemplate}
          timeError={timeError}
          setTimeError={setTimeError}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(JobTemplateForm)
