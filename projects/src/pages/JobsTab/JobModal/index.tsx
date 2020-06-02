import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'
import ProjectForm from '../../../commons/components/ProjectForm'
import { IJobDetail, IJobTemplate } from '../../../commons/types'

interface IJobModalProp {
  onClose: () => void
  onSubmit: (data: IJobTemplate) => void
  job: IJobTemplate | null
}

interface IModalHeaderProp {
  onClose: () => void
}

const ModalHeader: React.FC<IModalHeaderProp> = ({ onClose, job }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">{job?.id ? 'New Job' : 'New Job'}</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const JobModal: React.FC<IJobModalProp> = ({ onClose, onSubmit, job }) => {

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} />}
      className="cx-w-2/4"
    >
      <ProjectForm onSubmit={onSubmit} onCancel={onClose} />
    </DynamicModal>
  )
}

export default React.memo(JobModal)
