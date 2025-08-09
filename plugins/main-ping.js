import speed from 'performance-now'

let handler = async (m, { conn }) => {
  // Iniciamos el temporizador
  let timestamp = speed()
  
  // Enviamos el primer mensaje "✦ ¡Pong!"
  let pingMsg = await conn.sendMessage(m.chat, { text: '✦ ¡Pong!' }, { quoted: m })
  
  // Calculamos la latencia
  let latensi = speed() - timestamp
  
  // Preparamos el mensaje editado (solo con la nueva versión)
  let finalMsg = `✰ ¡Pong!\n> Tiempo ⴵ ${latensi.toFixed(0)}ms`
  
  // Editamos el mensaje original
  await conn.relayMessage(m.chat, {
    protocolMessage: {
      key: pingMsg.key,
      type: 14, // Tipo de mensaje editado
      editedMessage: {
        conversation: finalMsg
      }
    }
  }, {})
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'speed', 'p']
export default handler