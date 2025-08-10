import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';

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
    const telegraphUrl = await uploadToTelegraph(media, type.ext);
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
    await m.reply('Error al procesar el archivo.');
  }
};

async function uploadToTelegraph(buffer, ext) {
  const form = new FormData();
  form.append('file', buffer, { filename: `file.${ext}` });
  
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  });
  
  const data = await res.json();
  if (!data[0]?.src) throw new Error('Error al subir');
  return `https://telegra.ph${data[0].src}`;
}

// Mantén tus funciones shortUrl y formatBytes existentes

handler.command = ['tourl', 'upload'];
export default handler;