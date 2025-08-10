import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';
import { Blob } from 'buffer';

const handler = async (m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime) return m.reply('Responde a una imagen o vídeo.');
  await m.react('⏳');

  try {
    const media = await q.download();
    const type = await fileTypeFromBuffer(media);
    
    if (!type) throw new Error('Formato no soportado');
    
    // Subir a Telegraph
    const telegraphUrl = await uploadToTelegraph(media, type.mime);
    const shortUrl = await shortUrl(telegraphUrl);
    
    const txt = `*Enlace generado:*\n\n` +
                `🔗 Original: ${telegraphUrl}\n` +
                `🔗 Acortado: ${shortUrl}\n` +
                `📦 Tamaño: ${formatBytes(media.length)}`;
    
    await m.reply(txt);
    await m.react('✅');
    
  } catch (err) {
    console.error(err);
    await m.react('❌');
    await m.reply('Error al procesar el archivo: ' + err.message);
  }
};

async function uploadToTelegraph(buffer, mimeType) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  form.append('file', blob, 'file');
  
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  });
  
  const data = await res.json();
  if (!data[0]?.src) throw new Error('Error al subir a Telegraph');
  return `https://telegra.ph${data[0].src}`;
}

async function shortUrl(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    return await res.text();
  } catch {
    return url; // Si falla el acortador, devuelve la URL original
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

handler.command = ['tourl', 'upload'];
export default handler;