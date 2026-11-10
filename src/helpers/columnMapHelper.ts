export const columnMapOf =
  <T>(alias: string) =>
    <K extends keyof T & string, P extends string = ''>(
      keys: readonly K[],
      prefix?: P,
    ) =>
      Object.fromEntries(
        keys.map((key) => [
          prefix ? `${prefix}${key[0].toUpperCase()}${key.slice(1)}` : key,
          `${alias}.${key}`,
        ]),
      ) as {
        [Key in K as P extends '' ? Key : `${P}${Capitalize<Key>}`]: string
      }