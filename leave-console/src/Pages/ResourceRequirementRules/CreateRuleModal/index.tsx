import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'
import ResourceRequirementRuleForm from '../../../Components/ResourceRequirementRuleForm'
import { ResourceRequirementRule } from '../../../Store/types/ResourceRequirementRule'

interface ICreateRuleModalProp {
  onClose: () => void
  onSubmit: (data: ResourceRequirementRule) => void
  rule: ResourceRequirementRule | null
}

const ModalHeader: React.FC<ICreateRuleModalProp> = ({ onClose, rule }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">{rule ? 'Edit Rule' : 'New Rule'}</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const CreateRuleModal: React.FC<ICreateRuleModalProp> = props => {
  const { onClose, onSubmit, rule } = props
  return (
    <DynamicModal
      header={<ModalHeader {...props} />}
      className="cx-w-2/4"
    >
      <ResourceRequirementRuleForm rule={rule} onSubmit={onSubmit} onCancel={onClose} />
    </DynamicModal>
  )
}

export default React.memo(CreateRuleModal)
