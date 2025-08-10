import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';

//*───── Metadatos (definidos primero) ─────*
const metadata = {
  packname: '',
  author: JSON.stringify({
    bot: {
      name: "Peak-Zero",
      author: "Craxker",
      status_bot: "active"
    }
  }, null, 2),
  waitMessage: '✰ *Aguarde un momento, soy lenta... ฅ^•ﻌ•^ฅ*',
  botName: '✯ Peak - WaBot ✰',
  botDescription: 'Powered By Craxker',
  readyMessage: '*Aqui tiene ฅ^•ﻌ•^ฅ*',
  channelName: '【 ✯ Mila - WaBot ✰ 】'
};

//*───── Configuración Principal ─────*
const config = {
  // Dueños del bot
  owners: [
    ['5492916439595', 'craxker', true],
    ['5492914407013', 'mila', true]
  ],

  // Moderadores y usuarios premium
  mods: [],
  prems: [],

  // Metadatos (ya definido arriba)
  metadata,

  // Media
  media: {
    catalog: './storage/img/catalogo.png',
    miniurl: './storage/img/miniurl.jpg'
  },

  // Enlaces
  links: {
    group: 'https://chat.whatsapp.com/Lp9gBDfaRIp6W9sEbpgjEF',
    channel: 'https://whatsapp.com/channel/0029VbAh8QO2Jl8CHj5ojQ0R'
  },

  // Configuración de mensajes
  messageStyle: {
    key: { 
      fromMe: false, 
      participant: `0@s.whatsapp.net`, 
      ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) 
    }, 
    message: { 
      orderMessage: { 
        itemCount: -999999, 
        status: 1, 
        surface: 1, 
        message: metadata.botName, // Usamos la variable ya definida
        orderTitle: 'Bang', 
        thumbnail: null,
        sellerJid: '0@s.whatsapp.net'
      }
    }
  },

  // Configuración general
  settings: {
    multiplier: 69,
    maxWarnings: 3
  }
};

//*───── Carga Asíncrona de Recursos ─────*
async function loadResources() {
  try {
    // Cargar imágenes
    const [catalogImg, miniurlImg] = await Promise.all([
      fs.readFile(config.media.catalog),
      fs.readFile(config.media.miniurl)
    ]);

    // Asignar imágenes cargadas
    config.messageStyle.message.orderMessage.thumbnail = catalogImg;
    global.catalogo = catalogImg;
    global.miniurl = miniurlImg;

    // Exportar configuración a global
    Object.assign(global, {
      owner: config.owners,
      mods: config.mods,
      prems: config.prems,
      packname: config.metadata.packname,
      author: config.metadata.author,
      wait: config.metadata.waitMessage,
      botname: config.metadata.botName,
      textbot: config.metadata.botDescription,
      listo: config.metadata.readyMessage,
      namechannel: config.metadata.channelName,
      group: config.links.group,
      canal: config.links.channel,
      estilo: config.messageStyle,
      cheerio,
      fs,
      fetch,
      axios,
      multiplier: config.settings.multiplier,
      maxwarn: config.settings.maxWarnings.toString()
    });

    console.log(chalk.green('✔ Configuración cargada correctamente'));
  } catch (error) {
    console.error(chalk.red('✕ Error al cargar la configuración:'), error);
    process.exit(1);
  }
}

//*───── Hot Reload ─────*
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.yellow('↻ Actualizando configuración...'));
  import(`${file}?update=${Date.now()}`)
    .catch(err => console.error(chalk.red('❀ Error al recargar:'), err));
});

// Iniciar carga
loadResources();