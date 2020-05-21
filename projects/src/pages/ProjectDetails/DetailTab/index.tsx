import React, { useEffect, useState, memo, useCallback } from 'react'
import { ProjectDetailInterface, RouterParamsInterface } from '../../../commons/types'
import ProjectForm from '../../../commons/components/ProjectForm'

interface DetailTabModalProp {
  project: ProjectDetailInterface
  onSubmit: (data: ProjectDetailInterface) => void
}

const DetailTab: React.FC<DetailTabModalProp> = ({ project, onSubmit }) => {
  return (
    <div className="cx-p-8">
      <ProjectForm project={project} onSubmit={onSubmit} />
    </div>
  )
}

export default memo(DetailTab)
