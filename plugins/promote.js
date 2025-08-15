const promoteHandler = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants, groupMetadata, usedPrefix, command }) => {
  // Verificar si el comando se usa en un grupo
  if (!m.isGroup) return m.reply('*✦ Este comando solo funciona en grupos*');

  // Verificar permisos - MODIFICACIÓN CLAVE: Owner puede usarlo sin ser admin
  if (!isAdmin && !isOwner && !isROwner) {
    return m.reply('*✦ Solo administradores del grupo pueden usar este comando*');
  }

  // Verificar si el bot es admin (necesario para la acción)
  if (!isBotAdmin) return m.reply('*✦ ¡El bot necesita ser administrador para realizar esta acción!*');

  // Obtener usuario a promover
  const userToPromote = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!userToPromote) {
    return m.reply(`*✦ Menciona o responde al mensaje del usuario*\nEjemplo: ${usedPrefix + command} @usuario`);
  }

  // Verificar si ya es admin
  const user = participants.find(p => p.id === userToPromote);
  if (user?.admin === 'admin' || user?.admin === 'superadmin') {
    return m.reply(`*✦ @${userToPromote.split('@')[0]} ya es administrador*`, null, { mentions: [userToPromote] });
  }

  try {
    // Promover al usuario
    await conn.groupParticipantsUpdate(m.chat, [userToPromote], 'promote');
    const actionUser = m.sender.split('@')[0];
    m.reply(`> ❀ El usuario @${userToPromote.split('@')[0]} ha sido promovido a administrador por @${actionUser}`, null, { 
      mentions: [userToPromote, m.sender] 
    });
  } catch (error) {
    console.error(error);
    m.reply('*✦ Error al promover. Verifica los permisos del bot.*');
  }
};

// Configuración del handler (IMPORTANTE)
promoteHandler.command = /^(promote|promover|daradmin|admin)$/i;
promoteHandler.group = true;
promoteHandler.botAdmin = true;  // Bot debe ser admin
promoteHandler.admin = true;    // Normalmente requiere admin del grupo
promoteHandler.owner = true;    // Pero owner puede saltarse el requisito de admin

// Info para el menú
promoteHandler.help = ['promote @usuario'];
promoteHandler.tags = ['group'];
promoteHandler.desc = 'Promueve usuarios a admin (usable por admins del grupo o owners del bot)';

export default promoteHandler;