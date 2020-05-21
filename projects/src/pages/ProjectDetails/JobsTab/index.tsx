import React, { useEffect, useState, memo, useCallback } from 'react'

interface JobsTabProps {
  projectId: string
}

const JobsTab: React.FC<JobsTabProps> = ({ projectId }) => {
  return (
    <div className="cx-p-8">
      Job Tab {projectId}
    </div>
  )
}

export default memo(JobsTab)
