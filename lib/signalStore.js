import { Level } from 'level'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import baileys from '@whiskeysockets/baileys' // Importación modificada
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const signalDB = new Level(`${__dirname}/../../signal_sessions`)

// Usamos la exportación por defecto y accedemos a SignalProtocolStore
const { SignalProtocolStore } = baileys

class CustomSignalStore extends SignalProtocolStore {
  constructor() {
    super(signalDB)
  }

  async init() {
    try {
      await signalDB.open()
      console.log(chalk.green('✓ Base de datos Signal inicializada'))
    } catch (error) {
      console.error(chalk.red('✗ Error inicializando LevelDB:', error))
      throw error
    }
  }

  async saveSession(identifier, data) {
    try {
      await signalDB.put(`session-${identifier}`, JSON.stringify(data))
    } catch (error) {
      console.error(chalk.red('✗ Error guardando sesión:', error))
      throw error
    }
  }

  async getSession(identifier) {
    try {
      const data = await signalDB.get(`session-${identifier}`)
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  async hasSession(identifier) {
    try {
      await signalDB.get(`session-${identifier}`)
      return true
    } catch {
      return false
    }
  }
}

export const signalStore = new CustomSignalStore()