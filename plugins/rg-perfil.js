import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

// Función para obtener el nombre ACTUALIZADO del usuario
const getName = async (conn, jid) => {
  try {
    // Obtener información actualizada del contacto
    const contact = await conn.fetchStatus(jid).catch(_ => null)
    return contact?.status || conn.getName(jid) || 'Usuario'
  } catch (e) {
    return conn.getName(jid) || 'Usuario'
  }
}

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  
  // Obtener nombre ACTUALIZADO
  let userName = await getName(conn, who)
  
  // Actualizar el nombre en la base de datos si es diferente
  if (global.db.data.users[who]?.name !== userName) {
    global.db.data.users[who] = global.db.data.users[who] || {}
    global.db.data.users[who].name = userName
  }

  let user = global.db.data.users[who] || {}
  
  // Obtener foto de perfil
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
  
  // Valores seguros
  let exp = Number(user.exp) || 0
  let level = Number(user.level) || 0
  let { min, xp } = xpRange(level, global.multiplier || 1)
  
  // Cálculo preciso del progreso
  let currentXP = Math.max(0, exp - min)
  let neededXP = Math.max(1, xp)
  let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100))

  // Generar mensaje
  let txt = `「✿」 *Perfil* ◢ ${userName} ◤\n\n`
  txt += `♛ Cumpleaños » *${user.birthdate ? user.birthdate.split('/').slice(0,2).join('/') + ` (${user.age} años)` : 'Sin especificar (/setbirth)'}*\n`
  txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
  txt += `☆ Experiencia » *${exp.toLocaleString('es-ES')}*\n`
  txt += `❖ Nivel » *${level.toLocaleString('es-ES')}*\n`
  txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')}/${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
  txt += `# Puesto » *#${Math.floor(Math.random() * 1000000).toLocaleString('es-ES')}*\n\n`
  txt += `✧ Comandos usados » *${(user.commandCount || 0).toLocaleString('es-ES')}*`

  // Enviar mensaje con foto de perfil
  try {
    let img = await (await fetch(pp)).buffer()
    await conn.sendMessage(m.chat, {
      image: img,
      caption: txt,
      mentions: [who]
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, txt, m)
  }
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler