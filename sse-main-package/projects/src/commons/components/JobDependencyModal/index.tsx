import * as React from 'react'
import { DynamicModal, Icon, ISelectItem } from '@skedulo/sked-ui'
import JobDependencyForm from './JobDependencyForm'
import { IJobDependency } from '../../types'

interface IJobDependencyModalProp {
  onClose: () => void
  onSubmit: (data: IJobDependency) => void
  jobDependency: IJobDependency | null
  projectId: string
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

const JobDependencyModal: React.FC<IJobDependencyModalProp> = ({
  onClose,
  onSubmit,
  jobDependency,
  projectId,
}) => {
  return (
    <DynamicModal
      header={(
        <ModalHeader
          onClose={onClose}
          title={jobDependency?.id ? 'Edit Job Dependency' : 'New Job Dependency'}
        />
      )}
      className="cx-w-2/4"
    >
      <JobDependencyForm
        onSubmit={onSubmit}
        onCancel={onClose}
        jobDependency={jobDependency}
        projectId={projectId}
      />
    </DynamicModal>
  )
}

export default React.memo(JobDependencyModal)
