const promoteHandler = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants, groupMetadata, usedPrefix, command }) => {
  // Verificar si el comando se usa en un grupo
  if (!m.isGroup) return m.reply('*✦ Este comando solo funciona en grupos*');
  
  // Verificar permisos
  if (!isAdmin && !isOwner && !isROwner) return m.reply('*❮✦❯ Solo los administradores pueden usar este comando*');
  
  // Verificar si el bot es admin
  if (!isBotAdmin) return m.reply('*✦ ¡El bot necesita ser administrador para realizar esta acción!*');
  
  // Obtener el usuario mencionado o responder al mensaje
  const userToPromote = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  
  if (!userToPromote) return m.reply(`*✦ Menciona o responde al mensaje del usuario que deseas hacer admin*\n\n*Ejemplo:* ${usedPrefix + command} @usuario`);
  
  // Verificar si el usuario ya es admin
  const user = participants.find(p => p.id === userToPromote);
  if (user?.admin === 'admin' || user?.admin === 'superadmin') {
    return m.reply(`*✦ @${userToPromote.split('@')[0]} ya es administrador*`, null, { mentions: [userToPromote] });
  }
  
  try {
    // Promover al usuario
    await conn.groupParticipantsUpdate(m.chat, [userToPromote], 'promote');
    m.reply(`*✦ @${userToPromote.split('@')[0]} ha sido promovido a administrador*`, null, { mentions: [userToPromote] });
  } catch (error) {
    console.error(error);
    m.reply('*⚠︎ No se pudo promover al usuario. Verifica los permisos del bot.*');
  }
};

// Configuración del comando
promoteHandler.command = /^(promote|promover|daradmin|admin)$/i;
promoteHandler.group = true;
promoteHandler.botAdmin = true;
promoteHandler.admin = true;
promoteHandler.owner = false;

// Nuevas propiedades para el menú
promoteHandler.help = ['promote @usuario'];
promoteHandler.tags = ['group'];
promoteHandler.desc = 'Promueve a un usuario a administrador del grupo';

export default promoteHandler;