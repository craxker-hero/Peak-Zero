const handler = async (m, { conn }) => {
  if (!m.isGroup || !Array.isArray(m.participants)) return

  try {
    // Agrega delay antes de obtener metadata
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const groupData = await conn.groupMetadata(m.chat).catch(() => null)
    if (!groupData) return

    for (const user of m.participants) {
      // Agrega delay entre cada procesamiento de usuario
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (['admin', 'superadmin'].includes(user.admin)) {
        await safeSend(m.chat, {
          text: `✧ @${user.id.split('@')[0]} promovido por admin`,
          mentions: [user.id]
        })
      } else if (user.admin === null) {
        await safeSend(m.chat, {
          text: `✧ @${user.id.split('@')[0]} degradado por admin`,
          mentions: [user.id]
        })
      }
    }
  } catch (error) {
    console.error('Error en alertas:', error)
  }
}

// Configuración del plugin
handler.event = 'group-participants.update';
handler.group = true;
handler.registers = true;

export default handler;