import * as React from 'react'

type IdentityFunction = <T>(fn: T) => T

export const typedMemo: IdentityFunction = React.memo

export const getDisplayName = <T extends any = any>(WrappedComponent: React.ComponentType<T>): string => {
  return WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'
}
