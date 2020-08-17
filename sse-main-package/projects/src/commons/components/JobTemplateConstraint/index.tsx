import * as React from 'react'
import { SearchSelect, Icon, ISelectItem, AsyncSearchSelect } from '@skedulo/sked-ui'
import { AppContext } from '../../../App'
import { IBaseModel, IJobConstraint } from '../../types'
import { fetchJobTemplateOptions } from '../../../Services/DataServices'

interface IJobTemplateConstraintProps {
  jobConstraint: IJobConstraint
  handleDelete: (id: string) => void
  handleChange: (newConstraint: Record<string, any>, index: string) => void
  wrapperClassName?: string
  projectId: string
  ignoreJobTemplateIds: string[]
}

const JobTemplateConstraint: React.FC<IJobTemplateConstraintProps> = ({
  jobConstraint,
  handleDelete,
  handleChange,
  wrapperClassName,
  projectId,
  ignoreJobTemplateIds
}) => {
  const appContext = React.useContext(AppContext)

  const { constraintTypes = [], dependencyTypes = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

  const ignoreIdsString = React.useMemo(
    () => ignoreJobTemplateIds.filter(item => !!item).join(','),
    [ignoreJobTemplateIds]
  )

  const constraintTypeOptions = React.useMemo(
    () => constraintTypes.map((item: IBaseModel) => ({ value: item.id, label: item.name })),
    [constraintTypes]
  )

  const dependencyTypeOptions = React.useMemo(
    () => dependencyTypes.map((item: IBaseModel) => ({ value: item.id, label: item.name })),
    [dependencyTypes]
  )

  const initialConstraints = React.useMemo(
    () => ({
      constraintType: constraintTypeOptions.find(item => item.value === jobConstraint.constraintType),
      dependencyType: dependencyTypeOptions.find(item => item.value === jobConstraint.dependencyType),
      dependentJob: jobConstraint.dependentJob?.id
        ? { value: jobConstraint.dependentJob.id, label: jobConstraint.dependentJob.name }
        : undefined,
    }),
    [dependencyTypeOptions, constraintTypeOptions, jobConstraint]
  )

  const handleGetDependentJobs = React.useCallback(
    (searchTerm: string) => {
      return fetchJobTemplateOptions(
        { searchText: searchTerm, pageNumber: 1, pageSize: 20, projectId },
        ignoreIdsString
      )
    },
    [projectId, ignoreIdsString]
  )

  const onChangeConstraint = React.useCallback(
    (fieldName: string) => (selectedOption: ISelectItem) => {
      if (fieldName === 'dependentJobId') {
        handleChange({ [fieldName]: selectedOption?.value || '' }, jobConstraint.id || jobConstraint.tempId || '')
        handleChange(
          { dependentJob: selectedOption ? { id: selectedOption?.value, name: selectedOption?.label } : {} },
          jobConstraint.id || jobConstraint.tempId || ''
        )
      } else {
        handleChange({ [fieldName]: selectedOption?.value || '' }, jobConstraint.id || jobConstraint.tempId || '')
      }
    },
    [jobConstraint]
  )

  const handleDeleteConstraint = React.useCallback(() => {
    handleDelete(jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  return (
    <div className={wrapperClassName}>
      <div className={`cx-flex cx-items-center cx-justify-between`}>
        <span className="cx-text-neutral-600 cx-mr-2">THE JOB</span>
        <div className="cx-mr-2">
          <SearchSelect
            items={constraintTypeOptions}
            onSelectedItemChange={onChangeConstraint('constraintType')}
            placeholder="Constraint type"
            initialSelectedItem={initialConstraints.constraintType}
            icon="chevronDown"
            name="jobType"
          />
        </div>
        <div className="cx-mr-2">
          <SearchSelect
            items={dependencyTypeOptions}
            onSelectedItemChange={onChangeConstraint('dependencyType')}
            placeholder="Dependency type"
            initialSelectedItem={initialConstraints.dependencyType}
            icon="chevronDown"
            name="dependencyType"
          />
        </div>
        <span className="cx-text-neutral-600 cx-mr-2">OF</span>
        <div className="cx-mr-2">
          {/* <SearchSelect
            items={dependentJobs}
            onSelectedItemChange={handleDependentJob}
            placeholder="Dependent job"
            initialSelectedItem={initialConstraints.dependentJob}
            icon="chevronDown"
            name="jobType"
          /> */}
          <AsyncSearchSelect
            name="dependentJob"
            key={ignoreIdsString}
            fetchItems={handleGetDependentJobs}
            debounceTime={300}
            onSelectedItemChange={onChangeConstraint('dependentJobId')}
            initialSelectedItem={initialConstraints.dependentJob}
            useCache={false}
            placeholder="Dependent job"
            icon="chevronDown"
          />
        </div>
        <Icon name="trash" className="cx-text-neutral-500 cx-cursor-pointer" onClick={handleDeleteConstraint} />
      </div>
      {jobConstraint.error && <p className="sked-form-element__errors">{jobConstraint.error}</p>}
    </div>
  )
}

export default React.memo(JobTemplateConstraint)
