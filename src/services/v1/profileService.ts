import { AppDataSource } from "~/configs/dataSource"
import { NotFound } from "~/helpers/exceptionHelper"
import repository from "~/repositories"
import { User } from "~/entities/userEntity"
import { Profile } from "~/entities/profileEntity"
import {
  TUpdateProfileBody
} from "~/validations/v1/profileValidation"

export default {
  getDetail: async (userId: string): Promise<User | null> => {
    const user = await repository.findBy(User, {
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

  update: async (userId: string, data: TUpdateProfileBody): Promise<User | null> => {
    return await AppDataSource.transaction(async (trx) => {
      const user = await repository.findBy(User, {
        field: 'id',
        value: userId
      }, trx)
      if (!user) throw new NotFound('Profile not found')

      await repository.updateBy(Profile, {
        field: 'id',
        value: user.profile.id
      }, {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        address: data.address,
      }, trx)

      return await repository.findBy(User, {
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