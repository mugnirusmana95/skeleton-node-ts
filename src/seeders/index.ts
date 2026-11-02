import 'reflect-metadata'
import dotenv from 'dotenv'
import { AppDataSource } from '~/configs/dataSource'
import { upsertRoleSeeder } from '~/seeders/UpsertRoleSeeder'
import { upsertFeatureSeeder } from '~/seeders/UpsertFeatureSeeder'
import { upsertPermissionSeeder } from '~/seeders/UpsertPermissionSeeder'
import { upsertFeaturePermissionSeeder } from '~/seeders/UpsertFeaturePermissionSeeder'
import createFirstUserSeeder from './CreateFirstUserSeeder'

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

    console.log('[1]. Menjalankan UpsertRoleSeeder...')
    await upsertRoleSeeder()
    console.log('✅ UpsertRoleSeeder selesai.\n')

    console.log('[2]. Menjalankan UpsertFeatureSeeder...')
    await upsertFeatureSeeder()
    console.log('✅ UpsertFeatureSeeder selesai.\n')

    console.log('[3]. Menjalankan UpsertPermissionSeeder...')
    await upsertPermissionSeeder()
    console.log('✅ UpsertPermissionSeeder selesai.\n')

    console.log('[4]. Menjalankan UpsertFeaturePermission...')
    await upsertFeaturePermissionSeeder()
    console.log('✅ UpsertFeaturePermission selesai.\n')

    console.log('[5]. Menjalankan createFirstUserSeeder...')
    await createFirstUserSeeder()
    console.log('✅ createFirstUserSeeder selesai.\n')

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
