const kmMiMultiplier = 1.609

export const kilometersToMiles = (kmDistance: number) => {
  return kmDistance / kmMiMultiplier
}

export const milesToKilometers = (miDistance: number) => {
  return miDistance * kmMiMultiplier
}

export const kilometersToMeters = (kmDistance: number) => {
  return kmDistance * 1000
}

export const milesToMeters = (miDistance: number) => {
  return kilometersToMeters(milesToKilometers(miDistance))
}

export const metersToKilometers = (mDistance: number) => {
  return mDistance / 1000
}

export const metersToMiles = (mDistance: number) => {
  return kilometersToMiles(metersToKilometers(mDistance))
}
