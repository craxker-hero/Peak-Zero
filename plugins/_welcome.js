import {WAMessageStubType} from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, {conn, participants, groupMetadata}) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://tinyurl.com/ylgu47w3')
  let img = await (await fetch(`${pp}`)).buffer()
  let chat = global.db.data.chats[m.chat]

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `*Bienvenido* a ${groupMetadata.subject}!
	✰ @${m.messageStubParameters[0].split`@`[0]}

bienvenido ${groupMetadata.subject} que disfrute su estadía

> 🜸 Puedes usar */help* para ver la lista de comandos.`

    await conn.sendAi(m.chat, botname, textbot, bienvenida, img, img, canal, estilo)
  }

  if (chat.bienvenida && m.messageStubType == 28) {
    let bye = `*Bienvenido* a ${groupMetadata.subject}!
	✰ @${m.messageStubParameters[0].split`@`[0]}

bienvenido ${groupMetadata.subject} que disfrute su estadía

> 🜸 Puedes usar */help* para ver la lista de comandos.`
    await conn.sendAi(m.chat, botname, textbot, bye, img, img, canal, estilo)
  }

  if (chat.bienvenida && m.messageStubType == 32) {
    let kick = `*Bienvenido* a ${groupMetadata.subject}!
	✰ @${m.messageStubParameters[0].split`@`[0]}

bienvenido ${groupMetadata.subject} que disfrute su estadía

> 🜸 Puedes usar */help* para ver la lista de comandos.`
    await conn.sendAi(m.chat, botname, textbot, kick, img, img, canal, estilo)
  }
}