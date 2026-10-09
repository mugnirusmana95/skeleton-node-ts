import { Request } from 'express'

export type TParamsPage = number | undefined
export type TParamsLimit =
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100
  | undefined
type TOrderDirectionType = 'ASC' | 'DESC'
export type TOrderByItem = {
  column: string
  direction: TOrderDirectionType
}
export enum EStatusDelete {
  NONE = 1, //select data without deleted data
  WITH = 2, //select data with deleted data
  ONLY = 3, //select data only deleted data
}

export type TParsedParams = {
  page?: TParamsPage
  limit?: TParamsLimit
  search?: string | undefined
  orderBy: TOrderByItem[]
  statusDelete?: EStatusDelete
  date?: string | undefined
  startDate?: string | undefined
  endDate?: string | undefined
}

export const allowedLimit = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
export const allowedStatusDelete = [1, 2, 3]
export const orderByRegex =
  /^([a-zA-Z0-9_]+,(ASC|DESC))(\|[a-zA-Z0-9_]+,(ASC|DESC))*$/

const toNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const parseLimit = (value: unknown): TParamsLimit => {
  const n = toNumber(value)
  const allowed: TParamsLimit[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  return allowed.includes(n as TParamsLimit) ? (n as TParamsLimit) : undefined
}

const parseStatusDelete = (value: unknown): EStatusDelete => {
  const n = toNumber(value)
  const allowed: EStatusDelete[] = [1, 2, 3]
  return allowed.includes(n as EStatusDelete) ? (n as EStatusDelete) : EStatusDelete.NONE
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

export const parseParams = (req: Request): TParsedParams => {
  const q = req.query

  const page = toNumber(q.page)
  const limit = parseLimit(q.limit)

  const search =
    typeof q.search === 'string' && q.search.trim() !== ''
      ? q.search.trim()
      : undefined

  const orderBy = parseOrderBy(q.orderBy)

  const statusDelete = parseStatusDelete(q.statusDelete)

  const date = typeof q.date === 'string' && q.date ? q.date : undefined

  const startDate =
    typeof q.startDate === 'string' && q.startDate ? q.startDate : undefined

  const endDate =
    typeof q.endDate === 'string' && q.endDate ? q.endDate : undefined

  return {
    page,
    limit,
    search,
    orderBy,
    statusDelete,
    date,
    startDate,
    endDate
  }
}
