import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner }) => {
  // Verificar si es un grupo
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  // Inicializar datos del chat si no existen
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  // Soporte para múltiples comandos: /enable alerts, /alert on, etc.
  const action = command.toLowerCase()
  const isEnable = ['enable', 'on', 'activar'].includes(action)
  const isDisable = ['disable', 'off', 'desactivar'].includes(action)

  // Verificar permisos
  if (!(isAdmin || isOwner)) return m.reply('❀ Solo los administradores pueden usar este comando.')

  // Configurar el estado
  if (isEnable) {
    chat.alertas = true
    return m.reply('✰ *haz activado las alertas*')
  } else if (isDisable) {
    chat.alertas = false
    return m.reply('✰ *se han desactivado las alertas *')
  }

  // Mostrar ayuda si no se reconoce el comando
  const helpMessage = `
「✧」 *Uso correcto:*
• *Activar:* ${usedPrefix}enable alerts
• *Desactivar:* ${usedPrefix}disable alerts

「✧」 *Alternativas:*
• ${usedPrefix}alert on / ${usedPrefix}alert off
• ${usedPrefix}alerts enable / ${usedPrefix}alerts disable
`
  m.reply(helpMessage)
}

// Comandos soportados (con alias)
handler.command = /^(enable|disable|on|off|activar|desactivar|alert|alerts)$/i

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
  'alert off'
].map(v => v + ' - Activa/desactiva alertas de cambios de admin')

export default handler