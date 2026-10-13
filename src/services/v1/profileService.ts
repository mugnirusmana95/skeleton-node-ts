import { AppDataSource } from "~/configs/dataSource"

import { NotFound } from "~/exceptions"

import userRepository, {
  TResFindUser,
} from "~/repositories/v1/userRepository"
import profileRepository from "~/repositories/v1/profileRepository"

import {
  TUpdateProfileBody
} from "~/validations/v1/profileValidation"

export default {
  getDetail: async (userId: string): TResFindUser => {
    const user = await userRepository.findBy({
      field: 'id',
      value: userId,
      withRelation: [
        { relation: 'user.profile', alias: 'profile' },
        { relation: 'user.role', alias: 'role' },
      ],
    })
    if (!user) throw new NotFound('Profile not found')

    return user
  },

  update: async (userId: string, data: TUpdateProfileBody): TResFindUser => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await userRepository.findBy({
        field: 'id',
        value: userId
      }, trx)
      if (!user) throw new NotFound('Profile not found')

      await profileRepository.updateBy({
        field: 'id',
        value: user.profile.id
      }, {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        address: data.address,
      }, trx)

      return await userRepository.findBy({
        field: 'id',
        value: user.id,
        withRelation: [
          { relation: 'user.profile', alias: 'profile' },
          { relation: 'user.role', alias: 'role' },
        ],
      }, trx)
    })
  },
}