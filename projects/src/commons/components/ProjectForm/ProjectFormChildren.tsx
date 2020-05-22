import * as React from 'react'
import { isDate, isBefore, isAfter } from 'date-fns'
import { SkedFormChildren, Button, FormElementWrapper, Datepicker, FormInputElement } from '@skedulo/sked-ui'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import { ProjectDetailInterface, LookupOptionInterface } from '../../../commons/types'
import LookupInput from '../../../commons/components/LookupInput'
import { fetchAccounts, fetchContacts, fetchRegions } from '../../../Services/DataServices'
import { DATE_FORMAT } from '../../constants'

interface ProjectFormChildrenProps {
  formParams: SkedFormChildren<ProjectDetailInterface>
  onCancel: () => void
  project?: ProjectDetailInterface
}

const ProjectFormChildren: React.FC<ProjectFormChildrenProps> = ({ formParams, onCancel, project }) => {
  const { fields, isFormReadonly, resetFieldsToInitialValues, customFieldUpdate, errors, submitted } = formParams

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
    resetFieldsToInitialValues()
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }, [onCancel])

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedOption: LookupOptionInterface) => {
      customFieldUpdate(fieldName)(selectedOption.UID)
    },
    []
  )

  const onSelectDate = React.useCallback(
    (fieldName: string) => (value: Date) => {
      if (fieldName === 'endDate' && isAfter(value, startDate)) {
        customFieldUpdate(fieldName)(value)
      }
      if (fieldName === 'startDate') {
        customFieldUpdate(fieldName)(value)
      }
    },
    [startDate, endDate]
  )

  return (
    <>
      <div className="vertical-panel">
        <div className="cx-mb-4">
          <span className="span-label">Template</span>
          <FormElementWrapper
            name="templateId"
            validation={{ isValid: submitted ? !errors.templateId : true, error: submitted ? errors.templateId : '' }}
            readOnlyValue={fields.regionId}
            isReadOnly={false}
          >
            <LookupInput
              className="form-element__outline"
              onSelect={onSelectLookupField('templateId')}
              onSearchKeyword={fetchRegions}
              placeholderText="Search template..."
              defaultSelected={fields.regionId}
            />
          </FormElementWrapper>
        </div>
        <WrappedFormInput
          name="projectName"
          isReadOnly={isFormReadonly}
          label="Name"
          value={fields.projectName}
          error={submitted ? errors.projectName : ''}
          isRequired={false}
        />
        <WrappedFormInput
          name="projectDescription"
          type="textarea"
          rows={3}
          isReadOnly={isFormReadonly}
          label="Description"
          value={fields.projectDescription}
          error={submitted ? errors.projectDescription : ''}
          isRequired={false}
        />
        <span className="span-label">Is Template</span>
        <FormElementWrapper
          className="cx-mb-4"
          name="isTemplate"
          readOnlyValue={fields.isTemplate ? 'True' : 'False'}
          isReadOnly={false}
        >
          <FormInputElement type="checkbox" name="isTemplate" checked={!!fields.isTemplate} />
        </FormElementWrapper>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-1/3">
            <span className="span-label">Start date</span>
            <FormElementWrapper
              name="startDate"
              readOnlyValue={fields.startDate}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: submitted ? !errors.startDate : true,
                error: submitted ? errors.startDate : '',
              }}
            >
              <Datepicker
                selected={startDate}
                onChange={onSelectDate('startDate')}
                dateFormat={DATE_FORMAT}
                disabled={project?.id && project?.isTemplate}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3">
            <span className="span-label">End date</span>
            <FormElementWrapper
              name="endDate"
              readOnlyValue={fields.endDate}
              isReadOnly={isFormReadonly}
              validation={{
                isValid: submitted ? !errors.endDate : true,
                error: submitted ? errors.endDate : '',
              }}
            >
              <Datepicker
                selected={endDate}
                onChange={onSelectDate('endDate')}
                dateFormat={DATE_FORMAT}
                disabled={project?.id && project?.isTemplate}
              />
            </FormElementWrapper>
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <span className="span-label">Account</span>
            <FormElementWrapper
              name="accountId"
              validation={{ isValid: submitted ? !errors.accountId : true, error: errors.accountId }}
              readOnlyValue={fields.regionId}
              isReadOnly={false}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('accountId')}
                onSearchKeyword={fetchAccounts}
                placeholderText="Search accounts..."
                defaultSelected={fields.accountId}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyAccountForAllJob"
              type="checkbox"
              // isReadOnly={false}
              // disabled={isFormReadonly}
              isReadOnly={false}
              label="Apply to all jobs"
              value={fields.applyAccountForAllJob}
              error={submitted ? errors.applyAccountForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <span className="span-label">Contact</span>
            <FormElementWrapper
              name="contactId"
              validation={{ isValid: submitted ? !errors.contactId : true, error: errors.contactId }}
              // readOnlyValue={fields.contactId}
              isReadOnly={false}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('contactId')}
                onSearchKeyword={fetchContacts}
                placeholderText="Search contacts..."
                defaultSelected={fields.contactId}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyContactForAllJob"
              type="checkbox"
              isReadOnly={false}
              // disabled={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyContactForAllJob}
              error={submitted ? errors.applyContactForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <span className="span-label">Region</span>
            <FormElementWrapper
              name="regionId"
              validation={{ isValid: submitted ? !errors.regionId : true, error: errors.regionId }}
              readOnlyValue={fields.regionId}
              isReadOnly={false}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('regionId')}
                onSearchKeyword={fetchRegions}
                placeholderText="Search regions..."
                defaultSelected={fields.regionId}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyRegionForAllJob"
              type="checkbox"
              isReadOnly={false}
              label="Apply to all jobs"
              value={fields.applyRegionForAllJob}
              error={submitted ? errors.applyRegionForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex">
          <div className="cx-mb-4 cx-w-2/3">
            <WrappedFormInput
              name="location"
              isReadOnly={isFormReadonly}
              label="Location"
              value={fields.location}
              error={submitted ? errors.location : ''}
              isRequired={false}
            />
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyAccountForAllJob"
              type="checkbox"
              isReadOnly={false}
              label="Apply to all jobs"
              value={fields.applyLocationForAllJob}
              error={submitted ? errors.applyLocationForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
      </div>
      <div className="cx-flex cx-justify-end cx-pt-4 border-top cx-bg-white cx-bottom-0">
        <Button buttonType="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button buttonType="primary" className="cx-ml-2" type="submit">
          Save
        </Button>
      </div>
    </>
  )
}

export default React.memo(ProjectFormChildren)
