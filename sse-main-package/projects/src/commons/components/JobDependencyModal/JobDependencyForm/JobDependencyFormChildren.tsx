import * as React from 'react'
import classnames from 'classnames'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  SearchSelect,
  ISelectItem,
  AsyncSearchSelect,
  Icon,
  FormLabel,
  NumberInput,
} from '@skedulo/sked-ui'
import WrappedFormInput from '../../WrappedFormInput'
import { AppContext } from '../../../../App'
import { IJobConstraint, IJobDependency, IBaseModel, JobDependencyType } from '../../../types'
import { fetchGenericOptions, fetchJobTemplateOptions } from '../../../../Services/DataServices'
import { JOB_DEPENDENCY_OPTIONS } from '../../../constants'

interface IJobDependencyFormChildrenProps {
  formParams: SkedFormChildren<IJobDependency>
  onCancel?: () => void
  jobDependency: IJobDependency | null
  projectId: string
}

const JobDependencyFormChildren: React.FC<IJobDependencyFormChildrenProps> = ({
  formParams,
  onCancel,
  jobDependency,
  projectId
}) => {
  const [dependencyType, setDependencyType] = React.useState<JobDependencyType>(JobDependencyType.AFTER_THE_END_OF)
  const ignoreIdsString = ''
  const { fields, customFieldUpdate, errors, submitted } = formParams
  const handleGetDependentJobs = React.useCallback(
    (searchTerm: string) => {
      return fetchJobTemplateOptions(
        { searchText: searchTerm, pageNumber: 1, pageSize: 20, projectId }
      )
    },
    [projectId, ignoreIdsString]
  )

  const onChangeConstraint = React.useCallback(
    (fieldName: string) => (selectedOption: ISelectItem) => {
      console.log('hihihihihi');
    },
    []
  )

  return (
    <div className="cx-p-4">
      <FormElementWrapper className="cx-mb-4">
        <FormLabel>The job must start</FormLabel>
        <SearchSelect
          items={JOB_DEPENDENCY_OPTIONS}
          onSelectedItemChange={onChangeConstraint('dependencyType')}
          placeholder="Dependency type"
          initialSelectedItem={JOB_DEPENDENCY_OPTIONS[0]}
          icon="chevronDown"
          name="dependencyType"
        />
      </FormElementWrapper>
      {(dependencyType === JobDependencyType.WITHIN || dependencyType === JobDependencyType.AT_LEAST) && (
        <div className="cx-mb-4 cx-flex cx-items-center cx-justify-between">
          <NumberInput value={0} onValueChange={() => {}} />
          <SearchSelect
            items={[{ value: 'days', label: 'days' }]}
            onSelectedItemChange={onChangeConstraint('dependencyType')}
            initialSelectedItem={{ value: 'days', label: 'days' }}
            icon="chevronDown"
            name="offsetUnit"
          />
          <span>at the end of</span>
        </div>
      )}
      {dependencyType === JobDependencyType.BETWEEN && (
        <>
          <div className="cx-mb-4 cx-flex cx-items-center cx-justify-between">
            <NumberInput value={0} onValueChange={() => {}} />
            <SearchSelect
              items={[{ value: 'days', label: 'days' }]}
              onSelectedItemChange={onChangeConstraint('dependencyType')}
              initialSelectedItem={{ value: 'days', label: 'days' }}
              icon="chevronDown"
              name="offsetUnit"
            />
            <span>and</span>
          </div>
          <div className="cx-mb-4 cx-flex cx-items-center cx-justify-between">
            <NumberInput value={0} onValueChange={() => {}} />
            <SearchSelect
              items={[{ value: 'days', label: 'days' }]}
              onSelectedItemChange={onChangeConstraint('dependencyType')}
              initialSelectedItem={{ value: 'days', label: 'days' }}
              icon="chevronDown"
              name="offsetUnit"
            />
            <span>at the end of</span>
          </div>
        </>
      )}
      <AsyncSearchSelect
        name="dependentJob"
        key={ignoreIdsString}
        fetchItems={handleGetDependentJobs}
        debounceTime={300}
        onSelectedItemChange={onChangeConstraint('dependentJobId')}
        useCache={false}
        placeholder="Dependent job"
        icon="chevronDown"
      />
    </div>
  )
}

export default React.memo(JobDependencyFormChildren)
