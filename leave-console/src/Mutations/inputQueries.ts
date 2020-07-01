export const updateAvailabilityQuery = `
  mutation updateAvailabilities($updateInput: UpdateAvailabilities!) {
    schema {
      updateAvailabilities(input: $updateInput)
    }
  }
`
