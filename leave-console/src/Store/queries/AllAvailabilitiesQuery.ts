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
          CoreSkill
          Depot {
            UID
            Name
          }
          PrimaryRegion {
            Name
          }
          JobAllocations(filter: "Status != 'Deleted'") {
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
