import React, { memo } from 'react'
import { IProjectDetail } from '../../../commons/types'
import ProjectForm from '../../../commons/components/ProjectForm'

interface DetailTabModalProp {
  project: IProjectDetail
  onSubmit: (data: IProjectDetail) => void
}

const DetailTab: React.FC<DetailTabModalProp> = ({ project, onSubmit }) => {
  return (
    <div className="cx-px-8 cx-pt-4 detail-tab scroll">
      <ProjectForm project={project} onSubmit={onSubmit} />
    </div>
  )
}

export default memo(DetailTab)
