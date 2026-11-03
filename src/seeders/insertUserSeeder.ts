import { AppDataSource } from '~/configs/dataSource'
import { Role } from '~/entities/roleEntity'
import { EUserStatusEntity, User } from '~/entities/userEntity'
import repository from '~/repositories'
import { generateHash } from '~/helpers/hashHelper'
import { Profile } from '~/entities/profileEntity'

export type TUserSeed = {
  firstName: string
  middleName?: string
  lastName?: string
  email: string
  role: "su" | "admin"
}

const users: TUserSeed[] = [
  {
    firstName: process.env.SUPERADMIN_FIRST_NAME || "",
    middleName: process.env.SUPERADMIN_MIDDLE_NAME || "",
    lastName: process.env.SUPERADMIN_LAST_NAME || "",
    email: process.env.SUPERADMIN_EMAIL || "",
    role: "su"
  },
  {
    firstName: process.env.ADMIN_FIRST_NAME || "",
    middleName: process.env.ADMIN_MIDDLE_NAME || "",
    lastName: process.env.ADMIN_LAST_NAME || "",
    email: process.env.ADMIN_EMAIL || "",
    role: "admin"
  }
]

const defaultPassword = process.env.DEFAULT_PASSWORD || ""

export const insertUserSeeder = async () => {
  return await AppDataSource.transaction(async (trx) => {
    for (const item of users) {
      console.log('----------------------------------------------')
      console.log('FINDING ROLE ', item.role)
      const role = await repository.findBy(Role, { field: 'code', value: item.role }, trx)
      if (role) {
        console.log('ROLE FOUND')
        console.log('FINDING USER ', item.email)
        const user = await repository.findBy(User, { field: 'email', value: item.email }, trx)

        if (!user) {
          console.log('USER NOT FOUND')
          const hashedPassword = await generateHash(defaultPassword)
          console.log('CREATING user')
          const user = await repository.create(User, {
            email: item.email,
            password: hashedPassword,
            roleId: role?.id,
            status: EUserStatusEntity.ACTIVE,
          }, trx)
          console.log('CREATED...')

          console.log('CREATING PROFILE')
          await repository.create(Profile, {
            userId: user.id,
            firstName: item.firstName,
            middleName: item.middleName,
            lastName: item.lastName,
          }, trx)
          console.log('CREATED...')
        } else {
          console.log('USER Found, Skipped...')
        }
      } else {
        console.log('ROLE Not Found, Skipped...')
      }
    }
  })
}