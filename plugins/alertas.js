import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner, participants }) => {
  // Verificar si es un grupo
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  // Inicializar datos del chat si no existen
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  // Soporte para múltiples comandos: /enable alerts, /alert on, etc.
  const action = command.toLowerCase()
  const isEnable = ['enable', 'on', 'activar'].includes(action)
  const isDisable = ['disable', 'off', 'desactivar'].includes(action)

  // Verificar permisos para comandos de configuración
  if (isEnable || isDisable) {
    if (!(isAdmin || isOwner)) return m.reply('❀ Solo los administradores pueden usar este comando.')

    // Configurar el estado
    if (isEnable) {
      chat.alertas = true
      return m.reply('✰ *haz activado las alertas*')
    } else if (isDisable) {
      chat.alertas = false
      return m.reply('✰ *se han desactivado las alertas*')
    }
  }

  // Mostrar estado actual si no se especifica acción
  const status = chat.alertas !== false ? 'activada ✓' : 'desactivada ✗'
  const helpMessage = `
「　❀ 　Alertas　」

> ❏ La opción de alertas está ${status} un administrador puede activar o desactivar esta opción con el siguiente comando 

/alerts on/off 
/alerts enable/disable
/on alerts
/off alertas
`

  m.reply(helpMessage)
}

// Función para manejar eventos de promoción/democión
export async function handlePromoteDemote(chatUpdate) {
  try {
    const m = chatUpdate.messages[0]
    if (!m) return
    
    // Verificar si es un grupo
    if (!m.key.remoteJid.endsWith('@g.us')) return

    // Inicializar datos del chat si no existen
    if (!global.db.data.chats[m.key.remoteJid]) global.db.data.chats[m.key.remoteJid] = {}
    const chat = global.db.data.chats[m.key.remoteJid]

    // Si las alertas están desactivadas, no hacer nada
    if (chat.alertas === false) return

    // Detectar cambios de administrador (promote/demote)
    if (m.messageStubType === 21 || m.messageStubType === 22) {
      const actionUser = m.participant.split('@')[0]
      const targetUser = m.messageStubParameters[0].split('@')[0]
      const mentionActionUser = `@${actionUser}`
      const mentionTargetUser = `@${targetUser}`

      let message = ''
      if (m.messageStubType === 21) { // promote
        message = `> ❀ el usuario ${mentionTargetUser} ah sido promovido a administrador acción echa por ${mentionActionUser}`
      } else if (m.messageStubType === 22) { // demote
        message = `> ❀ el usuario ${mentionTargetUser} ah sido degradado de administrador acción echa por ${mentionActionUser}`
      }

      await conn.sendMessage(m.key.remoteJid, { 
        text: message, 
        mentions: [actionUser + '@s.whatsapp.net', targetUser + '@s.whatsapp.net'] 
      })
    }
  } catch (error) {
    console.error('Error en handlePromoteDemote:', error)
  }
}

// Comandos soportados (con alias)
handler.command = /^(enable|disable|on|off|activar|desactivar|alert|alerts|alertas)$/i

// Restricciones
handler.group = true
handler.admin = true
handler.register = true

// Info para el menú de ayuda
handler.tags = ['group']
handler.help = [
  'enable alerts',
  'disable alerts',
  'alert on',
  'alert off',
  'alerts'
].map(v => v + ' - Activa/desactiva alertas de cambios de admin')

export default handler