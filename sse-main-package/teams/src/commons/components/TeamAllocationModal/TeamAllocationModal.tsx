import * as React from 'react'
import { DynamicModal, Icon } from '@skedulo/sked-ui'

import TeamAllocationModalBody from './TeamAllocationModalBody'

import './styles.scss'

interface TeamAllocationModalHeaderProp {
  onClose: () => void
}

const TeamAllocationModalHeader: React.FC<TeamAllocationModalHeaderProp> = ({ onClose }) => {
  return (
    <div className="cx-p-4 cx-flex cx-items-center cx-justify-between cx-border-b ">
      <h2 className="cx-font-semibold cx-text-xl">Select Team Member</h2>
      <Icon className="cx-cursor-pointer" name="close" onClick={onClose} />
    </div>
  )
}

interface TeamAllocationModalProp {
  onClose: () => void
}

const TeamAllocationModal: React.FC<TeamAllocationModalProp> = (props) => {
  const { onClose } = props

  return (
    <DynamicModal
      header={<TeamAllocationModalHeader onClose={onClose} />}
      className="cx-w-full cx-h-full cx-top-0 cx-max-h-full"
    >
      <TeamAllocationModalBody />
    </DynamicModal>
  )
}

export default React.memo(TeamAllocationModal)
