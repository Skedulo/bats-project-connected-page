import * as React from 'react'
import { SearchSelect, Icon, ISelectItem, AsyncSearchSelect } from '@skedulo/sked-ui'
import { AppContext } from '../../../App'
import { IBaseModel, IJobConstraint } from '../../types'
import { fetchJobTemplateOptions } from '../../../Services/DataServices';

interface IJobTemplateConstraintProps {
  jobConstraint: IJobConstraint
  handleDelete: (id: string) => void
  handleChange: (newConstraint: Record<string, string>, index: string) => void
  wrapperClassName?: string
  projectId: string
  jobTemplateId: string
}

const JobTemplateConstraint: React.FC<IJobTemplateConstraintProps> = ({
  jobConstraint,
  handleDelete,
  handleChange,
  wrapperClassName,
  projectId,
  jobTemplateId
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
      dependentJob: jobConstraint.dependentJob ?
        { value: jobConstraint.dependentJob.id, label: jobConstraint.dependentJob.name } :
        undefined
    }),
    [dependencyTypeOptions, constraintTypeOptions, jobConstraint]
  )

  const handleGetDependentJobs = React.useCallback((searchTerm: string) => {
    return fetchJobTemplateOptions({ searchText: searchTerm, pageNumber: 1, pageSize: 20, projectId }, jobTemplateId)
  }, [projectId, jobTemplateId])

  const handleConstraintType = React.useCallback((selectedItem: ISelectItem) => {
    handleChange({ constraintType: selectedItem.value }, jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  const handleDependencyType = React.useCallback((selectedItem: ISelectItem) => {

    handleChange({ dependencyType: selectedItem.value }, jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  const handleDependentJob = React.useCallback((selectedItem: ISelectItem) => {
    handleChange({ dependentJobId: selectedItem.value }, jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  const handleDeleteConstraint = React.useCallback(() => {
    handleDelete(jobConstraint.id || jobConstraint.tempId || '')
  }, [jobConstraint])

  return (
    <div className={`cx-flex cx-items-center cx-justify-between ${wrapperClassName}`}>
      <span className="cx-text-neutral-600 cx-mr-2">THE JOB</span>
      <div className="cx-mr-2">
        <SearchSelect
          items={constraintTypeOptions}
          onSelectedItemChange={handleConstraintType}
          placeholder="Constraint type"
          initialSelectedItem={initialConstraints.constraintType}
          icon="chevronDown"
          name="jobType"
        />
      </div>
      <div className="cx-mr-2">
        <SearchSelect
          items={dependencyTypeOptions}
          onSelectedItemChange={handleDependencyType}
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
          onSelectedItemChange={handleDependentJob}
          initialSelectedItem={initialConstraints.dependentJob}
          disabled={false}
          useCache={true}
          placeholder="Dependent job"
          icon="chevronDown"
      />
      </div>
      <Icon name="trash" className="cx-text-neutral-500" onClick={handleDeleteConstraint} />
    </div>
  )
}

export default React.memo(JobTemplateConstraint)
