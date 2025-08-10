import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  
  // Obtener nombre de forma segura
  let userName = 'Usuario' // Valor por defecto
  try {
    // Primero intentamos con el nombre almacenado
    userName = global.db.data.users[who]?.name 
             || m.pushName 
             || 'Usuario'
    
    // Luego intentamos actualizarlo desde WhatsApp
    const contact = await conn.fetchStatus(who).catch(_ => null)
    if (contact?.status) {
      userName = contact.status
      // Actualizamos en la base de datos
      global.db.data.users[who] = global.db.data.users[who] || {}
      global.db.data.users[who].name = userName
    }
  } catch (e) {
    console.error('Error al obtener nombre:', e)
  }

  // Asegurar que el usuario existe en la base de datos
  global.db.data.users[who] = global.db.data.users[who] || {
    name: userName,
    exp: 0,
    level: 0,
    commandCount: 0
  }

  let user = global.db.data.users[who]
  
  // Obtener foto de perfil con fallback
  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = 'https://i.imgur.com/8Km9TLL.jpg' // Imagen por defecto
  }

  // Cálculos de nivel
  let { min, xp } = xpRange(user.level, global.multiplier || 1)
  let currentXP = Math.max(0, user.exp - min)
  let neededXP = Math.max(1, xp)
  let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100))

  // Construir mensaje
  let txt = `「✿」 *Perfil* ◢ ${userName} ◤\n\n`
  txt += `♛ Cumpleaños » *${user.birthdate ? `${user.birthdate.split('/')[0]}/${user.birthdate.split('/')[1]} (${user.age} años)` : 'Sin especificar (/setbirth)'}*\n`
  txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
  txt += `☆ Experiencia » *${user.exp.toLocaleString('es-ES')}*\n`
  txt += `❖ Nivel » *${user.level.toLocaleString('es-ES')}*\n`
  txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')}/${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
  txt += `# Puesto » *#${Math.floor(Math.random() * 1000000).toLocaleString('es-ES')}*\n\n`
  txt += `✧ Comandos usados » *${(user.commandCount || 0).toLocaleString('es-ES')}*`

  // Enviar mensaje
  try {
    let img = await (await fetch(pp)).buffer()
    await conn.sendMessage(m.chat, { 
      image: img,
      caption: txt,
      mentions: [who]
    }, { quoted: m })
  } catch (e) {
    console.error('Error al enviar imagen:', e)
    await conn.reply(m.chat, txt, m)
  }
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler