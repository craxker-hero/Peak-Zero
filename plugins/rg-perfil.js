import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

// Sistema de ranking global
let updateRanking = () => {
  let users = Object.entries(global.db.data.users)
    .filter(([_, user]) => user.registered)
    .map(([jid, user]) => ({
      jid,
      exp: user.exp || 0,
      level: user.level || 0,
      lastActive: user.lastActive || 0
    }))
    .sort((a, b) => b.exp - a.exp || b.lastActive - a.lastActive)
  
  users.forEach((user, index) => {
    global.db.data.users[user.jid].rank = index + 1
  })
}

let handler = async (m, { conn, usedPrefix }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  if (!who) throw new Error('No se pudo identificar al usuario')

  // Actualizar ranking antes de mostrar perfil
  updateRanking()

  // Inicializar usuario si no existe
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      name: conn.getName(who),
      registered: true,
      regTime: +new Date(),
      age: 0,
      exp: 0,
      level: 0,
      money: 0,
      commandCount: 0,
      lastActive: +new Date()
    }
  }

  let user = global.db.data.users[who]
  user.lastActive = +new Date() // Actualizar última actividad

  // Valores seguros
  let exp = Number(user.exp) || 0
  let level = Number(user.level) || 0
  let money = Number(user.money) || 0
  let age = Number(user.age) || 0
  let birthdate = user.birthdate || ''
  let commandCount = Number(user.commandCount) || 0
  
  // Sistema de niveles mejorado
  let { min, xp } = xpRange(level, global.multiplier || 1)
  let currentXP = Math.max(0, exp - min)
  let neededXP = Math.max(1, xp) // XP necesaria para subir de nivel
  let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100)

  // Información de cumpleaños
  let birthdayInfo = 'Sin especificar (/setbirth)'
  if (birthdate) {
    let [day, month, year] = birthdate.split('/').map(Number)
    let today = new Date()
    let birthDate = new Date(year, month - 1, day)
    let calculatedAge = today.getFullYear() - birthDate.getFullYear()
    if (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      calculatedAge--
    }
    birthdayInfo = `${day}/${month} (${calculatedAge} años)`
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
  txt += `# Puesto » *#${(user.rank || 0).toLocaleString('es-ES')}*\n\n`
  txt += `✧ Valor total » *${money.toLocaleString('es-ES')}*\n`
  txt += `⛁ Monedas totales » *${money.toLocaleString('es-ES')} ${global.rpg?.emoticon?.('money') || '💰'}*\n`
  txt += `❒ Comandos totales » *${commandCount.toLocaleString('es-ES')}*`

  // Enviar mensaje
  if (pp) {
    await conn.sendFile(m.chat, pp, 'profile.jpg', txt, m)
  } else {
    await conn.reply(m.chat, txt, m)
  }
}

handler.before = async function (m) {
  // Contar comandos
  let user = global.db.data.users[m.sender] || {}
  if (!user.commandCount) user.commandCount = 0
  user.commandCount++
  
  // Sistema de experiencia por comandos
  if (!user.exp) user.exp = 0
  user.exp += Math.floor(Math.random() * 5) + 1 // XP por comando
  
  // Actualizar nivel
  let { min, xp } = xpRange(user.level || 0, global.multiplier || 1)
  if (user.exp >= min + xp) {
    user.level += 1
    m.reply(`🎉 ¡Subiste al nivel ${user.level}!`)
  }
  
  return true
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler