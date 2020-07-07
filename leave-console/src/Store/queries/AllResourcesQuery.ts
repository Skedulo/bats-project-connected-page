export const AllResourcesQuery = `
{
  resources (filter: "IsActive == true") {
    totalCount
    pageInfo {
      hasNextPage
    }
    edges {
      node {
        UID
        Name
        WorkingHourType
        Category
        Rating
        ResourceTags {
          Tag {
            UID
            Name
          }
        }
        ResourceRegions {
          Region {
            UID
            Name
          }
        }
        PrimaryRegion {
          Name
          UID
        }
        User {
          UID
          SmallPhotoUrl
          FullPhotoUrl
        }
      }
    }
  }
}
`

export default AllResourcesQuery
