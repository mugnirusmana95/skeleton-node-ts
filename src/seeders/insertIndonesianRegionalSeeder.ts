import { AppDataSource } from '~/configs/dataSource'
import { Country } from '~/entities/countryEntity'
import { District } from '~/entities/districtEntity'
import { Province } from '~/entities/provinceEntity'
import { Regency } from '~/entities/regencyEntity'
import { Village } from '~/entities/villageEntity'
import repository from '~/repositories'
import dataProvinces from '~/seeders/data/provinces.json'
import dataRegencies from '~/seeders/data/regencies.json'
import dataDistricts from '~/seeders/data/districts.json'
import dataVillages from '~/seeders/data/villages.json'
import dataZipCodes from '~/seeders/data/zipcodes.json'
import { ZipCode } from '~/entities/zipCodeEntity'

type TZipCode = Record<string, string>

type TZipCodes = TZipCode[]

type TVillage = {
  kode: string,
  nama: string,
}

type TDistrict = {
  kode: string,
  nama: string,
}

type TRegency = {
  kode: string,
  nama: string,
}

type TProvince = {
  kode: string,
  nama: string,
}

export const insertIndonesianRegionalSeeder = async () => {
  return AppDataSource.transaction(async (trx) => {
    let provinces = dataProvinces as TProvince[]
    let regencies = dataRegencies as TRegency[]
    let districts = dataDistricts as TDistrict[]
    let villages = dataVillages as TVillage[]
    let zipcode = dataZipCodes as TZipCode

    const totalProvince = await repository.count(Province, {})
    if (totalProvince >= 38) {
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
            value: itemProvince.kode
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

    const totalRegency = await repository.count(Regency, {})
    if (totalRegency >= 514) {
      console.log(`${totalRegency} Regencies already seeded, skipped...`)
    } else {
      for (const itemRegency of regencies) {
        console.log('----------------------------------------------')
        const provinceCode = itemRegency?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING Province ', provinceCode)
        const province = await repository.findBy(Province, {
          field: 'code',
          value: provinceCode
        })
        if (province) {
          console.log('Province found')
          console.log('FINDING Regency ', itemRegency.kode?.split('.').join(''))
          const checkRegency = await repository.findBy(Regency, {
            field: 'code',
            value: itemRegency.kode?.split('.').join('')
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

    const totalDistrict = await repository.count(District, {})
    if (totalDistrict >= 7285) {
      console.log(`${totalDistrict} Districts already seeded, skipped...`)
    } else {
      for (const itemDistrict of districts) {
        console.log('----------------------------------------------')
        const regencyCode = itemDistrict?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING Regency ', regencyCode?.split('.').join(''))
        const regency = await repository.findBy(Regency, {
          field: 'code',
          value: regencyCode
        })
        if (regency) {
          console.log('Regency found')
          console.log('FINDING District ', itemDistrict.kode)
          const checkDistrict = await repository.findBy(District, {
            field: 'code',
            value: itemDistrict.kode?.split('.').join('')
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

    const totalVillage = await repository.count(Village, {})
    if (totalVillage >= 83762) {
      console.log(`${totalVillage} Villages already seeded, skipped...`)
    } else {
      for (const itemVillage of villages) {
        console.log('----------------------------------------------')
        const districtCode = itemVillage?.kode?.split('.').slice(0, -1).join('')
        console.log('FINDING District ', districtCode)
        const district = await repository.findBy(District, {
          field: 'code',
          value: districtCode
        })
        if (district) {
          console.log('District found')
          console.log('FINDING Village ', itemVillage.kode?.split('.').join(''))
          const checkVillage = await repository.findBy(Village, {
            field: 'code',
            value: itemVillage.kode?.split('.').join('')
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

    const totalZipCode = await repository.count(ZipCode, {})
    if (totalZipCode >= 83762) {
      console.log(`${totalZipCode} ZipCodes already seeded, skipped...`)
    } else {
      for (const itemZipCode of Object.entries(zipcode)) {
        console.log('----------------------------------------------')
        const [kode, kodepos] = itemZipCode
        const villageCode = kode?.split('.').join('')
        console.log('FINDING Village ', villageCode)
        const village = await repository.findBy(Village, {
          field: 'code',
          value: villageCode
        })
        if (village) {
          console.log('Village found')
          console.log('FINDING ZipCode ', villageCode)
          const checkZipCode = await repository.findBy(ZipCode, {
            field: 'code',
            value: kode?.split('.').join('')
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