import * as React from 'react'
import { SkedFormChildren, SkedFormValidation, FormContext, ConfirmationModal } from '@skedulo/sked-ui'
import { pick, mapValues, omit } from 'lodash'
import { useDispatch } from 'react-redux'

import { Team, TeamRequirement } from '../../../types/Team'

import { DEFAULT_PALETTE_COLORS } from '../../../constants'
import { createUpdateTeam, deactivateTeam } from '../../../../Services/DataServices'
import { updateReloadTeamsFlag } from '../../../../Store/action'
import { toastMessage } from '../../../utils'
import { useGlobalLoading } from '../../GlobalLoading'

import TeamFormChildren from './TeamFormChildren'

const TeamFormConfig = {
  name: { isRequired: 'Name is required' },
  regionId: { isRequired: 'Region is required' },
  teamColour: {}
}

interface TeamFormProps {
  team?: Team
  onSubmit?: (team: Team) => void
  onCancel: () => void
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onCancel }) => {
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const dispatch = useDispatch()
  const defaultTeamRequirements = React.useMemo(() => {
    const existedTeamRequirements = team?.teamRequirements?.map(item => ({
      id: item.id,
      tags: item.tags?.map(tag => ({ tagId: tag.tag?.id, name: tag.tag?.name })),
      preferredResourceId: item.preferredResource?.id || '',
      preferredResource: item.preferredResource
    }))
    return existedTeamRequirements || [
      { tags: [], preferredResourceId: '' },
      { tags: [], preferredResourceId: '' }
    ]
  }, [team])

  const [teamRequirements, setTeamRequirements] = React.useState<TeamRequirement[]>(defaultTeamRequirements)
  const [openConfirmModal, setOpenConfirmModal] = React.useState<boolean>(false)

  const toggleConfirmModal = React.useCallback(() => setOpenConfirmModal(prev => !prev), [])

  const handleSubmit = React.useCallback(
    async (form: FormContext<Team>) => {
      try {
        startGlobalLoading()
        const formattedTeamRequirements = teamRequirements.map(item => {
          const formattedObj = mapValues(pick(item, ['tags', 'preferredResourceId', 'id']), value => {
            if (!value || (Array.isArray(value) && !value.length)) {
              return null
            }
            return value
          })

          return formattedObj.id ? formattedObj : omit(formattedObj, 'id')
        })

        const formData = {
          ...form.fields,
          teamColour: form.fields.teamColour || DEFAULT_PALETTE_COLORS[0],
          teamRequirements: formattedTeamRequirements as TeamRequirement[]
        }

        const submitData = !team ? { ...formData } : { ...formData, id: team.id }

        const success = await createUpdateTeam(submitData)
        if (success) {
          dispatch(updateReloadTeamsFlag(true))
        }
      } catch (error) {
        toastMessage.error('Created unsuccessfully!')
      } finally {
        endGlobalLoading()
        onCancel()
      }
    },
    [team, teamRequirements]
  )

  const handleDeactivate = React.useCallback(
    async () => {
      if (!team?.id) {
        return
      }
      toggleConfirmModal()
      try {
        startGlobalLoading()
        const success = await deactivateTeam(team.id)
        if (success) {
          dispatch(updateReloadTeamsFlag(true))
        }
      } catch (error) {
        toastMessage.error('Deactivated unsuccessfully!')
      } finally {
        endGlobalLoading()
        onCancel()
      }
    },
    [team]
  )

  return (
    <>
      <SkedFormValidation
        config={TeamFormConfig}
        options={{ clickToEdit: !!team?.id }}
        onSubmit={handleSubmit}
        initialValues={team ? { ...team, regionId: team.region?.id || '' } : undefined}
        key={team?.id}
      >
        {(formParams: SkedFormChildren<Team>) => (
          <TeamFormChildren
            formParams={formParams}
            onCancel={onCancel}
            team={team}
            teamRequirements={teamRequirements}
            setTeamRequirements={setTeamRequirements}
            toggleConfirmModal={toggleConfirmModal}
          />
        )}
      </SkedFormValidation>
      {openConfirmModal && (
        <ConfirmationModal
          onCancel={toggleConfirmModal}
          onConfirm={handleDeactivate}
        >
          Are you sure you want to deactivate this team?
        </ConfirmationModal>
      )}
    </>
  )
}

export default React.memo(TeamForm)
