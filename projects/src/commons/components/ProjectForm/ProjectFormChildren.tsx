import * as React from 'react'
import classnames from 'classnames'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  AsyncSearchSelect,
  ISelectItem,
} from '@skedulo/sked-ui'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import {
  fetchAccounts,
  fetchContacts,
  fetchRegions,
  fetchLocations,
  fetchTemplates,
} from '../../../Services/DataServices'
import { IProjectDetail } from '../../../commons/types'
import { AppContext } from '../../../App'

interface IProjectFormChildrenProps {
  formParams: SkedFormChildren<IProjectDetail>
  onCancel?: () => void
  project?: IProjectDetail
  timeError: string
  setTimeError: React.Dispatch<string>
}

const ProjectFormChildren: React.FC<IProjectFormChildrenProps> = ({
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
  const shouldReadonly = isUpdate && project?.canEdit === false ? true : isFormReadonly

  const handleCancel = React.useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    resetFieldsToInitialValues()
  }, [onCancel])

  const handleFetchTemplate = React.useCallback((searchTerm: string) => {
    return fetchTemplates(searchTerm, project ? [project.id] : undefined)
  }, [project])

  const handleFetchContacts = React.useCallback((searchTerm: string) => {
    return fetchContacts(searchTerm, fields.accountId)
  }, [fields.accountId])

  const handleFetchLocations = React.useCallback((searchTerm: string) => {
    return fetchLocations(searchTerm, fields.regionId)
  }, [fields.regionId])

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedOption: ISelectItem) => {
      if (selectedOption) {
        if (fieldName === 'accountId') {
          // setTempAccountId(selectedOption.value)
        }
        customFieldUpdate(fieldName)(selectedOption.value)
      }
    },
    [customFieldUpdate]
  )

  return (
    <>
      <div
        className={
          classnames('vertical-panel cx-p-4', { 'custom-input-readonly': isUpdate && project?.canEdit === false })
        }
      >
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Information</h1>}
        <div className="cx-mb-4 click-to-edit-custom">
          <span className="span-label">Template</span>
          <FormElementWrapper
            name="templateId"
            validation={{ isValid: submitted ? !errors.templateId : true, error: submitted ? errors.templateId : '' }}
            readOnlyValue={project?.template?.name || ''}
            isReadOnly={shouldReadonly}
          >
            <AsyncSearchSelect
              name="templateId"
              fetchItems={handleFetchTemplate}
              debounceTime={300}
              onSelectedItemChange={onSelectLookupField('templateId')}
              initialSelectedItem={
                project?.template ? { value: project.template.id, label: project.template.name } : undefined
              }
              useCache={true}
              placeholder="Search template..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <WrappedFormInput
          name="projectName"
          className="click-to-edit-custom"
          isReadOnly={shouldReadonly}
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
          isReadOnly={shouldReadonly}
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
            disabled={shouldReadonly}
            label="Is Template"
            value={fields.isTemplate}
            isRequired={false}
          />
        </div>
        {isUpdate && (
          <>
            <div className="cx-mb-4 click-to-edit-custom cx-w-2/4">
              <span className="span-label">Start date</span>
              <div className="cx-flex cx-items-center hover:cx-bg-neutral-300 cx-pl-2 cx-pr-4 cx-text-neutral-600">
                <span>{project?.startDate ? `${project?.startDate}` : 'No start date'}</span>
                <span className="cx-ml-1">
                  {project?.startTime && project?.startTime ? ` - ${project?.startTime}` : ''}
                </span>
              </div>
            </div>
            <div className="cx-mb-4 click-to-edit-custom cx-w-2/4">
              <span className="span-label">End date</span>
              <div className="cx-flex cx-items-center hover:cx-bg-neutral-300 cx-pl-2 cx-pr-4 cx-text-neutral-600">
                <span>{project?.endDate ? `${project?.endDate}` : 'No end date'}</span>
                <span className="cx-ml-1">{project?.endDate && project?.endTime ? `- ${project?.endTime}` : ''}</span>
              </div>
            </div>
          </>
        )}
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Account & Location</h1>}
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="span-label">Account</span>
            <FormElementWrapper
              name="accountId"
              validation={{ isValid: submitted ? !errors.accountId : true, error: errors.accountId }}
              readOnlyValue={project?.account?.name || ''}
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="accountId"
                fetchItems={fetchAccounts}
                debounceTime={300}
                onSelectedItemChange={onSelectLookupField('accountId')}
                initialSelectedItem={
                  project?.account ? { value: project.account.id, label: project.account.name } : undefined
                }
                useCache={true}
                placeholder="Search accounts..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyAccountForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
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
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="contactId"
                fetchItems={handleFetchContacts}
                debounceTime={300}
                key={fields.accountId}
                onSelectedItemChange={onSelectLookupField('contactId')}
                initialSelectedItem={
                  project?.contact ? { value: project.contact.id, label: project.contact.name } : undefined
                }
                useCache={false}
                placeholder="Search contacts..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyContactForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
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
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="regionId"
                fetchItems={fetchRegions}
                debounceTime={300}
                onSelectedItemChange={onSelectLookupField('regionId')}
                initialSelectedItem={
                  project?.region ? { value: project.region.id, label: project.region.name } : undefined
                }
                disabled={false}
                useCache={true}
                placeholder="Search regions..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyRegionForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
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
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="locationId"
                fetchItems={handleFetchLocations}
                key={fields.regionId}
                debounceTime={300}
                onSelectedItemChange={onSelectLookupField('locationId')}
                initialSelectedItem={
                  project?.location ? { value: project.location.id, label: project.location.name } : undefined
                }
                disabled={false}
                useCache={false}
                placeholder="Search locations..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              className="click-to-edit-custom"
              name="applyLocationForAllJob"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
              label="Apply to all jobs"
              value={fields.applyLocationForAllJob}
              error={submitted ? errors.applyLocationForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
      </div>
      {!shouldReadonly && (
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

// export default React.memo(ProjectFormChildren)
export default ProjectFormChildren
