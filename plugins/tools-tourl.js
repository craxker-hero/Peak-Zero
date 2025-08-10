import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';
import { Blob } from 'buffer';

// Funciones auxiliares primero para evitar errores de referencia
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

async function shortUrl(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    return await res.text();
  } catch {
    return url;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// Handler principal
const handler = async (m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime) return m.reply('[ ✰ ] Responde a una imagen o video.');
  await m.react('⏳');

  try {
    const media = await q.download();
    const type = await fileTypeFromBuffer(media);
    
    if (!type) throw new Error('Formato no soportado');
    
    const fileUrl = await uploadToCatbox(media);
    const shortenedUrl = await shortUrl(fileUrl);
    
    const txt = `*Enlace generado:*\n\n` +
                `🔗 Original: ${fileUrl}\n` +
                `🔗 Acortado: ${shortenedUrl}\n` +
                `📦 Tamaño: ${formatBytes(media.length)}`;
    
    await m.reply(txt);
    await m.react('✅');
    
  } catch (err) {
    console.error(err);
    await m.react('❌');
    await m.reply('Error al procesar el archivo: ' + err.message);
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['tourl', 'upload'];
export default handler;