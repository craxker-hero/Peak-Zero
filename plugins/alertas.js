import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner, participants }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const action = command.toLowerCase()
  const isEnable = ['enable', 'on', 'activar'].includes(action)
  const isDisable = ['disable', 'off', 'desactivar'].includes(action)

  if (isEnable || isDisable) {
    if (!(isAdmin || isOwner)) return m.reply('❀ Solo los administradores pueden usar este comando.')

    if (isEnable) {
      chat.alertas = true
      return m.reply('✰ *haz activado las alertas*')
    } else if (isDisable) {
      chat.alertas = false
      return m.reply('✰ *se han desactivado las alertas*')
    }
  }

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

// Función mejorada para manejar eventos de promoción/democión
export async function handlePromoteDemote(chatUpdate) {
  try {
    const m = chatUpdate.messages[0]
    if (!m) return
    
    if (!m.key.remoteJid.endsWith('@g.us')) return

    const chatJid = m.key.remoteJid
    if (!global.db.data.chats[chatJid]) global.db.data.chats[chatJid] = {}
    const chat = global.db.data.chats[chatJid]

    if (chat.alertas === false) return

    if (m.messageStubType === 21 || m.messageStubType === 22) {
      // Obtener información del que realizó la acción y el afectado
      const actionUser = m.participant
      const targetUser = m.messageStubParameters[0]
      
      // Obtener metadatos del grupo para verificar si son administradores
      const groupMetadata = await global.conn.groupMetadata(chatJid).catch(e => console.error(e))
      const participants = groupMetadata?.participants || []
      
      const actionParticipant = participants.find(p => p.id === actionUser)
      const targetParticipant = participants.find(p => p.id === targetUser)

      // Solo continuar si ambos usuarios existen en el grupo
      if (!actionParticipant || !targetParticipant) return

      let message = ''
      if (m.messageStubType === 21) { // promote
        message = `> ❀ El usuario @${targetUser.split('@')[0]} ha sido promovido a administrador\n> Acción realizada por: @${actionUser.split('@')[0]}`
      } else if (m.messageStubType === 22) { // demote
        message = `> ❀ El usuario @${targetUser.split('@')[0]} ha sido degradado de administrador\n> Acción realizada por: @${actionUser.split('@')[0]}`
      }

      // Enviar mensaje con menciones
      await global.conn.sendMessage(chatJid, { 
        text: message, 
        mentions: [actionUser, targetUser]
      })
    }
  } catch (error) {
    console.error('Error en handlePromoteDemote:', error)
  }
}

handler.command = /^(enable|disable|on|off|activar|desactivar|alert|alerts|alertas)$/i
handler.group = true
handler.admin = true
handler.register = true

handler.tags = ['group']
handler.help = [
  'enable alerts',
  'disable alerts',
  'alert on',
  'alert off',
  'alerts'
].map(v => v + ' - Activa/desactiva alertas de cambios de admin')

export default handler