import { Level } from 'level';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Importación corregida para Baileys v6.8.1
import baileysPkg from '@whiskeysockets/baileys';
const { default: { SignalProtocolStore } } = baileysPkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const signalDB = new Level(`${__dirname}/../../signal_sessions`);

class CustomSignalStore extends SignalProtocolStore {
  constructor() {
    super(signalDB);
  }

  async init() {
    try {
      await signalDB.open();
      console.log(chalk.green('✓ Base de datos Signal inicializada'));
    } catch (error) {
      console.error(chalk.red('✗ Error inicializando LevelDB:', error));
      throw error;
    }
  }

  async saveSession(identifier, data) {
    try {
      await signalDB.put(`session-${identifier}`, JSON.stringify(data));
    } catch (error) {
      console.error(chalk.red('✗ Error guardando sesión:', error));
      throw error;
    }
  }

  async getSession(identifier) {
    try {
      const data = await signalDB.get(`session-${identifier}`);
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async hasSession(identifier) {
    try {
      await signalDB.get(`session-${identifier}`);
      return true;
    } catch {
      return false;
    }
  }
}

export const signalStore = new CustomSignalStore();