import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'
import { totalmem, freemem } from 'os'
import { sizeFormatter } from 'human-readable'

let handler = async (m, { conn }) => {
  let format = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
  }) 
  let timestamp = speed()
  let latensi = speed() - timestamp

  let _muptime
    _muptime = await new Promise(resolve => {
        exec('cat /proc/uptime', (error, stdout) => {
            if (error) {
                resolve(0)
            } else {
                resolve(parseFloat(stdout.split(' ')[0]) * 1000)
            }
        })
    })
  let muptime = clockString(_muptime)

  // Primero envía el mensaje inicial
  let pingMsg = await conn.sendMessage(m.chat, { text: '✦ ¡Pong!' }, { quoted: m })
  
  // Luego edita el mensaje para agregar la información de latencia
  let finalMsg = `✦ ¡Pong!\n\n✰ ¡Pong!\n> Tiempo ⴵ ${latensi.toFixed(0)}ms`
  await conn.relayMessage(m.chat, {
    protocolMessage: {
      key: pingMsg.key,
      type: 14,
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

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map(v => v.toString().padStart(2, 0)).join('')
}