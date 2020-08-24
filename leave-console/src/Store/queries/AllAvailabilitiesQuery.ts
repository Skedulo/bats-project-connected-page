export const AllAvailabilitiesQuery = `
query getAvailabilities ($filters: EQLQueryFilterAvailabilities!) {
  availabilities (filter: $filters, orderBy: "Start") {
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
            DepotName
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
