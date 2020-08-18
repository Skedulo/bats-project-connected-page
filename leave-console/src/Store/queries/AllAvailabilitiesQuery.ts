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
          JobAllocations(filter: "Status != 'Deleted' AND Start != null AND End != null") {
            UID
            Start
            End
            Status
            Job {
              Name
            }
          }
          CountryCode
          MobilePhone
          NotificationType
          AnnualLeaveAllowance
          AnnualLeaveRemaining
        }
      }
    }
  }
}
`

export default AllAvailabilitiesQuery
