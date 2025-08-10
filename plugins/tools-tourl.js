import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Constantes
const rwait = '⏳';
const done = '✅';
const error = '❌';
const emoji = '🖼️';
const dev = 'TuNombre';
const fkontak = {};

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `${emoji} Responde a una imagen o vídeo.`, m);
  
  await m.react(rwait);
  
  try {
    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    let link = await (isTele ? uploadImage : uploadFile)(media);
    
    if (!link.startsWith('http')) throw new Error('URL inválido');
    
    let img = Buffer.from(await (await fetch(link)).arrayBuffer());
    let txt = `乂 *L I N K - E N L A C E* 乂\n\n` +
              `*» Enlace* : ${link}\n` +
              `*» Acortado* : ${await shortUrl(link)}\n` +
              `*» Tamaño* : ${formatBytes(media.length)}\n` +
              `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n` +
              `> *${dev}*`;

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, fkontak);
    await m.react(done);
  } catch (err) {
    console.error('Error en tourl:', err);
    await m.react(error);
    await conn.reply(m.chat, '❌ Error al procesar el archivo.', m);
  }
};

// Funciones auxiliares (mantén las mismas)
function formatBytes(bytes) { /* ... */ }
async function shortUrl(url) { /* ... */ }

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['tourl', 'upload'];
export default handler