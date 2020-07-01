export const ResourceRequirementRulesQuery = `
{
  jobs {
    edges {
      node {
        UID
        Name
        Description
        Account {
          Name
          Contacts {
            Account {
              Name
            }
          }
        }
        Type
        Address
      }
    }
  }
}
`

export default ResourceRequirementRulesQuery
