import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'
import JobTemplateForm from '../../../commons/components/JobTemplateForm'
import { IJobTemplateDetail } from '../../../commons/types/jobTemplate'


interface JobTemplateDetailModalProp {
  onClose: () => void
  onSubmit: (data: IJobTemplateDetail) => void
}

interface ModalHeaderProp {
  onClose: () => void
}

const ModalHeader: React.FC<ModalHeaderProp> = ({ onClose }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">New Job Template</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const JobTemplateDetailModal: React.FC<JobTemplateDetailModalProp> = ({ onClose, onSubmit }) => {

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} />}
      className="cx-w-2/4"
    >
      <JobTemplateForm onSubmit={onSubmit} onCancel={onClose} />
    </DynamicModal>
  )
}

export default React.memo(JobTemplateDetailModal)
