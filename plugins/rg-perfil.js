import { xpRange } from '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    if (!who) throw new Error('No se pudo identificar al usuario')
    
    // Asegurar que el usuario exista en la base de datos
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
    
    // Registrar automáticamente si no está registrado
    if (!user.registered) {
      user.name = conn.getName(who) || 'Usuario'
      user.regTime = +new Date()
      user.registered = true
      user.age = user.age || 0
      user.exp = user.exp || 0
      user.level = user.level || 0
      user.money = user.money || 0
    }

    // Valores por defecto seguros
    let exp = Number(user.exp) || 0
    let level = Number(user.level) || 0
    let money = Number(user.money) || 0
    let age = Number(user.age) || 0
    let birthdate = user.birthdate || ''
    
    let { min, xp } = xpRange(level, global.multiplier || 1)
    let currentXP = Math.max(0, exp - min)
    let neededXP = xp
    let progress = neededXP > 0 ? Math.min(100, Math.floor((currentXP / neededXP) * 100)) : 0
    
    // Información de cumpleaños
    let birthdayInfo = birthdate ? 
      `${birthdate.split('/')[0]}/${birthdate.split('/')[1]} (${age} años)` : 
      age > 0 ? `${age} años` : 'Sin especificar (/setbirth)'
    
    // Foto de perfil con fallback
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 
      'https://i.pinimg.com/736x/e9/73/17/e97317c8d423564fbaed0d9fc5554355.jpg'
    )
    
    // Generar contenido del perfil
    let txt = `「✿」 *Perfil* ◢ ${user.name || 'Usuario'} ◤\n\n`
    txt += `♛ Cumpleaños » *${birthdayInfo}*\n`
    txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
    txt += `☆ Experiencia » *${exp.toLocaleString('es-ES')}*\n`
    txt += `❖ Nivel » *${level.toLocaleString('es-ES')}*\n`
    txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')} => ${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
    txt += `# Puesto » *#${Math.floor(Math.random() * 1000000).toLocaleString('es-ES')}*\n\n`
    txt += `✧ Valor total » *${money.toLocaleString('es-ES')}*\n`
    txt += `⛁ Monedas totales » *${money.toLocaleString('es-ES')} ${global.rpg?.emoticon?.('money') || '💰'}*\n`
    txt += `❒ Comandos totales » *${Math.floor(exp / 100).toLocaleString('es-ES')}*`

    // Enviar mensaje con imagen
    let img = await (await fetch(pp)).buffer().catch(_ => null)
    if (img) {
      await conn.sendFile(m.chat, img, 'profile.jpg', txt, m)
    } else {
      await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
    
  } catch (error) {
    console.error('Error en el comando perfil:', error)
    m.reply('⚠︎ Ocurrió un error al mostrar el perfil. Por favor intenta nuevamente.')
  }
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler