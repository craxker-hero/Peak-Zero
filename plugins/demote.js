const demoteHandler = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants, groupMetadata, usedPrefix, command }) => {
  // Verificar si el comando se usa en un grupo
  if (!m.isGroup) return m.reply('*✦ Este comando solo funciona en grupos*');
  
  // Verificar permisos
  if (!isAdmin && !isOwner && !isROwner) return m.reply('*❮✦❯ Solo los administradores pueden usar este comando*');
  
  // Verificar si el bot es admin
  if (!isBotAdmin) return m.reply('*✦ ¡El bot necesita ser administrador para realizar esta acción!*');
  
  // Obtener el usuario mencionado o responder al mensaje
  const userToDemote = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  
  if (!userToDemote) return m.reply(`*✦ Menciona o responde al mensaje del usuario al que deseas quitarle admin*\n\n*Ejemplo:* ${usedPrefix + command} @usuario`);
  
  // Verificar si el usuario no es admin
  const user = participants.find(p => p.id === userToDemote);
  if (!user?.admin) {
    return m.reply(`*✦ @${userToDemote.split('@')[0]} no es administrador*`, null, { mentions: [userToDemote] });
  }
  
  try {
    // Degradar al usuario
    await conn.groupParticipantsUpdate(m.chat, [userToDemote], 'demote');
    m.reply(`*⚠︎ @${userToDemote.split('@')[0]} ya no es administrador*`, null, { mentions: [userToDemote] });
  } catch (error) {
    console.error(error);
    m.reply('*⚠︎ No se pudo quitar los privilegios de admin. Verifica los permisos del bot.*');
  }
};

// Configuración del comando
demoteHandler.command = /^(demote|degradar|quitaradmin|removeradmin)$/i;
demoteHandler.group = true;
demoteHandler.botAdmin = true;
demoteHandler.admin = true;
demoteHandler.owner = false;

// Nuevas propiedades para el menú
demoteHandler.help = ['demote @usuario'];
demoteHandler.tags = ['group'];
demoteHandler.desc = 'Quita los privilegios de administrador a un usuario';

export default demoteHandler;