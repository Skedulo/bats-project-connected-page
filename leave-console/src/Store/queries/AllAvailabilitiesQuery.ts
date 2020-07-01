export const AllAvailabilitiesQuery = `
query getAvailabilities ($filters: EQLQueryFilterAvailabilities!) {
  availabilities (filter: $filters) {
    edges {
      node {
        UID
        IsAvailable
        CreatedDate
        Start
        Finish
        Status
        Type
        Notes
        Resource {
          Name
          UID
          Category
          PrimaryRegion {
            Name
          }
          JobAllocations(filter: "Status == 'Confirmed'") {
            UID
            Start
            End
            Status
            Job {
              Name
            }
          }
        }
        Type
      }
    }
  }
}
`

export default AllAvailabilitiesQuery
