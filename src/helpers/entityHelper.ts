import { SelectQueryBuilder, ObjectLiteral } from 'typeorm'

type TRelationName = {
  relation: string
  alias: string
}

type TArrayRelationType =
  | [TRelationName, ...TRelationName[]]
  | null
  | undefined

export type TStringKey<T> = Extract<keyof T, string>

export type TDynamicCondition = {
  condition: string
  value?: Record<string, unknown>
}

export type TDynamicOrderBy = {
  orderBy: string,
  direction?: 'ASC' | 'DESC'
}

type TArrayOrderByType =
  | [TDynamicOrderBy, ...TDynamicOrderBy[]]
  | null
  | undefined

type TArrayGroupByType =
  | [string, ...string[]]
  | null
  | undefined
type TArrayColumnType =
  | [string, ...string[]]
  | null
  | undefined

export type TDynamicQueryOptions = {
  where: TDynamicCondition
  withSelect?: TArrayColumnType
  withRelation?: TArrayRelationType
  withDeleted?: boolean
  withGroupBy?: TArrayGroupByType
}

export type TDynamicQueryOptionsGet = TDynamicQueryOptions & {
  withOrderBy?: TArrayOrderByType
}

export type TDynamicQueryDeleteOptions = TDynamicQueryOptions & {
  permanentDelete?: boolean
}

export type TDynamicFieldValue<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = {
  field: K
  value: T[K]
}

export type TDynamicFieldValueWithSelect<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  withSelect?: TArrayColumnType
}

export type TDynamicFieldValueWithRelation<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  withRelation?: TArrayRelationType
}

export type TDynamicFieldValueWithDeleted<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  withDeleted?: boolean
}

export type TDynamicFieldValueWithOrderBy<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  withOrderBy?: TArrayOrderByType
}

export type TDynamicFieldValueWithGroupBy<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  withGroupBy?: TArrayGroupByType
}

export type TDynamicFieldValueDeleteOption<
  T,
  K extends TStringKey<T> = TStringKey<T>,
> = TDynamicFieldValue<T, K> & {
  permanentDelete?: boolean
}

export default {
  select: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    selections: TArrayColumnType,
    defaultSelect?: string
  ): SelectQueryBuilder<T> => {
    if (selections && selections?.length) {
      query.select(selections)
    } else {
      if (defaultSelect) {
        query.select(defaultSelect)
      }
    }
    return query
  },

  with: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    relationNames?: TArrayRelationType,
    withDeleted?: boolean,
    withSelection?: boolean
  ): SelectQueryBuilder<T> => {
    if (relationNames && relationNames?.length > 0) {
      for (const item of relationNames) {
        const { relation, alias } = item

        if (withSelection) {
          query.leftJoin(relation, alias)
        } else {
          query.leftJoinAndSelect(relation, alias)
        }

        if (withDeleted) {
          query.addSelect(`${alias}.deletedAt`)
        }
      }
    }
    return query
  },

  withDeleted: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    column: string,
    withDeleted?: boolean,
  ): SelectQueryBuilder<T> => {
    if (withDeleted) {
      query.withDeleted()
      query.addSelect(column)
    }
    return query
  },

  condition: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    where: TDynamicCondition,
  ): SelectQueryBuilder<T> => {
    return query.andWhere(where.condition, where.value ?? {})
  },

  orderBy: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    orderBy: TArrayOrderByType
  ): SelectQueryBuilder<T> => {
    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const fieldOrdeBy = item.orderBy
        const direction = item.direction ?? 'ASC'
        query.addOrderBy(fieldOrdeBy, direction)
      }
    }
    return query
  },

  groupBy: <T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    groupBy: TArrayGroupByType
  ): SelectQueryBuilder<T> => {
    if (groupBy && groupBy.length > 0) {
      for (const item of groupBy) {
        query.addGroupBy(item)
      }
    }
    return query
  }
}