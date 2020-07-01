interface Keyed<T> { [key: string]: unknown }

export const insertByKey = <T extends Keyed<T>>(stateData: T[], key: keyof T ,toInsert: Keyed<T>) => {
  const index = stateData.findIndex(element => element[key] === toInsert[key as string])
  if (index === -1) { return stateData }
  return [
    ...stateData.slice(0, index),
    { ...stateData[index] as T, ...toInsert },
    ...stateData.slice(index + 1)
  ]
}

export default insertByKey
