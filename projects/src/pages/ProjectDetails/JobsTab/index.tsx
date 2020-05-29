import React, { useEffect, useState, memo, useCallback } from 'react'
interface IJobsTabProps {
  projectId: string
}

const JobsTab: React.FC<IJobsTabProps> = ({ projectId }) => {
  const action = (item: any) => {
    console.log('item: ', item);
  }
  return (
    <div className="cx-p-8">
      Job Tab {projectId}
    </div>
  )
}

export default memo(JobsTab)
