import React, { memo } from 'react'

import JobTemplatesList from './JobTemplatesList'
import JobsList from './JobsList'
import { IProjectDetail } from '../../commons/types'

interface IJobsTabProps {
  project: IProjectDetail
}

const JobsTab: React.FC<IJobsTabProps> = ({ project }) => {
  if (project.isTemplate) {
    return <JobTemplatesList projectId={project.id} isTemplate={project.isTemplate} />
  }
  return <JobsList project={project} />
}
export default memo(JobsTab)
