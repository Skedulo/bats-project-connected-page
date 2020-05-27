import * as React from 'react'
import { isDate, isAfter } from 'date-fns'
import { SkedFormChildren, Button, FormElementWrapper, Datepicker, FormInputElement } from '@skedulo/sked-ui'
import LookupInput from '../../../commons/components/LookupInput'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import { fetchAccounts, fetchContacts, fetchRegions, fetchLocations, fetchTemplates } from '../../../Services/DataServices'
import { ProjectDetailInterface, LookupOptionInterface } from '../../../commons/types'
import { DATE_FORMAT } from '../../constants'

interface ProjectFormChildrenProps {
  formParams: SkedFormChildren<ProjectDetailInterface>
  onCancel?: () => void
  project?: ProjectDetailInterface
}

const ProjectFormChildren: React.FC<ProjectFormChildrenProps> = ({ formParams, onCancel, project }) => {
  const isUpdate = React.useMemo(() => !!project?.id, [project?.id])
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
          isRequired={false}
        />
        <div className="cx-mb-4 ">
          {/* <span className="span-label">Is Template</span>
          <FormElementWrapper
            className="cx-mb-4"
            name="isTemplate"
            readOnlyValue={fields.isTemplate ? 'True' : 'False'}
            isReadOnly={false}
          >
            <FormInputElement type="checkbox" name="isTemplate" checked={!!fields.isTemplate} />
          </FormElementWrapper> */}
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
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
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
                disabled={!!(isUpdate && fields.isTemplate)}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4 click-to-edit-custom">
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
                disabled={!!(isUpdate && fields.isTemplate)}
              />
            </FormElementWrapper>
          </div>
        </div>
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
        {/* <WrappedFormInput
          name="address"
          isReadOnly={isFormReadonly}
          label="Address"
          value={fields.address}
          error={submitted ? errors.address : ''}
          isRequired={false}
        /> */}
      </div>
      {!isFormReadonly && (
        <div className="cx-flex cx-justify-end cx-pt-4 border-top cx-bg-white cx-bottom-0">
          <Button buttonType="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button buttonType="primary" className="cx-ml-2" type="submit">
            Save
          </Button>
        </div>
      )}
    </>
  )
}

export default React.memo(ProjectFormChildren)
