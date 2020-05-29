import * as React from 'react'
import { isDate, isAfter, isSameDay, isEqual } from 'date-fns'
import { SkedFormChildren, Button, FormElementWrapper, Datepicker, Icon } from '@skedulo/sked-ui'
import LookupInput from '../../../commons/components/LookupInput'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import TimePicker from '../../../commons/components/TimePicker'
import {
  fetchAccounts,
  fetchContacts,
  fetchRegions,
  fetchLocations,
  fetchTemplates,
} from '../../../Services/DataServices'
import { ProjectDetailInterface, LookupOptionInterface, TimePickerOptionInterface } from '../../../commons/types'
import { DATE_FORMAT } from '../../constants'
import { AppContext } from '../../../App'

interface ProjectFormChildrenProps {
  formParams: SkedFormChildren<ProjectDetailInterface>
  onCancel?: () => void
  project?: ProjectDetailInterface
  timeError: string
  setTimeError: React.Dispatch<string>
}

const ProjectFormChildren: React.FC<ProjectFormChildrenProps> = ({
  formParams,
  onCancel,
  project,
  timeError,
  setTimeError,
}) => {
  const appContext = React.useContext(AppContext)
  const { objPermissions } = React.useMemo(() => appContext?.config || {}, [appContext])
  const isUpdate = React.useMemo(() => !!project?.id, [project?.id])
  const { fields, isFormReadonly, resetFieldsToInitialValues, customFieldUpdate, errors, submitted } = formParams

  const isDisableDatetime = React.useMemo(() => !!(isUpdate && fields.isTemplate), [fields.isTemplate, isUpdate])

  const startDate = React.useMemo(() => {
    if (!fields.startDate || isDate(fields.startDate)) {
      return fields.startDate
    }
    return new Date(fields.startDate)
  }, [fields.startDate])

  const endDate = React.useMemo(() => {
    if (!fields.endDate || isDate(fields.endDate)) {
      return fields.endDate
    }
    return new Date(fields.endDate)
  }, [fields.endDate])

  const handleCancel = React.useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    resetFieldsToInitialValues()
  }, [onCancel])

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedOption: LookupOptionInterface) => {
      customFieldUpdate(fieldName)(selectedOption.UID)
    },
    []
  )

  const onSelectDate = React.useCallback(
    (fieldName: string) => (value: Date) => {
      // if (fieldName === 'endDate' && (isAfter(value, startDate))) {
      if (fieldName === 'endDate' && (isSameDay(value, startDate) || isAfter(value, startDate))) {
        customFieldUpdate(fieldName)(value)
        if (!value) {
          customFieldUpdate('endDate')(value)
        }
      }
      if (fieldName === 'startDate') {
        customFieldUpdate(fieldName)(value)
        if (!value) {
          customFieldUpdate('startTime')(value)
        }
      }
    },
    [startDate, endDate]
  )

  const onSelectTime = React.useCallback(
    (fieldName: string) => (timeOption: TimePickerOptionInterface) => {
      if (fieldName === 'endTime') {
        customFieldUpdate(fieldName)(timeOption.stringValue)
      }
      if (fieldName === 'startTime') {
        customFieldUpdate(fieldName)(timeOption.stringValue)
      }
    },
    [startDate, endDate]
  )

  React.useEffect(() => {
    if (
      (isEqual(startDate, endDate) && fields.startTime && fields.endTime && fields.endTime <= fields.startTime) ||
      (isEqual(startDate, endDate) && !fields.startTime && fields.endTime) ||
      (isEqual(startDate, endDate) && fields.startTime && !fields.endTime)
    ) {
      setTimeError('Start must be before End.')
    } else if (!!timeError) {
      setTimeError('')
    }
  }, [startDate, endDate, fields.startTime, fields.endTime, timeError])

  return (
    <>
      <div className="vertical-panel cx-p-4">
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Information</h1>}
        <div className="cx-mb-4 click-to-edit-custom">
          <span className="span-label">Template</span>
          <FormElementWrapper
            name="templateId"
            validation={{ isValid: submitted ? !errors.templateId : true, error: submitted ? errors.templateId : '' }}
            readOnlyValue={project?.template?.name || ''}
            isReadOnly={isFormReadonly}
          >
            <LookupInput
              className="form-element__outline"
              onSelect={onSelectLookupField('templateId')}
              onSearchKeyword={fetchTemplates}
              placeholderText="Search template..."
              defaultSelected={project?.template ? { UID: project.template.id, Name: project.template.name } : null}
            />
          </FormElementWrapper>
        </div>
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
        <div className="cx-mb-4 ">
          <WrappedFormInput
            name="isTemplate"
            className="click-to-edit-custom"
            type="checkbox"
            isReadOnly={false}
            disabled={isFormReadonly}
            label="Is Template"
            value={fields.isTemplate}
            isRequired={false}
          />
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 click-to-edit-custom">
            <span className="span-label">Start date</span>
            <FormElementWrapper
              className="cx-relative"
              name="startDate"
              readOnlyValue={fields.startDate}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: submitted ? !errors.startDate : true,
                error: submitted ? errors.startDate : '',
              }}
            >
              <div className="cx-absolute cx-inset-y-0 cx-left-0 cx-flex cx-items-center cx-p-2">
                <Icon name="calendar" size={18} className="cx-text-neutral-500" />
              </div>
              <Datepicker
                selected={startDate}
                onChange={onSelectDate('startDate')}
                dateFormat={DATE_FORMAT}
                disabled={isDisableDatetime}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-ml-4 click-to-edit-custom">
            <span className="span-label">Start time</span>
            <FormElementWrapper
              name="startTime"
              readOnlyValue={project?.startTime || ''}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: !timeError,
              }}
            >
              <TimePicker
                onSelect={onSelectTime('startTime')}
                defaultSelected={project?.startTime}
                disabled={!fields.startDate || isDisableDatetime}
              />
            </FormElementWrapper>
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 click-to-edit-custom">
            <span className="span-label">End date</span>
            <FormElementWrapper
              className="cx-relative"
              name="endDate"
              readOnlyValue={fields.endDate}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: submitted ? !errors.endDate : true,
                error: submitted ? errors.endDate : '',
              }}
            >
              <div className="cx-absolute cx-inset-y-0 cx-left-0 cx-flex cx-items-center cx-p-2">
                <Icon name="calendar" size={18} className="cx-text-neutral-500" />
              </div>
              <Datepicker
                selected={endDate}
                onChange={onSelectDate('endDate')}
                dateFormat={DATE_FORMAT}
                disabled={isDisableDatetime}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-ml-4 click-to-edit-custom">
            <span className="span-label">End time</span>
            <FormElementWrapper
              name="endTime"
              readOnlyValue={project?.endTime || ''}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: !timeError,
              }}
            >
              <TimePicker
                onSelect={onSelectTime('endTime')}
                defaultSelected={project?.endTime}
                disabled={!fields.endDate || isDisableDatetime}
              />
            </FormElementWrapper>
          </div>
        </div>
        {!!timeError && <p className="sked-form-element__errors cx-mb-4">{timeError}</p>}
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Account & Location</h1>}
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="span-label">Account</span>
            <FormElementWrapper
              name="accountId"
              validation={{ isValid: submitted ? !errors.accountId : true, error: errors.accountId }}
              readOnlyValue={project?.account?.name || ''}
              isReadOnly={isFormReadonly}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('accountId')}
                onSearchKeyword={fetchAccounts}
                placeholderText="Search accounts..."
                defaultSelected={project?.account ? { UID: project.account.id, Name: project.account.name } : null}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyAccountForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyAccountForAllJob}
              error={submitted ? errors.applyAccountForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="span-label">Contact</span>
            <FormElementWrapper
              name="contactId"
              validation={{ isValid: submitted ? !errors.contactId : true, error: errors.contactId }}
              readOnlyValue={project?.contact?.name || ''}
              isReadOnly={isFormReadonly}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('contactId')}
                onSearchKeyword={fetchContacts}
                placeholderText="Search contacts..."
                defaultSelected={project?.contact ? { UID: project.contact.id, Name: project.contact.name } : null}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyContactForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyContactForAllJob}
              error={submitted ? errors.applyContactForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="span-label">Region</span>
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
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyRegionForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyRegionForAllJob}
              error={submitted ? errors.applyRegionForAllJob : ''}
              isRequired={true}
            />
          </div>
        </div>
        <div className="cx-flex">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="span-label">Location</span>
            <FormElementWrapper
              name="locationId"
              validation={{ isValid: submitted ? !errors.locationId : true, error: errors.locationId }}
              readOnlyValue={project?.location?.name || ''}
              isReadOnly={isFormReadonly}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('locationId')}
                onSearchKeyword={fetchLocations}
                placeholderText="Search locations..."
                defaultSelected={project?.location ? { UID: project.location.id, Name: project.location.name } : null}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              className="click-to-edit-custom"
              name="applyLocationForAllJob"
              type="checkbox"
              isReadOnly={false}
              disabled={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyLocationForAllJob}
              error={submitted ? errors.applyLocationForAllJob : ''}
              isRequired={false}
            />
          </div>
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
            disabled={isUpdate && !objPermissions?.Project.allowUpdate}
          >
            Save
          </Button>
        </div>
      )}
    </>
  )
}

export default React.memo(ProjectFormChildren)
