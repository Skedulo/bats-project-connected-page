import * as React from 'react'
import { SkedFormChildren, SkedFormValidation, FormContext } from '@skedulo/sked-ui'
import { pick, mapValues } from 'lodash'

import { Team, TeamRequirement } from '../../../types/Team'

import TeamFormChildren from './TeamFormChildren'

const TeamFormConfig = {
  name: { isRequired: 'Name is required' },
  regionId: { isRequired: 'Region is required' }
}

interface TeamFormProps {
  team?: Team
  onSubmit: (team: Team) => void
  onCancel?: () => void
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onSubmit, onCancel }) => {
  const [teamRequirements, setTeamRequirements] = React.useState<TeamRequirement[]>([
    { tags: [], preferredResourceId: '' },
    { tags: [], preferredResourceId: '' }
  ])

  const handleSubmit = React.useCallback(
    async (form: FormContext<Team>) => {
      const formattedTeamRequirements = teamRequirements.map(item => mapValues(pick(item, ['tags', 'preferredResourceId']), value => {
        if (!value || (Array.isArray(value) && !value.length)) {
          return null
        }
        return value
      }))
      const formData = {
        ...form.fields,
        teamRequirements: formattedTeamRequirements as TeamRequirement[]
      }

      const submitData = !team ? { ...formData } : { ...formData, id: team.id }
      onSubmit(submitData)
    },
    [team, teamRequirements]
  )

  return (
    <SkedFormValidation
      config={TeamFormConfig}
      options={{ clickToEdit: !!team?.id }}
      onSubmit={handleSubmit}
      initialValues={team || undefined}
      key={team?.id}
    >
      {(formParams: SkedFormChildren<Team>) => (
        <TeamFormChildren
          formParams={formParams}
          onCancel={onCancel}
          team={team}
          teamRequirements={teamRequirements}
          setTeamRequirements={setTeamRequirements}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(TeamForm)
