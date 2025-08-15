import './plugins/alertas.js';
import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

// Función de registro automático
function autoRegister(user, m) {
  if (!user.registered) {
    user.registered = true
    user.name = m.pushName || 'Usuario'
    user.regTime = Date.now()
    user.age = -1
    user.role = 'Nuv'
    user.exp = 0
    user.coin = 10
    user.diamond = 3
  }
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  
  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    
    m.exp = 0
    m.coin = false

    try {
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {}

      // Registro automático
      autoRegister(global.db.data.users[m.sender], m)

      if (user) {
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.coin)) user.coin = 10
        if (!isNumber(user.joincount)) user.joincount = 1
        if (!isNumber(user.diamond)) user.diamond = 3
        if (!isNumber(user.lastadventure)) user.lastadventure = 0
        if (!isNumber(user.lastclaim)) user.lastclaim = 0
        if (!isNumber(user.health)) user.health = 100
        if (!isNumber(user.crime)) user.crime = 0
        if (!isNumber(user.lastcofre)) user.lastcofre = 0
        if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0
        if (!isNumber(user.lastpago)) user.lastpago = 0
        if (!isNumber(user.lastcode)) user.lastcode = 0
        if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
        if (!isNumber(user.lastduel)) user.lastduel = 0
        if (!isNumber(user.lastmining)) user.lastmining = 0
        if (!('muto' in user)) user.muto = false
        if (!('premium' in user)) user.premium = false
        if (!user.premium) user.premiumTime = 0
        if (!('genre' in user)) user.genre = ''
        if (!('birth' in user)) user.birth = ''
        if (!('marry' in user)) user.marry = ''
        if (!('description' in user)) user.description = ''
        if (!('packstickers' in user)) user.packstickers = null
        if (!isNumber(user.afk)) user.afk = -1
        if (!('afkReason' in user)) user.afkReason = ''
        if (!('banned' in user)) user.banned = false
        if (!('useDocument' in user)) user.useDocument = false
        if (!isNumber(user.level)) user.level = 0
        if (!isNumber(user.bank)) user.bank = 0
        if (!isNumber(user.warn)) user.warn = 0
      }
    } catch (e) {
      console.error(e)
    }

    let _user = global.db.data?.users?.[m.sender]

    const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
    const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
    const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) || _user?.premium == true

    if (m.isBaileys) return
    if (opts['nyimak']) return
    if (!isROwner && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    if (m.isGroup) {
      let chat = global.db.data.chats[m.chat]
      if (chat?.primaryBot && this?.user?.jid !== chat.primaryBot) {
        return
      }
    }

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    m.exp += Math.ceil(Math.random() * 10)

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    let usedPrefix = ''

    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(___dirname, name)
      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
        } catch (e) {
          console.error(e)
        }
      }

      if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
      let match = (_prefix instanceof RegExp ? 
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ?
        _prefix.map(p => {
          let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
          return [re.exec(m.text), re]
        }) :
        typeof _prefix === 'string' ?
        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
        [[[], new RegExp]]
      ).find(p => p[1])

      if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, {
          match,
          conn: this,
          participants: m.isGroup ? (await this.groupMetadata(m.chat)).participants : [],
          groupMetadata: m.isGroup ? await this.groupMetadata(m.chat) : {},
          user: _user,
          isROwner,
          isOwner,
          isMods,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename
        })) continue
      }

      if (typeof plugin !== 'function') continue

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
        args = args || []
        let _args = noPrefix.trim().split` `.slice(1)
        let text = _args.join` `
        command = (command || '').toLowerCase()

        let isAccept = plugin.command instanceof RegExp ? 
          plugin.command.test(command) :
          Array.isArray(plugin.command) ?
          plugin.command.some(cmd => cmd instanceof RegExp ? 
            cmd.test(command) : cmd === command) :
          typeof plugin.command === 'string' ? 
          plugin.command === command : false

        if (!isAccept) continue

        m.plugin = name
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          let chat = global.db.data.chats[m.chat]
          let user = global.db.data.users[m.sender]
          if (chat?.isBanned && !isROwner) return
          if (user?.banned && !isROwner) {
            m.reply(`✧ Estás baneado/a y no puedes usar comandos\n${user.bannedReason ? `Motivo: ${user.bannedReason}` : 'Motivo no especificado'}`)
            return
          }
        }

        let fail = plugin.fail || global.dfail
        if (plugin.rowner && !isROwner) {
          fail('rowner', m, this, usedPrefix, command)
          continue
        }
        if (plugin.owner && !isOwner) {
          fail('owner', m, this, usedPrefix, command)
          continue
        }
        if (plugin.mods && !isMods) {
          fail('mods', m, this, usedPrefix, command)
          continue
        }
        if (plugin.premium && !isPrems) {
          fail('premium', m, this, usedPrefix, command)
          continue
        }
        if (plugin.group && !m.isGroup) {
          fail('group', m, this, usedPrefix, command)
          continue
        }
        if (plugin.botAdmin && !(await this.groupMetadata(m.chat)).participants.find(p => p.id === this.user.jid)?.admin) {
          fail('botAdmin', m, this, usedPrefix, command)
          continue
        }
        if (plugin.admin && !(await this.groupMetadata(m.chat)).participants.find(p => p.id === m.sender)?.admin) {
          fail('admin', m, this, usedPrefix, command)
          continue
        }
        if (plugin.private && m.isGroup) {
          fail('private', m, this, usedPrefix, command)
          continue
        }

        m.isCommand = true
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
        m.exp += xp

        if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
          conn.reply(m.chat, `✧ No tienes suficientes ${moneda}`, m)
          continue
        }

        if (plugin.level > _user.level) {
          conn.reply(m.chat, `✧ Requieres nivel ${plugin.level} (tienes ${_user.level})`, m)
          continue
        }

        try {
          await plugin.call(this, m, {
            match,
            usedPrefix,
            noPrefix,
            args,
            command,
            text,
            conn: this,
            isROwner,
            isOwner,
            isMods,
            isPrems
          })
        } catch (e) {
          console.error(e)
          m.reply(format(e))
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn, usedPrefix, command) => {
  const msg = {
    rowner: '✧ Solo el dueño del socket puede usar este comando',
    owner: '✧ Solo el propietario del bot puede usar este comando',
    mods: '✧ Solo los Moderadores pueden usar este comando',
    premium: '✧ Solo usuarios Premium pueden usar este comando',
    group: '✧ Este comando es solo para grupos',
    private: '✧ Solo en privado puedes usar este comando',
    admin: '✧ Solo administradores del grupo pueden usar este comando',
    botAdmin: '✧ El bot debe ser admin para usar este comando',
    restrict: '✧ Esta función está deshabilitada'
  }[type]

  if (msg) return conn.reply(m.chat, msg, m)

  let file = global.__filename(import.meta.url, true)
  watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
  })
}