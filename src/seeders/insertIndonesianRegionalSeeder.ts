import { AppDataSource } from '~/configs/dataSource'

import { Country } from '~/entities/countryEntity'
import { District } from '~/entities/districtEntity'
import { Province } from '~/entities/provinceEntity'
import { Regency } from '~/entities/regencyEntity'
import { Village } from '~/entities/villageEntity'
import { ZipCode } from '~/entities/zipCodeEntity'

import repository from '~/repositories'

import dataProvinces from '~/seeders/data/provinces.json'
import dataRegencies from '~/seeders/data/regencies.json'
import dataDistricts from '~/seeders/data/districts.json'
import dataVillages from '~/seeders/data/villages.json'
import dataZipCodes from '~/seeders/data/zipcodes.json'

type TZipCode = Record<string, string>

type TRegion = {
  kode: string,
  nama: string,
}

const provinces = dataProvinces as TRegion[]
const regencies = dataRegencies as TRegion[]
const districts = dataDistricts as TRegion[]
const villages = dataVillages as TRegion[]

const zipcode = dataZipCodes as TZipCode

export const insertIndonesianRegionalSeeder = async () => {
  return AppDataSource.transaction(async (trx) => {
    const totalProvince = await repository.count(Province, { withDeleted: true }, trx)
    if (totalProvince >= provinces.length) {
      console.log(`${totalProvince} Provinces already seeded, skipped...`)
    } else {
      console.log('----------------------------------------------')
      console.log('FINDING Country ', 'ID')
      const country = await repository.findBy(Country, {
        field: 'code',
        value: 'ID'
      }, trx)

      if (country) {
        console.log('Country found')
        for (const itemProvince of provinces) {
          console.log('----------------------------------------------')
          console.log('FINDING Province ', itemProvince.kode?.split('.').join(''))
          const checkProvince = await repository.findBy(Province, {
            field: 'code',
            value: itemProvince.kode,
            withDeleted: true
          }, trx)
          if (!checkProvince) {
            console.log('Province not found')
            console.log('CREATING Province')
            await repository.create(Province, {
              countryId: country.id,
              code: itemProvince.kode?.split('.').join(''),
              name: itemProvince.nama,
              isActive: true
            })
          } else {
            console.log('Province found, skipped...')
          }
        }
      }
    }

    const totalRegency = await repository.count(Regency, { withDeleted: true }, trx)
    if (totalRegency >= regencies.length) {
      console.log(`${totalRegency} Regencies already seeded, skipped...`)
    } else {
      for (const itemRegency of regencies) {
        console.log('----------------------------------------------')
        const provinceCode = itemRegency?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING Province ', provinceCode)
        const province = await repository.findBy(Province, {
          field: 'code',
          value: provinceCode,
          withDeleted: true
        })
        if (province) {
          console.log('Province found')
          console.log('FINDING Regency ', itemRegency.kode?.split('.').join(''))
          const checkRegency = await repository.findBy(Regency, {
            field: 'code',
            value: itemRegency.kode?.split('.').join(''),
            withDeleted: true
          }, trx)
          if (!checkRegency) {
            console.log('Regency not found')
            console.log('CREATING Regency')
            await repository.create(Regency, {
              provinceId: province.id,
              code: itemRegency.kode?.split('.').join(''),
              name: itemRegency.nama,
              isActive: true
            })
          } else {
            console.log('Regency found, skipped...')
          }
        } else {
          console.log('Province not found, skipped...')
        }
      }
    }

    const totalDistrict = await repository.count(District, { withDeleted: true }, trx)
    if (totalDistrict >= districts.length) {
      console.log(`${totalDistrict} Districts already seeded, skipped...`)
    } else {
      for (const itemDistrict of districts) {
        console.log('----------------------------------------------')
        const regencyCode = itemDistrict?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING Regency ', regencyCode?.split('.').join(''))
        const regency = await repository.findBy(Regency, {
          field: 'code',
          value: regencyCode,
          withDeleted: true
        })
        if (regency) {
          console.log('Regency found')
          console.log('FINDING District ', itemDistrict.kode?.split('.').join(''))
          const checkDistrict = await repository.findBy(District, {
            field: 'code',
            value: itemDistrict.kode?.split('.').join(''),
            withDeleted: true
          }, trx)
          if (!checkDistrict) {
            console.log('District not found')
            console.log('CREATING District')
            await repository.create(District, {
              regencyId: regency.id,
              code: itemDistrict.kode?.split('.').join(''),
              name: itemDistrict.nama,
              isActive: true
            })
          } else {
            console.log('District found, skipped...')
          }
        } else {
          console.log('Regency not found, skipped...')
        }
      }
    }

    const totalVillage = await repository.count(Village, { withDeleted: true }, trx)
    if (totalVillage >= villages.length) {
      console.log(`${totalVillage} Villages already seeded, skipped...`)
    } else {
      for (const itemVillage of villages) {
        console.log('----------------------------------------------')
        const districtCode = itemVillage?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING District ', districtCode)
        const district = await repository.findBy(District, {
          field: 'code',
          value: districtCode,
          withDeleted: true
        })
        if (district) {
          console.log('District found')
          console.log('FINDING Village ', itemVillage.kode?.split('.').join(''))
          const checkVillage = await repository.findBy(Village, {
            field: 'code',
            value: itemVillage.kode?.split('.').join(''),
            withDeleted: true
          }, trx)
          if (!checkVillage) {
            console.log('Village not found')
            console.log('CREATING Village')
            await repository.create(Village, {
              districtId: district.id,
              code: itemVillage.kode?.split('.').join(''),
              name: itemVillage.nama,
              isActive: true
            })
          } else {
            console.log('Village found, skipped...')
          }
        } else {
          console.log('District not found, skipped...')
        }
      }
    }

    const totalZipCode = await repository.count(ZipCode, { withDeleted: true }, trx)
    if (totalZipCode >= Object.entries(zipcode).length) {
      console.log(`${totalZipCode} ZipCodes already seeded, skipped...`)
    } else {
      for (const itemZipCode of Object.entries(zipcode)) {
        console.log('----------------------------------------------')
        const [kode, kodepos] = itemZipCode
        const villageCode = kode?.split('.').join('')
        console.log('FINDING Village ', villageCode)
        const village = await repository.findBy(Village, {
          field: 'code',
          value: villageCode,
          withDeleted: true
        })
        if (village) {
          console.log('Village found')
          console.log('FINDING ZipCode ', villageCode)
          const checkZipCode = await repository.findBy(ZipCode, {
            field: 'code',
            value: kode?.split('.').join(''),
            withDeleted: true
          }, trx)
          if (!checkZipCode) {
            console.log('Village not found')
            console.log('CREATING ZipCode')
            await repository.create(ZipCode, {
              villageId: village.id,
              code: kode?.split('.').join(''),
              name: kodepos,
              isActive: true
            })
          } else {
            console.log('ZipCode found, skipped...')
          }
        } else {
          console.log('Village not found, skipped...')
        }
      }
    }
  })
}