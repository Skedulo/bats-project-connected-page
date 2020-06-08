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
  const { jobTypes } = React.useMemo(() => appContext?.config || {}, [appContext])
  const isUpdate = React.useMemo(() => !!jobTemplate?.id, [jobTemplate?.id])
  const { fields, isFormReadonly, resetFieldsToInitialValues, customFieldUpdate, errors, submitted } = formParams
  const shouldReadonly = isUpdate && jobTemplate?.canEdit === false ? true : isFormReadonly


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

  const fetchJobTypes = async (searchText: string): Promise<any> => {
    console.log(jobTypes);
    return jobTypes?.map(item=> { return {Name: item.name, UID: item.id}}).filter(item => item.Name?.toUpperCase().indexOf(searchText.toUpperCase()) > -1)
  }

  return (
    <>
     <div className="vertical-panel cx-p-4">
      <div className="cx-mb-4 click-to-edit-custom">
          <span className="span-label">Type</span>
          <FormElementWrapper
            name="type"
            validation={{ isValid: submitted ? !errors.jobType : true, error: submitted ? errors.type : '' }}
            readOnlyValue={jobTemplate?.jobType}
            isReadOnly={shouldReadonly}
          >
            <LookupInput
              className="form-element__outline"
              onSelect={onSelectLookupField('type')}
              onSearchKeyword={fetchJobTypes}
              placeholderText="Search type..."
            />
          </FormElementWrapper>
        </div>
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
