import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

// Definición de greeting primero para que esté disponible
const horaActual = new Date().getHours()
const saludos = {
  0: 'buenas noches 🌙',  1: 'buenas noches 🌙',  2: 'buenas noches 🌙',
  3: 'buenas noches 🌙',  4: 'buenas noches 🌙',  5: 'buenas noches 🌙',
  6: 'buenos días 🌞',    7: 'buenos días 🌞',    8: 'buenos días 🌞',
  9: 'buenos días 🌞',   10: 'buenos días 🌞',   11: 'buenos días 🌞',
  12: 'buenas tardes 🌅', 13: 'buenas tardes 🌅', 14: 'buenas tardes 🌅',
  15: 'buenas tardes 🌅', 16: 'buenas tardes 🌅', 17: 'buenas tardes 🌅',
  18: 'buenas noches 🌙', 19: 'buenas noches 🌙', 20: 'buenas noches 🌙',
  21: 'buenas noches 🌙', 22: 'buenas noches 🌙', 23: 'buenas noches 🌙',
}
const greeting = saludos[horaActual] || 'un buen día'

// Tags y emojis
const tags = {
  serbot: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🥠 *`𝖩𝖺𝖽ı-ᗷᨣƚ𝗌`*     ׅ🥠ׁ᷒ᮬ    ׅ',
  eco: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🥧  *`𝖤𝖼ᨣ𝗇ᨣ𝗆ı𝖺`*     ׅ🥧ׁ᷒ᮬ    ׅ',
  downloader: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🍹  *`𝖣ᨣ𝗐𝗇𝗅ᨣ𝖺𝖽ᧉꭇ𝗌`*     ׅ🍹ׁ᷒ᮬ    ׅ',
  tools: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🪾  *`𝖳ᨣᨣ𝗅𝗌`*     ׅ🪾ׁ᷒ᮬ    ׅ',
  owner: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🌴  *`Oɯ𝗇ᧉꭇ`*     ׅ🌴ׁ᷒ᮬ    ׅ',
  info: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🌻  *`𝖨𝗇ẜᨣ`*     ׅ🌻ׁ᷒ᮬ    ׅ',
  gacha: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🌸  *`𝖠𝗇ı𝗆ᧉ`*     ׅ🌸ׁ᷒ᮬ    ׅ',
  group: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🪹  *`Gꭇ𝗎𝗉ᨣ𝗌`*     ׅ🪹ׁ᷒ᮬ    ׅ',
  search: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🐞  *`𝖨𝗇ƚᧉꭇ𝗇ᧉƚ`*     ׅ🐞ׁ᷒ᮬ    ׅ',
  sticker: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🍒  *`𝖲ƚ𝗂𝖼𝗄ᧉꭇ`*     ׅ🍒ׁ᷒ᮬ    ׅ',
  ia: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🍓  *`𝖨𝗇ƚᧉ𝖨ı𝗀ᧉ𝗇𝖼ı𝖺𝗌`*     ׅ🍓ׁ᷒ᮬ    ׅ',
  channel: '*⁞)᷼͝ㅤ֯ㅤֶָ֢  🍥  `𝖢𝖺𝗇𝖺𝗅ᧉ𝗌`*     ׅ🍥ׁ᷒ᮬ    ׅ',
  fun: '⁞)᷼͝ㅤ֯ㅤֶָ֢  🍚  *`𝖥𝗎𝗇`*     ׅ🍚ׁ᷒ᮬ    ׅ',
}

const emojis = {
  serbot: '🥠',
  eco: '🥧',
  downloader: '🍹',
  tools: '🪾',
  owner: '🌴',
  info: '🌻',
  gacha: '🌸',
  group: '🪹',
  search: '🐞',
  sticker: '🍒',
  ia: '🍓',
  channel: '🍥',
  fun: '🍚',
}

// Configuración del propietario corregida
const owner = "5492916439595@s.whatsapp.net"
const ownerMention = owner.split('@')[0]
const creatorNumber = '5492916439595'

// Función de estilo mejorada
let estilo = (text, style = 1) => {
  const xStr = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0']
  const yStr = Object.freeze({
    1: ['𝖺','𝖻','𝖼','𝖽','𝖾','𝖿','𝗀','𝗁','𝗂','𝗃','𝗄','𝗅','𝗆','𝗇','𝗈','𝗉','𝗊','𝗋','𝗌','𝗍','𝗎','𝗏','𝗐','𝗑','𝗒','𝗓','1','2','3','4','5','6','7','8','9','0']
  })

  const replacer = xStr.map((v, i) => ({
    original: v,
    convert: yStr[style][i]
  }))
  
  return text.toLowerCase().split('').map(v => {
    const find = replacer.find(x => x.original === v)
    return find ? find.convert : v
  }).join('')
}

// Plantilla del menú
const defaultMenu = {
  before: `
\`\`\`ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ \`\`\`
\`\`\` Ꮚ ׅ %greeting ৎ୭ \`\`\`
\`\`\`   ׅ ෫%taguser ಒ \`\`\`

\`\`\`ৎּٜ̊🌴ꨩ໋〪̥〭 𝖭𝗈𝗆𝖻𝗋𝖾 : %name \`\`\`
\`\`\`ৎּٜ̊🌳ꨩ໋〪̥〭 𝖬𝗈𝖽𝗈 : publico \`\`\`
\`\`\`ৎּٜ̊🌱ꨩ໋〪̥〭 𝖱𝗎𝗇 : [%uptime] \`\`\`
\`\`\`ৎּٜ̊🪹ꨩ໋〪̥〭 𝖮𝗐𝗇𝖾𝗋 : @${ownerMention} \`\`\`
\`\`\`ৎּٜ̊🥦ꨩ໋〪̥〭 𝖯𝗋𝖾𝖿𝗂𝗑 : ( ! . / ) \`\`\`
\`\`\`ৎּٜ̊🍒ꨩ໋〪̥〭 𝖢𝗈𝗆𝖺𝗇𝖽𝗈𝗌 : %totalf \`\`\`
\`\`\`ৎּٜ̊🍵ꨩ໋〪̥〭 𝖵𝖾𝗋𝗌𝗂𝗈𝗇 : 1.0.0-beta \`\`\`

%readmore`.trimStart(),
  header: '\n%category',
  body: '°𓃉𐇽ܳ𓏸%emojiᮬᩬִּ〫᪲۟. %cmd %islimit %isPremium',
  footer: '',
  after: '\n> 𝖯𝗈𝗐𝖾𝗋 𝖡𝗒 𝖨𝗓𝗎𝗆𝗂 - 𝖬𝖺𝗈 𝖢𝗁𝖺𝗇',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Verificar y crear directorio JadiBots si no existe
    if (!fs.existsSync('./JadiBots')) {
      fs.mkdirSync('./JadiBots')
    }

    const { exp, limit, level } = global.db.data.users[m.sender] || { exp: 0, limit: 0, level: 0 }
    const { min, xp, max } = xpRange(level, global.multiplier || 1)
    const name = await conn.getName(m.sender).catch(() => 'Usuario')

    // Contar comandos totales
    const totalf = Object.values(global.plugins || {}).reduce((total, plugin) => {
      if (plugin.command) {
        return total + (Array.isArray(plugin.command) ? plugin.command.length : 1
      }
      return total
    }, 0)

    const d = new Date()
    const locale = 'es'
    const date = d.toLocaleDateString(locale, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })

    // Procesar plugins para el menú
    const help = Object.values(global.plugins || {})
      .filter(p => !p.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help || ''],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags || ''],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit || false,
        premium: plugin.premium || false,
      }))

    // Configuración del bot
    let nombreBot = global.namebot || 'Jadi-Bot'
    let bannerFinal = 'https://iili.io/FrbNIr7.jpg'
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '') || ''

    // Cargar configuración personalizada si existe
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.error('Error al leer config.json:', err)
      }
    }

    const tipo = botActual === '50493059810' ? 'Principal 🪴' : 'Sub Bot 🍃'

    // Generar texto del menú
    const menuConfig = conn.menu || defaultMenu
    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        const icon = emojis[tag] || ''
        const title = tags[tag]
        const h = menuConfig.header
          .replace(/%emoji/g, icon)
          .replace(/%category/g, title)
        
        const b = help
          .filter(menu => menu.tags?.includes(tag))
          .map(menu => menu.help.map(helpText =>
            menuConfig.body
              .replace(/%emoji/g, icon)
              .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
              .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
              .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
              .trim()
          ).join('\n')).join('\n')
        
        return [h, b, menuConfig.footer].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    // Reemplazos para el texto
    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + (m.sender.split('@')[0] || ''),
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - xp,
      level,
      limit,
      name,
      totalf,
      date,
      uptime: clockString(process.uptime() * 1000),
      tipo,
      readmore: readMore,
      greeting,
    }

    // Aplicar reemplazos al texto
    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name] || '')
    )

    // Enviar mensaje con el menú
    await conn.sendMessage(m.chat, {
      text: estilo(text),
      mentions: [m.sender, owner],
      contextInfo: {
        externalAdReply: {
          title: nombreBot,
          body: date,
          thumbnailUrl: bannerFinal,
          sourceUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('Error en el menú:', e)
    conn.reply(m.chat, '❎ Ocurrió un error al mostrar el menú. Por favor intenta nuevamente.', m)
  }
}

// Configuración del handler
handler.command = ['menu', 'help', 'menú']
handler.register = true
export default handler

// Funciones auxiliares
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}