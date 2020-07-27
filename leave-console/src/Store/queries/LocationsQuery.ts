export const LocationsQuery = `
query getLocations ($filters: EQLQueryFilterDepot!) {
  depot (filter: $filters) {
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
