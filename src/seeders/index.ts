import 'reflect-metadata'
import dotenv from 'dotenv'
import { AppDataSource } from '~/configs/dataSource'

import { insertRoleSeeder } from '~/seeders/insertRoleSeeder'
import { insertFeatureSeeder } from '~/seeders/insertFeatureSeeder'
import { insertPermissionSeeder } from '~/seeders/insertPermissionSeeder'
import { insertFeaturePermissionSeeder } from '~/seeders/insertFeaturePermissionSeeder'
import { insertUserSeeder } from '~/seeders/insertUserSeeder'

dotenv.config()

export const runSeeders = async () => {
  const startTime = Date.now()

  try {
    if (!AppDataSource.isInitialized) {
      console.log('🔄 Menginisialisasi koneksi database...')
      await AppDataSource.initialize()
      console.log('✅ Koneksi database berhasil.\n')
    }

    console.log('====================================')
    console.log('🌱 MEMULAI PROSES DATABASE SEEDING')
    console.log('====================================\n')

    console.log('[1]. Menjalankan insertRoleSeeder...')
    await insertRoleSeeder()
    console.log('✅ insertRoleSeeder selesai.\n')

    console.log('[2]. Menjalankan insertFeatureSeeder...')
    await insertFeatureSeeder()
    console.log('✅ insertFeatureSeeder selesai.\n')

    console.log('[3]. Menjalankan insertPermissionSeeder...')
    await insertPermissionSeeder()
    console.log('✅ insertPermissionSeeder selesai.\n')

    console.log('[4]. Menjalankan UpsertFeaturePermission...')
    await insertFeaturePermissionSeeder()
    console.log('✅ UpsertFeaturePermission selesai.\n')

    console.log('[5]. Menjalankan insertUserSeeder...')
    await insertUserSeeder()
    console.log('✅ insertUserSeeder selesai.\n')

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('====================================')
    console.log(`🎉 SEMUA SEEDER SELESAI DALAM ${duration}s`)
    console.log('====================================\n')
  } catch (error) {
    console.error('\n❌ Terjadi kesalahan saat menjalankan seeder:', error)
    throw error
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('🔒 Koneksi database ditutup.')
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
