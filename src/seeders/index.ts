import 'reflect-metadata'
import dotenv from 'dotenv'
import { AppDataSource } from '~/configs/dataSource'

import { insertRoleSeeder } from '~/seeders/insertRoleSeeder'
import { insertFeatureSeeder } from '~/seeders/insertFeatureSeeder'
import { insertPermissionSeeder } from '~/seeders/insertPermissionSeeder'
import { insertFeaturePermissionSeeder } from '~/seeders/insertFeaturePermissionSeeder'
import { insertUserSeeder } from '~/seeders/insertUserSeeder'
import { insertCountryAndPhoneCodesSeeder } from './insertCountryAndPhoneCodesSeeder'
import { insertIndonesianRegionalSeeder } from '~/seeders/insertIndonesianRegionalSeeder'

dotenv.config()

export const runSeeders = async () => {
  const startTime = Date.now()

  try {
    if (!AppDataSource.isInitialized) {
      console.log('🔄 Initializing database connection...')
      await AppDataSource.initialize()
      console.log('✅ Database connection successful.\n')
    }

    console.log('============================================================')
    console.log('🌱 STARTING THE DATABASE SEEDING PROCESS')
    console.log('============================================================\n')

    console.log('[1]. Seeding insertRoleSeeder...')
    await insertRoleSeeder()
    console.log('✅ insertRoleSeeder finish.\n')

    console.log('[2]. Seeding insertFeatureSeeder...')
    await insertFeatureSeeder()
    console.log('✅ insertFeatureSeeder finish.\n')

    console.log('[3]. Seeding insertPermissionSeeder...')
    await insertPermissionSeeder()
    console.log('✅ insertPermissionSeeder finish.\n')

    console.log('[4]. Seeding insertFeaturePermissionSeeder...')
    await insertFeaturePermissionSeeder()
    console.log('✅ insertFeaturePermissionSeeder finish.\n')

    console.log('[5]. Seeding insertUserSeeder...')
    await insertUserSeeder()
    console.log('✅ insertUserSeeder finish.\n')

    console.log('[6]. Seeding insertCountryAndPhoneCodesSeeder...')
    await insertCountryAndPhoneCodesSeeder()
    console.log('✅ insertCountryAndPhoneCodesSeeder finish.\n')

    console.log('[7]. Seeding insertIndonesianRegionalSeeder...')
    await insertIndonesianRegionalSeeder()
    console.log('✅ insertIndonesianRegionalSeeder finish.\n')

    const duration = (Date.now() - startTime) / 1000
    const durationFixed = Number(duration.toFixed(0))
    const durationDecimal = Number(duration.toFixed(2))

    console.log('============================================================')
    console.log(`🎉 ALL SEEDER FINISHED WITHIN ${durationFixed <= 0 ? durationDecimal : durationFixed}s`)
    console.log('============================================================\n')
  } catch (error) {
    console.error('\n❌ An error occurred while running the seeder.:', error)
    throw error
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('🔒 Database connection closed.')
    }
  }
}

// Auto-run if executed directly via CLI
runSeeders()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
