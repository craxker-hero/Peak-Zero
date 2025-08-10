import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

// Variable global para almacenar el ranking
global.ranking = {
  lastUpdate: 0,
  data: []
}

// Función para actualizar el ranking
const updateRanking = () => {
  const now = Date.now()
  // Actualizar solo cada 30 minutos para mejor rendimiento
  if (now - global.ranking.lastUpdate < 30 * 60 * 1000) return
  
  global.ranking.data = Object.entries(global.db.data.users)
    .filter(([_, user]) => user.registered)
    .map(([jid, user]) => ({
      jid,
      name: user.name,
      exp: user.exp || 0,
      level: user.level || 0,
      lastActive: user.lastActive || 0
    }))
    .sort((a, b) => {
      // Ordenar por experiencia (mayor a menor)
      if (b.exp !== a.exp) return b.exp - a.exp
      // Si tienen misma XP, ordenar por nivel
      if (b.level !== a.level) return b.level - a.level
      // Si todo es igual, ordenar por última actividad
      return b.lastActive - a.lastActive
    })
  
  global.ranking.lastUpdate = now
}

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  
  // Actualizar ranking
  updateRanking()
  
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

  // Calcular puesto REAL
  let userRank = global.ranking.data.findIndex(u => u.jid === who) + 1
  if (userRank === 0) userRank = global.ranking.data.length + 1 // Si no está en el ranking

  // Generar mensaje
  let txt = `「✿」 *Perfil* ◢ ${user.name || conn.getName(who)} ◤\n\n`
  txt += `♛ Cumpleaños » *${user.birthdate ? user.birthdate.split('/').slice(0,2).join('/') + ` (${user.age} años)` : 'Sin especificar (/setbirth)'}*\n`
  txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
  txt += `☆ Experiencia » *${exp.toLocaleString('es-ES')}*\n`
  txt += `❖ Nivel » *${level.toLocaleString('es-ES')}*\n`
  txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')}/${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
  txt += `# Puesto » *#${userRank.toLocaleString('es-ES')}*\n\n`
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