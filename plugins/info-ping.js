import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const start = performance.now()

  // Obtener el número del bot actual (la sesión activa)
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = path.join('./JadiBots', botActual, 'config.json')

  let nombreBot = global.namebot || '✧ ʏᴜʀᴜ ʏᴜʀɪ ✧'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.log('⚠︎ No se pudo leer config del subbot:', err)
    }
  }

  // Enviar mensaje inicial con el emoji ✰
  const sentMsg = await conn.sendMessage(m.chat, { text: '❀　¡Pong!' }, { quoted: m })

  const end = performance.now()
  const realPing = Math.round(end - start)

  // Editar el mensaje original con el formato deseado
  await conn.relayMessage(m.chat, {
    protocolMessage: {
      key: sentMsg.key,
      type: 14,
      editedMessage: {
        conversation: `❀　¡Pong!\n> Tiempo ⴵ ${realPing}ms`
      }
    }
  }, {})
}

handler.command = ['p', 'ping']
export default handler