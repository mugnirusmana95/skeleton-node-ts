import moment from "moment"

export type TParamsPage = number | undefined

export const ALLOWED_LIMITS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const
export type TParamsLimit = (typeof ALLOWED_LIMITS)[number] | undefined

export type TOrderDirectionType = 'ASC' | 'DESC'
export type TOrderByItem = {
  column: string
  direction: TOrderDirectionType
}
export enum EStatusDelete {
  NONE = 1, // select data without deleted data
  WITH = 2, // select data with deleted data
  ONLY = 3, // select data only deleted data
}

export type TParsedParams = {
  page?: TParamsPage
  limit?: TParamsLimit
  search?: string | undefined
  orderBy: TOrderByItem[]
  statusDelete?: EStatusDelete
  code?: string | number | undefined
  isActive?: boolean | undefined
  date?: Date | undefined
  startDate?: Date | undefined
  endDate?: Date | undefined
  roleId?: string | undefined
  countryId?: string | undefined
  provinceId?: string | undefined
  regencyId?: string | undefined
  districtId?: string | undefined
  villageId?: string | undefined
  zipCodeId?: string | undefined
  userId?: string | undefined
}

export const allowedStatusDelete = Object.values(EStatusDelete)
  .filter((val): val is number => typeof val === 'number')

export const allowedTextStatusDelete = Object.keys(EStatusDelete)
  .filter((key) => isNaN(Number(key)))
  .map((key) => `${EStatusDelete[key as keyof typeof EStatusDelete]} = ${key}`)
  .join(', ')

export const orderByRegex =
  /^([a-zA-Z0-9_]+,(ASC|DESC))(\|[a-zA-Z0-9_]+,(ASC|DESC))*$/

const toNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const parseLimit = (value: unknown): TParamsLimit => {
  const n = toNumber(value)

  return ALLOWED_LIMITS.includes(n as (typeof ALLOWED_LIMITS)[number])
    ? (n as TParamsLimit)
    : undefined
}

const parseStatusDelete = (value: unknown): EStatusDelete => {
  const n = toNumber(value)

  if (n === undefined) {
    return EStatusDelete.NONE
  }

  return allowedStatusDelete.includes(n)
    ? (n as EStatusDelete)
    : EStatusDelete.NONE
}

const parseOrderBy = (value: unknown): TOrderByItem[] => {
  if (typeof value !== 'string' || value.trim() === '') return []
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [column, direction] = item.split(',')
      return {
        column: column?.trim() || '',
        direction:
          direction?.trim().toUpperCase() === 'DESC'
            ? 'DESC'
            : ('ASC' as TOrderDirectionType),
      }
    })
    .filter((item) => item.column.length > 0)
}

export const parseParams = (req: Req): TParsedParams => {
  const q = req.query

  const page = toNumber(q.page)
  const limit = parseLimit(q.limit)

  const search =
    typeof q.search === 'string' && q.search.trim() !== ''
      ? q.search.trim()
      : undefined

  const orderBy = parseOrderBy(q.orderBy)

  const statusDelete = parseStatusDelete(q.statusDelete)

  const code =
    q.code
      ? typeof q.code === 'string'
        ? String(q.code)
        : typeof q.code === 'number'
          ? Number(q.code)
          : undefined
      : undefined

  const isActive =
    q.isActive
      ? String(q.isActive).toLowerCase() === "true"
        ? true
        : String(q.isActive).toLowerCase() === "false"
          ? false
          : undefined
      : undefined

  const date =
    q.date && moment(String(q.date)).isValid()
      ? moment(String(q.date)).toDate()
      : undefined

  const startDate =
    q.startDate && moment(String(q.startDate)).isValid()
      ? moment(String(q.startDate)).toDate()
      : undefined

  const endDate =
    q.endDate && moment(String(q.endDate)).isValid()
      ? moment(String(q.endDate)).toDate()
      : undefined

  const roleId =
    q.roleId && typeof q.roleId === 'string'
      ? q.roleId
      : undefined

  const userId =
    q.userId && typeof q.userId === 'string'
      ? q.userId
      : undefined

  const countryId =
    q.countryId && typeof q.countryId === 'string'
      ? q.countryId
      : undefined

  const provinceId =
    q.provinceId && typeof q.provinceId === 'string'
      ? q.provinceId
      : undefined

  const regencyId =
    q.regencyId && typeof q.regencyId === 'string'
      ? q.regencyId
      : undefined

  const districtId =
    q.districtId && typeof q.districtId === 'string'
      ? q.districtId
      : undefined

  const villageId =
    q.villageId && typeof q.villageId === 'string'
      ? q.villageId
      : undefined

  const zipCodeId =
    q.zipCodeId && typeof q.zipCodeId === 'string'
      ? q.zipCodeId
      : undefined

  return {
    page,
    limit,
    search,
    orderBy,
    statusDelete,
    code,
    isActive,
    date,
    startDate,
    endDate,
    roleId,
    userId,
    countryId,
    provinceId,
    regencyId,
    districtId,
    villageId,
    zipCodeId
  }
}
