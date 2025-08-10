import { xpRange } from '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let user = global.db.data.users[who] || {}
  
  // Verificar registro y registrar automáticamente si es necesario
  if (!user.registered) {
    user.name = conn.getName(who)
    user.regTime = +new Date()
    user.registered = true
    user.age = 0
    user.birthdate = ''
  }

  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.pinimg.com/736x/e9/73/17/e97317c8d423564fbaed0d9fc5554355.jpg')
  let { exp = 0, level = 0, money = 0, registered = false, age = 0, birthdate = '' } = user
  let { min, xp } = xpRange(level, global.multiplier || 1)
  
  // Calcular progreso de nivel
  let currentXP = exp - min
  let neededXP = xp
  let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100)
  
  // Puesto global (simulado)
  let globalRank = Math.floor(Math.random() * 1000000)
  
  // Procesar fecha de nacimiento
  let birthdayInfo = 'Sin especificar :< (/setbirth)'
  if (birthdate) {
    let [day, month, year] = birthdate.split('/').map(Number)
    birthdayInfo = `${day}/${month} (${age} años)`
  } else if (age > 0) {
    birthdayInfo = `${age} años`
  }

  let img = await (await fetch(pp)).buffer()
  let txt = `「✿」 *Perfil* ◢ ${user.name || 'Usuario'} ◤\n\n`
      txt += `♛ Cumpleaños » *${birthdayInfo}*\n`
      txt += `♛ Género » *Sin especificar*\n\n`
      txt += `☆ Experiencia » *${exp.toLocaleString()}*\n`
      txt += `❖ Nivel » *${level}*\n`
      txt += `➨ Progreso » *${currentXP.toLocaleString()} => ${neededXP.toLocaleString()}*  _(${progress}%)_\n`
      txt += `# Puesto » *#${globalRank.toLocaleString()}*\n\n`
      txt += `✧ Valor total » *${money.toLocaleString()}*\n`
      txt += `⛁ Monedas totales » *${money.toLocaleString()} ${global.rpg?.emoticon?.('money') || '💰'}*\n`
      txt += `❒ Comandos totales » *${Math.floor(exp / 100).toLocaleString()}*`

  await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler