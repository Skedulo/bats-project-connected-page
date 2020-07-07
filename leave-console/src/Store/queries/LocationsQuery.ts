export const LocationsQuery = `
query getLocations ($filters: EQLQueryFilterLocations!) {
  locations (filter: $filters) {
    edges {
      node {
        UID
        Name
      }
    }
  }
}
`

export default LocationsQuery
