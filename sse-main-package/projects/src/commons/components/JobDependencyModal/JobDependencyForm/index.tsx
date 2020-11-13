import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation, ISelectItem } from '@skedulo/sked-ui'
import JobDependencyFormChildren from './JobDependencyFormChildren'
import { IJobDependency, IJobConstraint } from '../../../types'

const JobDependencyFormConfig = {
  jobType: { isRequired: 'Job type is required' },
  description: {},
  jobConstraints: {},
  resourceId: {}
}

interface IJobDependencyFormProps {
  jobDependency: IJobDependency | null
  onSubmit: (jobDependency: IJobDependency) => void
  onCancel?: () => void
  projectId: string
}

const JobDependencyForm: React.FC<IJobDependencyFormProps> = ({
  jobDependency,
  onSubmit,
  onCancel,
  projectId
}) => {
  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<IJobDependency>) => {
      // let hasError = false
      // let validatedJobConstraints: IJobConstraint[] = []
      // if (jobConstraints.length) {
      //   validatedJobConstraints = jobConstraints.map((item, index) => {
      //     const jobId = item.dependentJobId || item.dependentJob?.id
      //     const duplicatedJobId = jobConstraints.find(
      //       (jc, jcIndex) =>
      //         (jc.dependentJobId || jc.dependentJob?.id) === jobId && jcIndex !== index && !jc.action && !item.action
      //     )
      //     if (!item.constraintType || !item.dependencyType || !jobId) {
      //       hasError = true
      //       return {
      //         ...item,
      //         error: 'Constraint is invalid',
      //       }
      //     }
      //     if (duplicatedJobId) {
      //       hasError = true
      //       return {
      //         ...item,
      //         error: 'Dependent job is duplicated',
      //       }
      //     }
      //     return item
      //   })
      // }
      // if (hasError) {
      //   setJobConstraints(validatedJobConstraints)
      //   return
      // }
      const submitData = {
        ...jobDependency,
        ...form.fields,
        // jobConstraints: jobConstraints.map(item =>
        //   omit(['tempId', 'error', 'sObjectType', 'projectJobDependencyId'], item)
        // ),
      }
      onSubmit(submitData)
    },
    [jobDependency]
  )

  return (
    <SkedFormValidation
      config={JobDependencyFormConfig}
      options={{ clickToEdit: false }}
      onSubmit={handleSubmit}
      initialValues={jobDependency || { jobConstraints: [] }}
    >
      {(formParams: SkedFormChildren<IJobDependency>) => (
        <JobDependencyFormChildren
          formParams={formParams}
          onCancel={onCancel}
          jobDependency={jobDependency}
          projectId={projectId}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(JobDependencyForm)
