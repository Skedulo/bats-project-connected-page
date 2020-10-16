import React, { useEffect, useState, useCallback, memo, useMemo, useContext } from 'react'
import { Button } from '@skedulo/sked-ui'
import TeamModal from '../TeamModal'

interface HeaderProps {
  children?: any
}

const Header: React.FC<HeaderProps> = () => {
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const toggleCreateModal = useCallback(() => setOpenCreateModal(prev => !prev), [setOpenCreateModal])

  return (
    <div className="cx-p-4 cx-flex cx-justify-between cx-items-center">
      <h2 className="cx-text-xl">Team Management</h2>
      <div>
        <Button buttonType="primary" onClick={toggleCreateModal}>New Team</Button>
      </div>
      {openCreateModal && <TeamModal onClose={toggleCreateModal} onSubmit={toggleCreateModal} />}
    </div>
  )
}

export default memo(Header)
