import React, { useEffect, useState, memo, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { IProjectDetail, IRouterParams, ProjectStatusKey } from '../../commons/types'
import { fetchProjectById, updateProject } from '../../Services/DataServices'
import { useGlobalLoading, LoadingTrigger } from '../../commons/components/GlobalLoading'
import { Icon, Tabs, Lozenge } from '@skedulo/sked-ui'
import { PROJECT_TAB_OPTIONS, PROJECT_TAB_ROUTES, PROJECT_TEMPLATE_TAB_OPTIONS, PROJECT_STATUS_COLOR } from '../../commons/constants'
import DetailTab from './DetailTab'
import JobsTab from '../JobsTab'
import ScheduleTab from '../ScheduleTab'

const ProjectDetail: React.FC = () => {
  const params = useParams<IRouterParams>()

  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const [activeTab, setActiveTab] = useState<string>(PROJECT_TAB_ROUTES.DETAILS)

  const [project, setProject] = useState<IProjectDetail | null>(null)

  const tabOptions = useMemo(() => project?.isTemplate ? PROJECT_TEMPLATE_TAB_OPTIONS : PROJECT_TAB_OPTIONS, [project])

  const statusColor = PROJECT_STATUS_COLOR[project?.projectStatus as ProjectStatusKey] || 'neutral'

  const getProjectById = useCallback(async (projectId: string) => {
    startGlobalLoading()
    const res = await fetchProjectById(projectId)
    setProject({ ...res })
    endGlobalLoading()
  }, [])

  const onChangeTab = useCallback((tab: string) => setActiveTab(tab), [])

  const onSaveProject = useCallback(async (data: any) => {
    startGlobalLoading()
    const res = await updateProject(data)
    setProject({ ...res })
    endGlobalLoading()
  }, [])

  useEffect(() => {
    if (params?.projectId) {
      getProjectById(params.projectId)
    }
  }, [params.projectId])

  if (!project) {
    return <LoadingTrigger />
  }

  return (
    <div className="cx-flex cx-flex-col cx-h-full">
      <div className="cx-sticky cx-top-0 cx-bg-white cx-z-10">
        <div className="cx-p-8 cx-pb-0">
          <Link to="/" className="cx-flex cx-items-center">
            <Icon name="chevronLeft" className="cx-text-primary" />
            <span className="cx-text-primary cx-capitalize">Projects</span>
          </Link>
          <div>
            <div className="cx-flex cx-justify-start cx-items-center cx-mb-4">
              <h1 className="cx-text-xl cx-font-semibold cx-mr-4">
                {project.projectName}
              </h1>
              {project.projectStatus && (
                <Lozenge label={project.projectStatus} color={statusColor} solid={false} border={false} />
              )}
            </div>
            <p className="cx-text-sm cx-text-neutral-700 cx-mb-4">
              {project.projectDescription}
            </p>
          </div>
        </div>
        <Tabs tabs={tabOptions} currentActiveRoute={activeTab} onClick={onChangeTab} />
      </div>
      {activeTab === PROJECT_TAB_ROUTES.DETAILS && <DetailTab project={project} onSubmit={onSaveProject} />}
      {activeTab === PROJECT_TAB_ROUTES.JOBS && <JobsTab project={project} />}
      {activeTab === PROJECT_TAB_ROUTES.SCHEDULE && <ScheduleTab project={project} />}
    </div>
  )
}

export default memo(ProjectDetail)
