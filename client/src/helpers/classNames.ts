export type Mods = Record<string, boolean | string | undefined>

export function classNames(
  cls: string,
  mods: Mods = {},
  aditional: Array<string | undefined> = []
): string {
  return [
    cls,
    ...aditional.filter(Boolean),
    ...Object.entries(mods)
      .filter(([_key, value]) => !!value)
      .map(([key, _value]) => key),
  ].join(' ')
}
