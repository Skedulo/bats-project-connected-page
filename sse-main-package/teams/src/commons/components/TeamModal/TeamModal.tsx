import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'

import { Team } from '../../types/Team'

import TeamForm from './TeamForm'

interface CreateTeamModalProp {
  onClose: () => void
  team?: Team
}

interface IModalHeaderProp {
  onClose: () => void
  team?: Team
}

const ModalHeader: React.FC<IModalHeaderProp> = ({ onClose, team }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between">
      <h2 className="cx-font-semibold">{team?.id ? 'Edit Team' : 'New Team'}</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

const CreateTeamModal: React.FC<CreateTeamModalProp> = (props) => {
  const { onClose, team } = props

  return (
    <DynamicModal
      header={<ModalHeader onClose={onClose} team={team} />}
      className="cx-w-2/4"
    >
      <TeamForm
        onCancel={onClose}
        team={team}
      />
    </DynamicModal>
  )
}

export default React.memo(CreateTeamModal)
