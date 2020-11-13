import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'
import JobTemplateForm from './JobTemplateForm'
import { IJobTemplate } from '../../../commons/types'

interface IJobTemplateModalProp {
  onClose: () => void
  onSubmit: (data: IJobTemplate) => void
  jobTemplate: IJobTemplate | null
  totalJobTemplates: number
  projectId: string
  projectRegionId: string
  onDelete: (id: string) => void
}

interface IModalHeaderProp {
  onClose: () => void
  title: string
}

const ModalHeader: React.FC<IModalHeaderProp> = ({ onClose, title }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">{title}</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const JobTemplateModal: React.FC<IJobTemplateModalProp> = ({
  onClose,
  onSubmit,
  jobTemplate,
  totalJobTemplates,
  projectId,
  projectRegionId,
  onDelete
}) => {
  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} title={jobTemplate?.id ? 'Edit Job Template' : 'New Job Template'} />}
      className="cx-w-2/4"
    >
      <JobTemplateForm
        onSubmit={onSubmit}
        onCancel={onClose}
        jobTemplate={jobTemplate}
        totalJobTemplates={totalJobTemplates}
        projectId={projectId}
        projectRegionId={projectRegionId}
        onDelete={onDelete}
      />
    </DynamicModal>
  )
}

export default React.memo(JobTemplateModal)
