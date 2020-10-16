import * as React from 'react'
import { SkedFormChildren, SkedFormValidation, FormContext } from '@skedulo/sked-ui'

import { Team } from '../../../types/Team'

import TeamFormChildren from './TeamFormChildren'

const TeamFormConfig = {
  name: { isRequired: 'Name is required' },
  requiredPeople: { isRequired: 'Number of required people is required' },
  regionId: { isRequired: 'Region is required' }
}

interface TeamFormProps {
  team?: Team
  onSubmit: (team: Team) => void
  onCancel?: () => void
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onSubmit, onCancel }) => {
  const handleSubmit = React.useCallback(
    async (form: FormContext<Team>) => {
      const formData = {
        ...form.fields
      }

      const submitData = !team ? { ...formData } : { ...formData, id: team.id }
      onSubmit(submitData)
    },
    [team]
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
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(TeamForm)
