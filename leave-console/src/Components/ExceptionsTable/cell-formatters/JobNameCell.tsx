import React, { memo, useCallback } from 'react'
import { jobDetail } from '../../../Pages/routes'

interface JobNameCellProps {
  name: string
  description: string
  id: string
}

const JobNameCell: React.FC<JobNameCellProps> = ({ name, description, id }) => {
  const handleViewJob = useCallback(() => {
    window.top.window.location.href = jobDetail(id)
  }, [id])

  return (
    <div className="cx-cursor-pointer" onClick={handleViewJob}>
      <div className="cx-text-primary">{name}</div>
      <div className="cx-text-neutral-600">{description}</div>
    </div>
  )
}

export default memo(JobNameCell)
