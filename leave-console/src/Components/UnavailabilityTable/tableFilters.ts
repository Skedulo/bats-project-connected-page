import { get as _get } from 'lodash'

import { Availability, UnavailabilityTableItem } from '../../Store/types'

export const searchableFieldsPaths = [
  'Resource.Name',
  'Resource.PrimaryRegion.Name',
  'Status'
]

export const isAvailabilitySearchedFor = (availability: Availability, lowerSearchPhrase: string) => {
  return searchableFieldsPaths.some(fieldPath => {
    const value = _get(availability, fieldPath)
    if (value === undefined || value === null) return false

    return String(value).toLowerCase().indexOf(lowerSearchPhrase) > -1
  })
}

export const filterBySearchPhrase = (
  availabilities: Availability[],
  searchPhrase: string
) => {
  const lowerSearchPhrase = searchPhrase.toLowerCase()
  const filteredUnavailability = availabilities.filter(availabilities => isAvailabilitySearchedFor(availabilities, lowerSearchPhrase))

  return filteredUnavailability as UnavailabilityTableItem[]
}
