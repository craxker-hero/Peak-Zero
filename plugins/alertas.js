const handler = async (m, { conn }) => {
  // Ignora si no es un grupo
  if (!m.isGroup) return;
  
  // Solo reacciona a actualizaciones de participantes
  if (!m.type === 'participantsUpdate') return;

  const groupData = await conn.groupMetadata(m.chat);
  const participants = m.participants;

  participants.forEach(async (user) => {
    // Caso 1: Usuario promovido a admin
    if (user.admin === 'admin' || user.admin === 'superadmin') {
      const actionUser = m.sender.split('@')[0];
      const targetUser = user.id.split('@')[0];
      
      await conn.sendMessage(m.chat, {
        text: `> ❀ @${targetUser} ha sido promovido a administrador por @${actionUser}`,
        mentions: [user.id, m.sender]
      });
    } 
    // Caso 2: Usuario degradado de admin
    else if (user.admin === null) {
      const actionUser = m.sender.split('@')[0];
      const targetUser = user.id.split('@')[0];
      
      await conn.sendMessage(m.chat, {
        text: `> ❀ @${targetUser} ha sido degradado de administrador por @${actionUser}`,
        mentions: [user.id, m.sender]
      });
    }
  });
};

// Configuración del plugin
handler.event = 'group-participants.update';
handler.group = true;
handler.registers = true;

export default handler;