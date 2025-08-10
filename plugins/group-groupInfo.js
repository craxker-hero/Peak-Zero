//

let handler = async (m, { conn, participants, groupMetadata }) => {
    const { welcome, antiLink, delete: del, detect } = global.db.data.chats[m.chat]
    const owner = groupMetadata.owner || participants.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    const botStatus = participants.find(p => p.id === conn.user.jid) ? '✓' : '✗'
    
    let text = `
❏ ${groupMetadata.subject} ❐
❖» @${owner.split('@')[0]}
✿» ${participants.length} participantes

✰» Bot ${conn.user.name} ${botStatus}
✰» Anti-links ${antiLink ? '✓' : '✗'}
✰» Bienvenida ${welcome ? '✓' : '✗'}
✰» Alertas ${detect ? '✓' : '✗'}
`.trim()

    await conn.reply(m.chat, text, m, {
        mentions: [owner]
    })
}

handler.help = ['infogp']
handler.tags = ['group']
handler.command = ['infogrupo', 'groupinfo', 'infogp'] 
handler.group = true

export default handler