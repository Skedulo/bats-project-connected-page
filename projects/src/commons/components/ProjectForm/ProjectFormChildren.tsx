import * as React from 'react'
import { SkedFormChildren, Button, FormLabel, FormElementWrapper } from '@skedulo/sked-ui'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import { ProjectDetailInterface, LookupOptionInterface } from '../../../commons/types'
import LookupInput from '../../../commons/components/LookupInput'
import { fetchAccounts, fetchContacts, fetchRegions } from '../../../Services/DataServices'

interface ProjectFormChildrenProps {
  formParams: SkedFormChildren<ProjectDetailInterface>
  onCancel: () => void
}

const ProjectFormChildren: React.FC<ProjectFormChildrenProps> = ({ formParams, onCancel }) => {
  const { fields, isFormReadonly, resetFieldsToInitialValues, errors, submitted } = formParams

  const handleCancel = React.useCallback(() => {
    resetFieldsToInitialValues()
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }, [onCancel])

  const onSelectLookupField = React.useCallback((fieldName: string) => (value: LookupOptionInterface) => {
    console.log('value: ', value);
  }, [])

  return (
    <>
      <div className="vertical-panel">
        <WrappedFormInput
          name="projectName"
          isReadonly={isFormReadonly}
          label="Name"
          value={fields.projectName}
          error={submitted ? errors.projectName : ''}
          isRequired={false}
        />
        <WrappedFormInput
          name="projectDescription"
          type="textarea"
          rows={3}
          isReadonly={isFormReadonly}
          label="Description"
          value={fields.projectDescription}
          error={submitted ? errors.projectDescription : ''}
          isRequired={false}
        />
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <FormLabel>Account</FormLabel>
            <FormElementWrapper
              name="accountId"
              validation={{ isValid: submitted ? !errors.accountId : true, error: errors.accountId }}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('accountId')}
                onSearchKeyword={fetchAccounts}
                placeholderText="Search accounts..."
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyAccountForAllJob"
              type="checkbox"
              isReadonly={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyAccountForAllJob}
              error={submitted ? errors.applyAccountForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <FormLabel>Contact</FormLabel>
            <FormElementWrapper
              name="contactId"
              validation={{ isValid: submitted ? !errors.contactId : true, error: errors.contactId }}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('contactId')}
                onSearchKeyword={fetchContacts}
                placeholderText="Search contacts..."
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyContactForAllJob"
              type="checkbox"
              isReadonly={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyContactForAllJob}
              error={submitted ? errors.applyContactForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex cx-items-center">
          <div className="cx-mb-4 cx-w-2/3">
            <FormLabel>Region</FormLabel>
            <FormElementWrapper
              name="regionId"
              validation={{ isValid: submitted ? !errors.regionId : true, error: errors.regionId }}
            >
              <LookupInput
                className="form-element__outline"
                onSelect={onSelectLookupField('regionId')}
                onSearchKeyword={fetchRegions}
                placeholderText="Search regions..."
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-1/3 cx-text-center">
            <WrappedFormInput
              name="applyRegionForAllJob"
              type="checkbox"
              isReadonly={isFormReadonly}
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
              isReadonly={isFormReadonly}
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
              isReadonly={isFormReadonly}
              label="Apply to all jobs"
              value={fields.applyAccountForAllJob}
              error={submitted ? errors.applyAccountForAllJob : ''}
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
