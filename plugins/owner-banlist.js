let handler = async (m, { conn, isOwner }) => {
  let chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned)
  let users = Object.entries(global.db.data.users).filter(user => user[1].banned)
  
  let userList = users.length ? 
    users.map(([jid], i) => `❐ ${isOwner ? '@' + jid.split('@')[0] : jid}`).join('\n') : 
    '❀ No hay usuarios baneados'
  
  let chatList = chats.length ? 
    chats.map(([jid], i) => `❐ ${isOwner ? '@' + jid.split('@')[0] : jid}`).join('\n') : 
    '❀ No hay chats baneados'

  let caption = `
❐　「 *Usuarios Baneados* 」
✦ » *Total* : ${users.length}
${userList}


❐　「 *Chats Baneados* 」
✦ » *Total* : ${chats.length}
${chatList}

`.trim()

  await m.reply(caption, null, { mentions: conn.parseMention(caption) })
}

handler.help = ['banlist']
handler.tags = ['owner']
handler.command = /^banlist(ned)?|ban(ned)?list|daftarban(ned)?$/i
handler.rowner = true

export default handler