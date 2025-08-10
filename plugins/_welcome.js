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

Bienvenido a ${groupMetadata.subject}, que disfrute su estadía

> 🜸 Puedes usar */help* para ver la lista de comandos.`

    await conn.sendAi(m.chat, botname, textbot, bienvenida, img, img, canal, estilo)
  }

  if (chat.bienvenida && m.messageStubType == 28) {
    let bye = `*Hasta luego* de ${groupMetadata.subject}!
	✰ @${m.messageStubParameters[0].split`@`[0]}

Espero que vuelvas pronto a ${groupMetadata.subject}

> 🜸 Puedes usar */help* para ver la lista de comandos.`

    await conn.sendAi(m.chat, botname, textbot, bye, img, img, canal, estilo)
  }

  if (chat.bienvenida && m.messageStubType == 32) {
    // Obtener el admin que realizó la eliminación
    const admin = m.participants.find(p => p.admin && p.id !== m.messageStubParameters[0])
    const adminUsername = admin ? '@' + admin.id.split('@')[0] : '@admin'
    
    let kick = `*Hasta luego* de ${groupMetadata.subject}!
	✰ @${m.messageStubParameters[0].split`@`[0]}
        
         ✰ Eliminado por ${adminUsername}

Espero que vuelvas pronto a ${groupMetadata.subject}

> 🜸 Puedes usar */help* para ver la lista de comandos.`

    await conn.sendAi(m.chat, botname, textbot, kick, img, img, canal, estilo)
  }
}