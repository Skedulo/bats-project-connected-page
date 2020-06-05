import React, { useEffect, useState, memo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { IProjectDetail, IRouterParams, IJobTypeTemplateValue } from '../../commons/types'
import { fetchProjectById, updateProject } from '../../Services/DataServices'
import { useGlobalLoading, LoadingTrigger } from '../../commons/components/GlobalLoading'
import { Icon, Tabs } from '@skedulo/sked-ui'
import { PROJECT_TAB_OPTIONS, PROJECT_TAB_ROUTES } from '../../commons/constants'
import DetailTab from './DetailTab'
import JobsTab from '../JobsTab'

interface IProjectDetailProps {
  isOpen?: boolean
}

const ProjectDetail: React.FC<IProjectDetailProps> = () => {
  const params = useParams<IRouterParams>()
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const [activeTab, setActiveTab] = useState<string>(PROJECT_TAB_ROUTES.DETAILS)
  const [project, setProject] = useState<IProjectDetail | null>(null)

  const getProjectById = useCallback(async (projectId: string) => {
    startGlobalLoading()
    const res = await fetchProjectById(projectId)
    setProject({ ...res })
    endGlobalLoading()
  }, [])

  const onChangeTab = useCallback((tab: string) => setActiveTab(tab), [])

  const onSaveProject = useCallback(async (data: any) => {
    try {
      startGlobalLoading()
      const res = await updateProject(data)
      setProject({ ...res })
    } catch (error) {
      console.log('error: ', error)
    } finally {
      endGlobalLoading()
    }
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
    <div className="crud-full-page">
      <div className="flex flex--vertical">
        <div className="section-header crud-full-page__header cx-pb-0">
          <Link to="/" className="cx-flex">
            <Icon name="chevronLeft" className="breadcrumb__icon" />
            <span className="breadcrumb__link capitalize">Projects</span>
          </Link>
          <div>
            <div className="cx-flex cx-justify-between cx-mb-4">
              <h1 className="cx-text-xl cx-font-semibold" data-sk-name="crud-details-page-title">
                {project.projectName}
              </h1>
              {/* <button data-sk-name="delete" className="sk-button-icon transparent" onClick={toggleConfirmDelete}>
                <Icon name="trash" className="cx-text-neutral-500" />
              </button> */}
            </div>
            <p className="cx-text-sm cx-text-neutral-700 cx-mb-4" data-sk-name="crud-details-page-title">
              {project.projectDescription}
            </p>
          </div>
          <Tabs tabs={PROJECT_TAB_OPTIONS} currentActiveRoute={activeTab} onClick={onChangeTab} />
        </div>
        {activeTab === PROJECT_TAB_ROUTES.DETAILS && <DetailTab project={project} onSubmit={onSaveProject} />}
        {activeTab === PROJECT_TAB_ROUTES.JOBS && (
          <JobsTab projectId={params.projectId || ''} project={project} />
        )}
      </div>
    </div>
  )
}

export default memo(ProjectDetail)
