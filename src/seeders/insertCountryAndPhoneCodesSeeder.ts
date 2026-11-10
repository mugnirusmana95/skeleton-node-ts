import { AppDataSource } from "~/configs/dataSource"
import { Country } from "~/entities/countryEntity"
import { PhoneCode } from "~/entities/phoneCodeEntity"
import repository from "~/repositories"
import data from '~/seeders/data/country-phone-codes.json'

type TCountryPhoneCode = {
  name: string,
  code: string
  dial_code: string,
}

export const insertCountryAndPhoneCodesSeeder = () => {
  return AppDataSource.transaction(async (trx) => {
    const totalCountry = await repository.count(Country, {})
    if (totalCountry >= 242) {
      console.log('Country and Phone Codes already seeded, skipped...')
      return null
    }

    const countryPhoneCodes = data as TCountryPhoneCode[]
    for (const item of countryPhoneCodes) {
      console.log('----------------------------------------------')
      console.log('FINDING Country ', item.code)
      const hasCountry = await repository.findBy(Country, {
        field: 'code',
        value: item.code
      }, trx)
      if (!hasCountry) {
        console.log('Country not found')
        console.log('CREATING Country')
        const country = await repository.create(Country, {
          code: item.code,
          name: item.name,
          isActive: true
        }, trx)
        console.log('FINDING Phone Code ', item.dial_code)
        const hasPhoneCode = await repository.findBy(PhoneCode, {
          field: 'code',
          value: item.dial_code
        }, trx)
        if (!hasPhoneCode) {
          console.log('Phone Code not found')
          console.log('CREATING Phone Code')
          await repository.create(PhoneCode, {
            countryId: country.id,
            code: item.dial_code,
            isActive: true
          }, trx)
        } else {
          console.log('Phone Code found, skipped...')
        }
      } else {
        console.log('Country found, skipped...')
      }
    }
  })
}