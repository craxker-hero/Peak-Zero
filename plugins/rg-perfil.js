import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  if (!who) throw new Error('No se pudo identificar al usuario')

  // Inicializar usuario si no existe
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      name: conn.getName(who) || 'Usuario',
      registered: false,
      age: 0,
      exp: 0,
      level: 0,
      money: 0
    }
  }

  let user = global.db.data.users[who]
  
  // Valores seguros
  let exp = Number(user.exp) || 0
  let level = Number(user.level) || 0
  let money = Number(user.money) || 0
  let age = Number(user.age) || 0
  let birthdate = user.birthdate || ''
  
  // Calcular progreso de nivel CORRECTAMENTE
  let { min, xp } = xpRange(level, global.multiplier || 1)
  let currentXP = Math.max(0, exp - min)
  let neededXP = Math.max(1, xp - min) // Evitar división por cero
  let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100)

  // Información de cumpleaños
  let birthdayInfo = 'Sin especificar (/setbirth)'
  if (birthdate) {
    let [day, month, year] = birthdate.split('/').map(Number)
    let today = new Date()
    let birthDate = new Date(year, month - 1, day)
    let calculatedAge = today.getFullYear() - birthDate.getFullYear()
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      calculatedAge--
    }
    birthdayInfo = `${day}/${month} (${calculatedAge} años)`
  } else if (age > 0) {
    birthdayInfo = `${age} años`
  }

  // Obtener foto de perfil
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => null)
  
  // Generar mensaje
  let txt = `「✿」 *Perfil* ◢ ${user.name || 'Usuario'} ◤\n\n`
  txt += `♛ Cumpleaños » *${birthdayInfo}*\n`
  txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
  txt += `☆ Experiencia » *${exp.toLocaleString('es-ES')}*\n`
  txt += `❖ Nivel » *${level.toLocaleString('es-ES')}*\n`
  txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')}/${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
  txt += `# Puesto » *#${Math.floor(Math.random() * 1000000).toLocaleString('es-ES')}*\n\n`
  txt += `✧ Valor total » *${money.toLocaleString('es-ES')}*\n`
  txt += `⛁ Monedas totales » *${money.toLocaleString('es-ES')} ${global.rpg?.emoticon?.('money') || '💰'}*\n`
  txt += `❒ Comandos totales » *${Math.floor(exp / 100).toLocaleString('es-ES')}*`

  // Enviar mensaje
  if (pp) {
    await conn.sendFile(m.chat, pp, 'profile.jpg', txt, m)
  } else {
    await conn.reply(m.chat, txt, m)
  }
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler