import uploadImage from '../lib/uploadImage.js'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime) return m.reply('🚩 Responde a una *Imagen* o *Vídeo* para subir a Telegraph.')
  
  await m.react('🕓')

  try {
    let media = await q.download()
    const fileType = await fileTypeFromBuffer(media)
    
    if (!fileType) return m.reply('❌ Formato de archivo no reconocido')
    
    // Tipos MIME permitidos (extendidos)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ]
    
    if (!allowedTypes.includes(fileType.mime)) {
      return m.reply(`❌ Formato no soportado: ${fileType.mime}\nSolo se permiten imágenes (JPEG, PNG, WEBP, GIF) y vídeos (MP4)`)
    }

    // Límite de tamaño (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (media.length > maxSize) {
      return m.reply(`❌ Archivo demasiado grande (${formatBytes(media.length)})\nEl límite es ${formatBytes(maxSize)}`)
    }

    let link
    try {
      link = await uploadImage(media)
      if (!link.startsWith('https://telegra.ph/file/')) {
        throw new Error('Enlace no válido recibido de Telegraph')
      }
    } catch (uploadError) {
      console.error('Error al subir:', uploadError)
      throw new Error('Error al subir a Telegraph. Intenta con otro archivo.')
    }
    
    // Obtener thumbnail/previsualización
    let imgBuffer
    try {
      const imgResponse = await fetch(link)
      imgBuffer = await imgResponse.buffer()
    } catch {
      imgBuffer = media // Usar el archivo original si falla la descarga
    }

    // Acortar URL
    let shortUrlText = 'Error al acortar'
    try {
      shortUrlText = await shortUrl(link)
    } catch (shortError) {
      console.error('Error al acortar URL:', shortError)
    }

    // Construir mensaje
    let txt = `*🖼️ T E L E G R A P H - U P L O A D E R*\n\n`
    txt += `  ▸ *Tipo*: ${fileType.mime}\n`
    txt += `  ▸ *Tamaño*: ${formatBytes(media.length)}\n`
    txt += `  ▸ *Enlace original*:\n${link}\n`
    txt += `  ▸ *Enlace acortado*:\n${shortUrlText}\n\n`
    txt += `⏳ El enlace ${fileType.mime.startsWith('image') ? 'no expira' : 'puede expirar'}\n`
    txt += `🔗 *Subido por*: ${m.name || '@' + m.sender.split('@')[0]}`

    await conn.sendFile(
      m.chat, 
      imgBuffer, 
      'preview.jpg', 
      txt, 
      m,
      null, 
      { 
        thumbnail: imgBuffer.slice(0, 64*1024), // Miniaturas pequeñas
        quoted: m 
      }
    )
    
    await m.react('✅')
    
  } catch (e) {
    console.error('Error en comando tourl:', e)
    await m.reply(`❌ Error crítico: ${e.message}\nReporta este error al desarrollador.`)
    await m.react('✖️')
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|upload|telegraph)$/i
handler.limit = true
handler.register = true
export default handler

// Función para formatear bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]
}

// Función para acortar URLs
async function shortUrl(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error('API de acortamiento no disponible')
    return await res.text()
  } catch {
    return url // Devuelve la URL original si falla el acortamiento
  }
}