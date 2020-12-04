import * as React from 'react'
import toNumber from 'lodash/toNumber'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import { ISelectItem, FormElementWrapper, FormLabel, SearchSelect, NumberInput, AsyncSearchSelect, Button } from '@skedulo/sked-ui'
import { IJobDependency, JobDependencyType } from '../../../types'
import { fetchJobTemplateOptions, createUpdateJobDependency } from '../../../../Services/DataServices'
import { JOB_DEPENDENCY_OPTIONS } from '../../../constants'
import { useGlobalLoading } from '../../GlobalLoading'
import { getDependencyType, parseMinutes, getMinutes } from '../../../utils'

const OFFSET_UNIT_OPTIONS = [
  { value: 'days', label: 'days' },
  { value: 'hours', label: 'hours' }
]

const DEFAULT_JOB_DEPENDENCY = {
  toAnchorMinOffsetMins: 0,
  toAnchorMaxOffsetMins: 0,
  fromJobTemplateId: '',
  toJobTemplateId: '',
  projectJobTemplateId: '',
  fromAnchor: 'Start',
  toAnchor: 'End'
}

interface IJobDependencyFormProps {
  jobDependency: IJobDependency
  onCancel: () => void
  projectId: string
  forceUpdateJobTemplateList: () => void
}

const JobDependencyForm: React.FC<IJobDependencyFormProps> = ({
  jobDependency,
  onCancel,
  projectId,
  forceUpdateJobTemplateList
}) => {
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const [dependencyType, setDependencyType] = React.useState<JobDependencyType>(getDependencyType(jobDependency))
  const [errors, setErrors] = React.useState<any>({})
  const [offsetUnit, setOffsetUnit] = React.useState<{
    toAnchorMinOffsetMins: 'days' | 'hours'
    toAnchorMaxOffsetMins: 'days' | 'hours'
  }>({
    toAnchorMinOffsetMins: 'days',
    toAnchorMaxOffsetMins: 'days'
  })

  const [jobDependencyState, setJobDependencyState] = React.useState<IJobDependency>(
    jobDependency || DEFAULT_JOB_DEPENDENCY
  )

  const ignoreIdsString = jobDependency?.projectJobTemplateId

  const handleGetDependentJobs = React.useCallback(
    (searchTerm: string) => {
      return fetchJobTemplateOptions(
        { searchText: searchTerm, pageNumber: 1, pageSize: 20, projectId },
        jobDependency?.projectJobTemplateId
      )
    },
    [projectId, ignoreIdsString]
  )

  const onChangeDependencyType = React.useCallback(
    (selectedOption: ISelectItem) => {
      if (!selectedOption) {
        return
      }
      setOffsetUnit({
        toAnchorMinOffsetMins: 'days',
        toAnchorMaxOffsetMins: 'days'
      })
      setDependencyType(selectedOption.value)
      setJobDependencyState(prev => ({
        ...prev,
        toAnchor: 'Start',
        fromAnchor: selectedOption.value === 'after the start of' ? 'Start' : 'End',
        toAnchorMinOffsetMins: getMinutes(1, 'days'),
        toAnchorMaxOffsetMins: getMinutes(1, 'days')
      }))
    },
    []
  )

  const onSelectJob = React.useCallback((selectedOption: ISelectItem) => {
      setJobDependencyState(prev => ({
        ...prev,
        fromJobTemplateId: selectedOption?.value || ''
      }))
    },
    []
  )

  const onChangeMinOffset = React.useCallback((value: React.ReactText) => {
    setJobDependencyState(prev => ({
      ...prev,
      toAnchorMinOffsetMins: getMinutes(toNumber(value), offsetUnit.toAnchorMinOffsetMins)
    }))
  },
    [offsetUnit.toAnchorMinOffsetMins]
  )

  const onChangeMaxOffset = React.useCallback((value: React.ReactText) => {
    setJobDependencyState(prev => ({
      ...prev,
      toAnchorMaxOffsetMins: getMinutes(toNumber(value), offsetUnit.toAnchorMaxOffsetMins)
    }))
  },
  [offsetUnit.toAnchorMaxOffsetMins]
  )

  const onChangeOffsetUnit = React.useCallback((field: string) => (selectedOption: ISelectItem) => {
    if (selectedOption) {
      setJobDependencyState(prev => ({
        ...prev,
        [field]: 0
      }))
      setOffsetUnit(prev => ({
        ...prev,
        [field]: selectedOption.value
      }))
    }
  },
  []
  )

  const onSave = React.useCallback(async () => {
    const submitErrors: any = {}
    if (!jobDependencyState.fromJobTemplateId && !jobDependencyState.fromJobTemplate?.id) {
      submitErrors.fromJobTemplateId = 'Job is required.'
    }
    if (dependencyType === JobDependencyType.BETWEEN &&
      toNumber(jobDependencyState.toAnchorMinOffsetMins) >= toNumber(jobDependencyState.toAnchorMaxOffsetMins)
    ) {
      submitErrors.toAnchorMaxOffsetMins = 'Max offset must be greater min offset.'
    }
    setErrors(submitErrors)
    if (isEmpty(submitErrors)) {
      startGlobalLoading()
      let submitData = omit({
        ...jobDependencyState,
        toJobTemplateId: jobDependencyState.projectJobTemplateId || jobDependencyState.toJobTemplate?.id,
        fromJobTemplateId: jobDependencyState.fromJobTemplateId || jobDependencyState.fromJobTemplate?.id
      }, ['fromJobTemplate', 'toJobTemplate'])
      if (dependencyType === JobDependencyType.WITHIN) {
        submitData = {
          ...submitData,
          toAnchorMinOffsetMins: 0
        }
      }

      if (dependencyType === JobDependencyType.AT_LEAST) {
        submitData = {
          ...submitData,
          toAnchorMaxOffsetMins: null
        }
      }

      if (dependencyType === JobDependencyType.AFTER_THE_END_OF ||
        dependencyType === JobDependencyType.AFTER_THE_START_OF) {
        submitData = {
          ...submitData,
          toAnchorMinOffsetMins: 0,
          toAnchorMaxOffsetMins: null
        }
      }

      const success = await createUpdateJobDependency(submitData)
      if (success) {
        forceUpdateJobTemplateList()
        onCancel()
      }
      endGlobalLoading()
    }
  }, [jobDependencyState, dependencyType, forceUpdateJobTemplateList])

  return (
    <div className="cx-p-4">
      <FormElementWrapper className="cx-mb-4">
        <FormLabel>The job must start</FormLabel>
        <SearchSelect
          items={JOB_DEPENDENCY_OPTIONS}
          onSelectedItemChange={onChangeDependencyType}
          placeholder="Dependency type"
          initialSelectedItem={JOB_DEPENDENCY_OPTIONS.find(item => item.value === dependencyType)}
          icon="chevronDown"
          name="dependencyType"
        />
      </FormElementWrapper>
      {dependencyType === JobDependencyType.AT_LEAST && (
        <div className="cx-mb-4 cx-flex cx-items-center cx-justify-start">
          <NumberInput
            value={parseMinutes(toNumber(jobDependencyState.toAnchorMinOffsetMins), offsetUnit.toAnchorMinOffsetMins)}
            onValueChange={onChangeMinOffset}
            min={1}
          />
          <SearchSelect
            className="cx-mx-4"
            items={OFFSET_UNIT_OPTIONS}
            onSelectedItemChange={onChangeOffsetUnit('toAnchorMinOffsetMins')}
            initialSelectedItem={OFFSET_UNIT_OPTIONS[0]}
            icon="chevronDown"
            name="offsetUnit"
          />
          <span>at the end of</span>
        </div>
      )}
      {dependencyType === JobDependencyType.WITHIN && (
        <div className="cx-mb-4 cx-flex cx-items-center cx-justify-start">
          <NumberInput
            value={parseMinutes(toNumber(jobDependencyState.toAnchorMaxOffsetMins), offsetUnit.toAnchorMaxOffsetMins)}
            onValueChange={onChangeMaxOffset}
            min={1}
          />
          <SearchSelect
            className="cx-mx-4"
            items={OFFSET_UNIT_OPTIONS}
            onSelectedItemChange={onChangeOffsetUnit('toAnchorMaxOffsetMins')}
            initialSelectedItem={OFFSET_UNIT_OPTIONS[0]}
            icon="chevronDown"
            name="offsetUnit"
          />
          <span>at the end of</span>
        </div>
      )}
      {dependencyType === JobDependencyType.BETWEEN && (
        <>
          <div className="cx-mb-4 cx-flex cx-items-center cx-justify-start">
            <NumberInput
              value={parseMinutes(toNumber(jobDependencyState.toAnchorMinOffsetMins), offsetUnit.toAnchorMinOffsetMins)}
              onValueChange={onChangeMinOffset}
              min={1}
            />
            <SearchSelect
              className="cx-mx-4"
              items={OFFSET_UNIT_OPTIONS}
              onSelectedItemChange={onChangeOffsetUnit('toAnchorMinOffsetMins')}
              initialSelectedItem={OFFSET_UNIT_OPTIONS[0]}
              icon="chevronDown"
              name="offsetUnit"
            />
            <span>and</span>
          </div>
          <div className="cx-mb-4 cx-flex cx-items-center cx-justify-start">
            <NumberInput
              value={parseMinutes(toNumber(jobDependencyState.toAnchorMaxOffsetMins), offsetUnit.toAnchorMaxOffsetMins)}
              onValueChange={onChangeMaxOffset}
              min={1}
            />
            <SearchSelect
              className="cx-mx-4"
              items={OFFSET_UNIT_OPTIONS}
              onSelectedItemChange={onChangeOffsetUnit('toAnchorMaxOffsetMins')}
              initialSelectedItem={OFFSET_UNIT_OPTIONS[0]}
              icon="chevronDown"
              name="offsetUnit"
            />
            <span>at the end of</span>
          </div>
          {errors.toAnchorMaxOffsetMins && (
            <div className="cx-text-red-600 cx-mb-2">{errors.toAnchorMaxOffsetMins}</div>
          )}
        </>
      )}
      <AsyncSearchSelect
        className="cx-mb-4"
        name="toJobId"
        key={ignoreIdsString}
        fetchItems={handleGetDependentJobs}
        debounceTime={300}
        onSelectedItemChange={onSelectJob}
        selectedItem={jobDependency.fromJobTemplate ?
          { value: jobDependency.fromJobTemplate.id, label: jobDependency.fromJobTemplate.name } :
          undefined
        }
        useCache={false}
        placeholder="Search for a job"
        icon="chevronDown"
      />
      {errors.fromJobTemplateId && (
        <div className="cx-text-red-600 cx-mb-2">{errors.fromJobTemplateId}</div>
      )}
      <div
        className="cx-flex border-top cx-bg-white cx-bottom-0 cx-sticky cx-justify-end"
      >
        <div>
          <Button buttonType="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button buttonType="primary" className="cx-ml-2" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(JobDependencyForm)
