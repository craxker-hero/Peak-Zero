import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';
import { Blob } from 'buffer';

// ================== FUNCIONES AUXILIARES ==================
async function uploadToCatbox(buffer) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', new Blob([buffer]), 'file');

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });
  
  const url = await res.text();
  if (!url.startsWith('http')) throw new Error('Error al subir a Catbox');
  return url;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// ================== HANDLER PRINCIPAL ==================
const handler = async (m) => {
  const user = m.pushName || 'Usuario';
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime) return m.reply('*✦  Por favor, responde a una imagen o video.*');
  await m.react('⏳');

  try {
    const media = await q.download();
    const type = await fileTypeFromBuffer(media);
    
    if (!type) throw new Error('Formato de archivo no soportado');
    
    const fileUrl = await uploadToCatbox(media);
    const fileSize = formatBytes(media.length);
    
    // Formateo del mensaje con el estilo solicitado
    const txt = `✦「 ¡File uploaded! 」\n\n` +
                `❏  » ${fileUrl}\n` +
                `❀  » ${fileSize}\n` +
                `↺  » ${user}`;

    await m.reply(txt);
    await m.react('✅');
    
  } catch (err) {
    console.error(err);
    await m.react('❌');
    await m.reply('*⚠︎  Error al procesar el archivo:*\n' + err.message);
  }
};

// ================== CONFIGURACIÓN ==================
handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['tourl', 'upload', 'subir'];
export default handler;