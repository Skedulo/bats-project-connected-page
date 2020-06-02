import React, { memo } from 'react'

import JobTemplatesList from './JobTemplatesList'
import JobsList from './JobsList'

interface IJobsTabProps {
  projectId: string
  isTemplate: boolean
}

const JobsTab: React.FC<IJobsTabProps> = ({ projectId, isTemplate }) => {
  if (isTemplate) {
    return <JobTemplatesList projectId={projectId} isTemplate={isTemplate} />
  }
  return <JobsList projectId={projectId} isTemplate={isTemplate} />
}
export default memo(JobsTab)
