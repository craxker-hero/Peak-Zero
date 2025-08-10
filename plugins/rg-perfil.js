import { xpRange } from '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn }) => {
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender

  let user = global.db.data.users[who]
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.pinimg.com/736x/e9/73/17/e97317c8d423564fbaed0d9fc5554355.jpg')
  let { exp, limit, name, registered, age, level, money } = global.db.data.users[who]
  let { min, xp } = xpRange(user.level, global.multiplier)
  
  // Calcular progreso de nivel
  let currentXP = exp - min
  let neededXP = xp
  let progress = Math.floor((currentXP / neededXP) * 100)
  
  // Puesto global (simulado)
  let globalRank = Math.floor(Math.random() * 1000000) // Implementa tu propio ranking aquí

   let prem = global.prems.includes(who.split`@`[0])
  
  let img = await (await fetch(pp)).buffer()
  let txt = `「✿」 *Perfil* ◢ ${name} ◤\n\n`
      txt += `♛ Cumpleaños » *${registered ? age + ' años' : 'Sin especificar :< (#setbirth)'}*\n`
      txt += `♛ Género » *Sin especificar*\n\n`
      txt += `☆ Experiencia » *${exp.toLocaleString()}*\n`
      txt += `❖ Nivel » *${level}*\n`
      txt += `➨ Progreso » *${currentXP} => ${neededXP}*  _(${progress}%)_\n`
      txt += `# Puesto » *#${globalRank.toLocaleString()}*\n\n`
      txt += `✧ Valor total » *${money.toLocaleString()}*\n`
      txt += `⛁ Monedas totales » *${money.toLocaleString()} ${global.rpg.emoticon('money') || '💰'}*\n`
      txt += `❒ Comandos totales » *${Math.floor(exp / 100).toLocaleString()}*`

  await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
}

handler.help = ['perfil', 'perfil *@user*']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
handler.register = true

export default handler