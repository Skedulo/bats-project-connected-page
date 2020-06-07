import * as React from 'react'
import { isDate, isAfter, isSameDay, isEqual } from 'date-fns'
import { SkedFormChildren, Button, FormElementWrapper, Datepicker, Icon } from '@skedulo/sked-ui'
import LookupInput from '../LookupInput'
import WrappedFormInput from '../WrappedFormInput'
import TimePicker from '../TimePicker'
import {
  fetchAccounts,
  fetchContacts,
  fetchRegions,
  fetchLocations,
  fetchTemplates,
} from '../../../Services/DataServices'
import { ILookupOption, ITimePickerOption } from '../../types'
import { DATE_FORMAT } from '../../constants'
import { AppContext } from '../../../App'
import { IJobTemplateDetail } from '../../types/jobTemplate'

interface JobTemplateFormChildrenProps {
  formParams: SkedFormChildren<IJobTemplateDetail>
  onCancel?: () => void
  jobTemplate?: IJobTemplateDetail
  timeError: string
  setTimeError: React.Dispatch<string>
}

const JobTemplateFormChildren: React.FC<JobTemplateFormChildrenProps> = ({
  formParams,
  onCancel,
  jobTemplate,
  timeError,
  setTimeError,
}) => {
  const appContext = React.useContext(AppContext)
  const { objPermissions } = React.useMemo(() => appContext?.config || {}, [appContext])
  const isUpdate = React.useMemo(() => !!jobTemplate?.id, [jobTemplate?.id])
  const { fields, isFormReadonly, resetFieldsToInitialValues, customFieldUpdate, errors, submitted } = formParams


  const handleCancel = React.useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    resetFieldsToInitialValues()
  }, [onCancel])

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedOption: ILookupOption) => {
      customFieldUpdate(fieldName)(selectedOption.UID)
    },
    []
  )


  return (
    <>
      <div className="vertical-panel cx-p-4">
      <WrappedFormInput
          name="projectName"
          className="click-to-edit-custom"
          isReadOnly={isFormReadonly}
          label="Name"
          value={fields.projectName}
          error={submitted ? errors.projectName : ''}
          isRequired={true}
          maxLength={80}
        />
                    <FormElementWrapper
              name="regionId"
              validation={{ isValid: submitted ? !errors.regionId : true, error: errors.regionId }}
              readOnlyValue={project?.region?.name || ''}
              isReadOnly={isFormReadonly}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('regionId')}
                onSearchKeyword={fetchRegions}
                placeholderText="Search regions..."
                defaultSelected={project?.region ? { UID: project.region.id, Name: project.region.name } : null}
              />
            </FormElementWrapper>
        <WrappedFormInput
          name="projectDescription"
          className="click-to-edit-custom"
          type="textarea"
          rows={3}
          isReadOnly={isFormReadonly}
          label="Description"
          value={fields.projectDescription}
          error={submitted ? errors.projectDescription : ''}
          maxLength={255}
          isRequired={false}
        />
      </div>
      {!isFormReadonly && (
        <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
          <Button buttonType="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            className="cx-ml-2"
            type="submit"
          >
            Save
          </Button>
        </div>
      )}
    </>
  )
}

export default React.memo(JobTemplateFormChildren)
