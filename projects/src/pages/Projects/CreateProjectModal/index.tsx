import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'
import ProjectForm from '../../../commons/components/ProjectForm'
import { IProjectDetail } from '../../../commons/types';

interface CreateProjectModalProp {
  onClose: () => void
  onSubmit: (data: IProjectDetail) => void
}

interface ModalHeaderProp {
  onClose: () => void
}

const ModalHeader: React.FC<ModalHeaderProp> = ({ onClose }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">New Project</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const CreateProjectModal: React.FC<CreateProjectModalProp> = ({ onClose, onSubmit }) => {

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} />}
      className="cx-w-2/4"
    >
      <ProjectForm onSubmit={onSubmit} onCancel={onClose} />
    </DynamicModal>
  )
}

export default React.memo(CreateProjectModal)
