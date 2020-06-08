import * as React from 'react'
import { SkedFormChildren, Button, FormElementWrapper, SearchSelect, ISelectItem, AsyncSearchSelect } from '@skedulo/sked-ui'
import WrappedFormInput from '../WrappedFormInput'
import { AppContext } from '../../../App'
import JobTemplateConstraint from '../JobTemplateConstraint'
import { IJobConstraint, IJobTemplate, IBaseModel } from '../../types'

interface IJobTemplateFormChildrenProps {
  formParams: SkedFormChildren<IJobTemplate>
  onCancel?: () => void
  jobTemplate: IJobTemplate | null
  jobConstraints: IJobConstraint[]
  setJobConstraints: React.Dispatch<React.SetStateAction<IJobConstraint[]>>
  totalJobTemplates: number
  projectId: string
}

const JobTemplateFormChildren: React.FC<IJobTemplateFormChildrenProps> = ({
  formParams,
  onCancel,
  jobTemplate,
  jobConstraints,
  setJobConstraints,
  totalJobTemplates,
  projectId
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
    customFieldUpdate('jobType')(jobType.value)
  }, [])

  const handleAddConstraint = React.useCallback(() => {
    setJobConstraints((prev) => [
      ...prev,
      {
        tempId: new Date().valueOf().toString(),
        dependencyType: '',
        constraintType: '',
        dependentJobId: '',
      },
    ])
  }, [jobConstraints, setJobConstraints])

  const handleChangeConstraint = React.useCallback(
    (newConstraint: Record<string, string>, id: string) => {
      setJobConstraints((prev) =>
        prev.map((item: IJobConstraint) => {
          if (item.id === id || item.tempId === id) {
            return { ...item, ...newConstraint }
          }
          return item
        })
      )
    },
    [setJobConstraints]
  )

  const handleDeleteConstraint = React.useCallback(
    (id: string) => {
      setJobConstraints((prev) => prev.filter((item: IJobConstraint) => item.id !== id))
    },
    [setJobConstraints]
  )

  const handleCancel = React.useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }, [onCancel])

  return (
    <>
      <div className="vertical-panel cx-p-4">
        <div className="cx-mb-4">
          <span className="span-label">Type</span>
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
        {totalJobTemplates > 1 && (
          <div className="cx-mb-4">
            <span className="span-label">Job Dependencies</span>
            {jobConstraints.map((jobConstraint: IJobConstraint, index: number) => (
              <JobTemplateConstraint
                key={jobConstraint.id || jobConstraint.tempId}
                wrapperClassName="cx-mb-4"
                jobConstraint={jobConstraint}
                handleChange={handleChangeConstraint}
                handleDelete={handleDeleteConstraint}
                projectId={projectId}
                jobTemplateId={jobTemplate?.id || ''}
              />
            ))}
            <div className="cx-text-center">
              <Button className="cx-text-primary" buttonType="transparent" onClick={handleAddConstraint} icon="plus">
                Add job dependency
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
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

export default React.memo(JobTemplateFormChildren)
