import * as React from 'react'
import { SearchSelect, Icon, ISelectItem, AsyncSearchSelect } from '@skedulo/sked-ui'
import { AppContext } from '../../../App'
import { IBaseModel, IJobConstraint } from '../../types'
import { fetchJobTemplateOptions } from '../../../Services/DataServices'

interface IJobTemplateConstraintProps {
  jobConstraint: IJobConstraint
  handleDelete: (id: string) => void
  handleChange: (newConstraint: Record<string, string>, index: string) => void
  wrapperClassName?: string
  projectId: string
  jobTemplateId: string
  jobConstraints: IJobConstraint[]
}

const JobTemplateConstraint: React.FC<IJobTemplateConstraintProps> = ({
  jobConstraint,
  handleDelete,
  handleChange,
  wrapperClassName,
  projectId,
  jobTemplateId,
  jobConstraints,
}) => {
  const appContext = React.useContext(AppContext)

  const { constraintTypes = [], dependencyTypes = [] } = React.useMemo(() => appContext?.config || {}, [appContext])

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
      dependentJob: jobConstraint.dependentJob
        ? { value: jobConstraint.dependentJob.id, label: jobConstraint.dependentJob.name }
        : undefined,
    }),
    [dependencyTypeOptions, constraintTypeOptions, jobConstraint]
  )

  const excludeJobTemplateIds = React.useMemo(() => {
    let excludeIds = jobTemplateId ? [jobTemplateId] : []
    if (jobConstraints.length > 0) {
      const jobConstraintJobIds = jobConstraints
        .map(item => item.dependentJobId || item.dependentJob?.id)
        .filter(item => !!item)
      excludeIds = [...excludeIds, ...(jobConstraintJobIds as string[])]
    }
    return excludeIds
  }, [jobConstraints, jobTemplateId])

  const handleGetDependentJobs = React.useCallback(
    (searchTerm: string) => {
      return fetchJobTemplateOptions(
        { searchText: searchTerm, pageNumber: 1, pageSize: 20, projectId },
        excludeJobTemplateIds
      )
    },
    [projectId, excludeJobTemplateIds]
  )

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedOption: ISelectItem) => {
      if (selectedOption) {
        handleChange({ [fieldName]: selectedOption.value }, jobConstraint.id || jobConstraint.tempId || '')
      }
    },
    [jobConstraint]
  )

  const handleDeleteConstraint = React.useCallback(() => {
    handleDelete(jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  return (
    <>
      <div className={`cx-flex cx-items-center cx-justify-between ${wrapperClassName}`}>
        <span className="cx-text-neutral-600 cx-mr-2">THE JOB</span>
        <div className="cx-mr-2">
          <SearchSelect
            items={constraintTypeOptions}
            onSelectedItemChange={onSelectLookupField('constraintType')}
            placeholder="Constraint type"
            initialSelectedItem={initialConstraints.constraintType}
            icon="chevronDown"
            name="jobType"
          />
        </div>
        <div className="cx-mr-2">
          <SearchSelect
            items={dependencyTypeOptions}
            onSelectedItemChange={onSelectLookupField('dependencyType')}
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
            fetchItems={handleGetDependentJobs}
            debounceTime={300}
            onSelectedItemChange={onSelectLookupField('dependentJobId')}
            initialSelectedItem={initialConstraints.dependentJob}
            useCache={true}
            placeholder="Dependent job"
            icon="chevronDown"
          />
        </div>
        <Icon name="trash" className="cx-text-neutral-500 cx-cursor-pointer" onClick={handleDeleteConstraint} />
      </div>
      {jobConstraint.error && <p className="sked-form-element__errors">{jobConstraint.error}</p>}
    </>
  )
}

export default React.memo(JobTemplateConstraint)
