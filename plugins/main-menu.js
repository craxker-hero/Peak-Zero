import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

let tags = {
  'main': 'Information',
  'search': 'Search',
  'game': 'Games',
  'serbot': 'Sub-Bots',
  'rpg': 'Rpg',
  'rg': 'Registro',
  'sticker': 'Sticker',
  'img': 'Image',
  'group': 'Groups',
  'nable': 'On / Off',
  'premium': 'Premium',
  'downloader': 'Download',
  'tools': 'Tools',
  'fun': 'Fun',
  'nsfw': 'Nsfw',
  'cmd': 'Database',
  'owner': 'Creador',
  'audio': 'Audios',
  'advanced': 'Avanzado',
}

const defaultMenu = {
  before: `
─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

*Hola %name soy Peak-Zero, %greeting*

╭── ︿︿︿︿︿ ⭒   ⭒   ⭒   ⭒   ⭒   ⭒
┊ ‹‹ Hello :: %name
┊•⁀➷ °⭒⭒⭒ 【 ✯ Peak-Zero.✰ 】
╰─── ︶︶︶︶ ✰⃕  ⌇ ⭒ ⭒ ⭒   ˚̩̥̩̥̩̩͙✩
┊🍬 [ Modo :: Público
┊📚 [ Baileys :: Multi Device
┊⏱ [ Tiempo Activo :: %uptime
┊👤 [ Usuarios :: %totalreg
╰─────────
%readmore
─ׄ─ׅ─ׄ─⭒ L I S T A  -  M E N Ú S ⭒─ׄ─ׅ─ׄ─
`.trimStart(),
  header: '╭── ︿︿︿︿︿ *⭒   ⭒   ⭒   ⭒   ⭒   ⭒*\n┊ ‹‹ *Category* :: *%category*\n┊•*⁀➷ °⭒⭒⭒ •*⁀➷ °⭒⭒⭒\n╰─── ︶︶︶︶ ✰⃕  ⌇ *⭒ ⭒ ⭒*   ˚̩̥̩̥*̩̩͙✩',
  body: '│❄️⃟🎄┊%cmd %islimit %isPremium\n',
  footer: '╰─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒\n',
  after: `> [ ✰ ] ${textbot}`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(() => ({}))) || {}
    let { exp, limit, level } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    
    for (let plugin of help)
      if (plugin && 'tags' in plugin)
        for (let tag of plugin.tags)
          if (!(tag in tags) && tag) tags[tag] = tag
    
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : ``) + defaultMenu.after
    
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    
    let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime, _uptime,
      taguser: '@' + m.sender.split("@s.whatsapp.net")[0],
      wasp: '@0',
      me: conn.getName(conn.user.jid),
      npmname: _package.name,
      version: _package.version,
      npmdesc: _package.description,
      npmmain: _package.main,
      author: _package.author.name,
      license: _package.license,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: _package.homepage ? _package.homepage.url || _package.homepage : '[unknown github url]',
      greeting, level, limit, name, totalreg, rtotalreg,
      readmore: readMore
    }
    
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('⭐')

    // Enviar imagen grande como vista previa
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        externalAdReply: {
          title: "Peak-Zero",
          body: "developed by あ ┊ 𝐂𝐫𝐚𝐱𝐤𝐞𝐫",
          thumbnailUrl: "https://files.catbox.moe/aoeq17", // Imagen grande
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: true, // Hacer la miniatura más grande
          showAdAttribution: false
        }
      },
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    await m.react('✖️')
    throw e
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menú']
handler.register = true

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let horas = Math.floor(ms / 3600000)
  let minutos = Math.floor(ms / 60000) % 60
  let segundos = Math.floor(ms / 1000) % 60
  return [horas, minutos, segundos].map((v) => v.toString().padStart(2, 0)).join(":")
}

var ase = new Date();
var hour = ase.getHours();
switch(hour) {
  case 0: hour = 'una linda noche 🌙'; break;
  case 1: hour = 'una linda noche 💤'; break;
  case 2: hour = 'una linda noche 🦉'; break;
  case 3: hour = 'una linda mañana ✨'; break;
  case 4: hour = 'una linda mañana 💫'; break;
  case 5: hour = 'una linda mañana 🌅'; break;
  case 6: hour = 'una linda mañana 🌄'; break;
  case 7: hour = 'una linda mañana 🌅'; break;
  case 8: hour = 'una linda mañana 💫'; break;
  case 9: hour = 'una linda mañana ✨'; break;
  case 10: hour = 'un lindo dia 🌞'; break;
  case 11: hour = 'un lindo dia 🌨'; break;
  case 12: hour = 'un lindo dia ❄'; break;
  case 13: hour = 'un lindo dia 🌤'; break;
  case 14: hour = 'una linda tarde 🌇'; break;
  case 15: hour = 'una linda tarde 🥀'; break;
  case 16: hour = 'una linda tarde 🌹'; break;
  case 17: hour = 'una linda tarde 🌆'; break;
  case 18: hour = 'una linda noche 🌙'; break;
  case 19: hour = 'una linda noche 🌃'; break;
  case 20: hour = 'una linda noche 🌌'; break;
  case 21: hour = 'una linda noche 🌃'; break;
  case 22: hour = 'una linda noche 🌙'; break;
  case 23: hour = 'una linda noche 🌃'; break;
}
var greeting = "espero que tengas " + hour;