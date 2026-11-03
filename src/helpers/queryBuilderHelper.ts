import {
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm'

import { TParsedParams } from '~/helpers/paramHelper'
import { InternalServer } from './exceptionHelper'

type TEntityWithFilter<T extends ObjectLiteral> = {
  filterList?: (
    query: SelectQueryBuilder<T>,
    params: TParsedParams
  ) => void | Promise<void>
}

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    filterList(params: TParsedParams): Promise<this>
  }
}

SelectQueryBuilder.prototype.filterList = async function <
  T extends ObjectLiteral
>(
  this: SelectQueryBuilder<T>,
  params: TParsedParams
) {
  const target = this.expressionMap.mainAlias?.metadata?.target as TEntityWithFilter<T>

  if (!target) {
    throw new InternalServer('Entity target does not support static filterList')
  }

  if (typeof target.filterList !== 'function') {
    throw new InternalServer('Entity does not implement static filterList yet')
  }

  await target.filterList(this, params)

  return this
}