import * as React from 'react'
import classnames from 'classnames'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  SearchSelect,
  ISelectItem,
  AsyncSearchSelect,
} from '@skedulo/sked-ui'
import WrappedFormInput from '../WrappedFormInput'
import { AppContext } from '../../../App'
import { IJobConstraint, IJobTemplate, IBaseModel } from '../../types'
import { fetchGenericOptions } from '../../../Services/DataServices'

interface IJobTemplateFormChildrenProps {
  formParams: SkedFormChildren<IJobTemplate>
  onCancel?: () => void
  jobTemplate: IJobTemplate | null
  projectRegionId: string
  onDelete: () => void
}

const JobTemplateFormChildren: React.FC<IJobTemplateFormChildrenProps> = ({
  formParams,
  onCancel,
  jobTemplate,
  projectRegionId,
  onDelete
}) => {
  const appContext = React.useContext(AppContext)
  const { jobTypes = [] } = React.useMemo(() => appContext?.config || {}, [appContext])
  const { fields, customFieldUpdate, errors, submitted } = formParams

  const jobTypeOptions = React.useMemo(
    () =>
      jobTypes.map((item: IBaseModel) => ({
        value: item.id,
        label: item.name,
      })),
    [jobTypes]
  )

  const initialJobType = React.useMemo(() => jobTypeOptions.find(item => item.value === jobTemplate?.jobType), [
    jobTemplate,
    jobTypeOptions,
  ])

  const handleJobType = React.useCallback((jobType: ISelectItem) => {
    customFieldUpdate('jobType')(jobType?.value || '')
  }, [])

  const handleFetchResources = React.useCallback((searchTerm: string) => {
    return fetchGenericOptions({
      name: searchTerm,
      sObjectType: 'sked__Resource__c',
      regionIds: projectRegionId
    })
  },
  [projectRegionId])

  const handleSelectResource = React.useCallback((item: ISelectItem) => {
    customFieldUpdate('resourceId')(item.value)
  }, [])

  return (
    <>
      <div className="cx-p-4">
        <div className="cx-mb-4">
          <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Type</span>
          <FormElementWrapper
            name="jobType"
            validation={{ isValid: submitted ? !errors.jobType : true, error: submitted ? errors.jobType : '' }}
          >
            <SearchSelect
              items={jobTypeOptions}
              onSelectedItemChange={handleJobType}
              disabled={false}
              initialSelectedItem={initialJobType}
              placeholder="Select job type"
              icon="chevronDown"
              name="jobType"
            />
          </FormElementWrapper>
        </div>
        <WrappedFormInput
          name="description"
          type="textarea"
          rows={3}
          isReadOnly={false}
          label="Description"
          value={fields.description}
          maxLength={255}
          isRequired={false}
        />
        <div className="cx-mb-4">
          <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Resources</span>
          <AsyncSearchSelect
            name="resourceId"
            fetchItems={handleFetchResources}
            debounceTime={300}
            placeholder="Select a resource"
            onSelectedItemChange={handleSelectResource}
            initialSelectedItem={
              jobTemplate?.resource ? { value: jobTemplate.resource.id, label: jobTemplate.resource.name } : undefined
            }
            useCache={true}
            icon="chevronDown"
          />
        </div>
      </div>
      <div
        className={classnames('cx-flex cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky', {
          'cx-justify-between': jobTemplate?.id,
          'cx-justify-end': !jobTemplate?.id
        })}
      >
        {jobTemplate?.id && (
          <Button buttonType="secondary" onClick={onDelete}>
            Delete
          </Button>
        )}
        <div>
          <Button buttonType="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button buttonType="primary" className="cx-ml-2" type="submit">
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export default React.memo(JobTemplateFormChildren)
