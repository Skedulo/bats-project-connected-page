import React, { useState, useCallback, memo } from 'react'
import { Button } from '@skedulo/sked-ui'
import { useDispatch } from 'react-redux'

import { Team } from '../../types/Team'
import { createUpdateTeam } from '../../../Services/DataServices'
import { toastMessage } from '../../utils'
import { updateReloadTeamsFlag } from '../../../Store/action'
import { useGlobalLoading } from '../GlobalLoading'

import TeamModal from '../TeamModal'

interface HeaderProps {
  children?: any
}

const Header: React.FC<HeaderProps> = () => {
  const dispatch = useDispatch()
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const toggleCreateModal = useCallback(() => setOpenCreateModal(prev => !prev), [setOpenCreateModal])

  const onSaveTeam = useCallback(async (saveData: Team) => {
    try {
      startGlobalLoading()
      const success = await createUpdateTeam(saveData)
      if (success) {
        dispatch(updateReloadTeamsFlag(true))
      }
    } catch (error) {
      toastMessage.error('Created unsuccessfully!')
    } finally {
      endGlobalLoading()
      toggleCreateModal()
    }
  }, [])

  return (
    <div className="cx-p-4 cx-flex cx-justify-between cx-items-center">
      <h2 className="cx-text-xl">Team Management</h2>
      <div>
        <Button buttonType="primary" onClick={toggleCreateModal}>New Team</Button>
      </div>
      {openCreateModal && <TeamModal onClose={toggleCreateModal} onSubmit={onSaveTeam} />}
    </div>
  )
}

export default memo(Header)
