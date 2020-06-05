import React, { memo } from 'react'

import JobTemplatesList from './JobTemplatesList'
import JobsList from './JobsList'
import { IProjectDetail } from '../../commons/types'

interface IJobsTabProps {
  projectId: string
  project: IProjectDetail
}

const JobsTab: React.FC<IJobsTabProps> = ({ projectId, project }) => {
  if (project.isTemplate) {
    return <JobTemplatesList projectId={projectId} isTemplate={project.isTemplate} />
  }
  return <JobsList projectId={projectId} project={project} />
}
export default memo(JobsTab)
