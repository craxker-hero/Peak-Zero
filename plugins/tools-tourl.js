import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar si hay mensaje citado o media adjunta
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime) return m.reply(`❌ *Debes responder o enviar una imagen/vídeo*\nEjemplo: ${usedPrefix + command}`)
  
  await m.react('🕓')

  try {
    // Descargar el archivo
    let media = await q.download()
    if (!media || media.length === 0) throw new Error('Archivo vacío o no descargable')

    // Detectar tipo de archivo
    let fileType
    try {
      fileType = await fileTypeFromBuffer(media)
      if (!fileType) throw new Error('Tipo de archivo no reconocido')
    } catch (e) {
      console.error(e)
      throw new Error('Formato de archivo no compatible')
    }

    // Validar tipos permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4'
    ]
    
    if (!allowedTypes.includes(fileType.mime)) {
      throw new Error(`Formato ${fileType.mime} no soportado. Solo imágenes (JPEG, PNG, WEBP, GIF) y MP4`)
    }

    // Subir a Telegraph (versión alternativa)
    let link = await uploadToTelegraph(media, fileType.mime)
    if (!link) throw new Error('Error al subir a Telegraph')

    // Obtener vista previa
    let previewBuffer
    try {
      const res = await fetch(link)
      previewBuffer = await res.buffer()
    } catch {
      previewBuffer = media.slice(0, 30720) // Usar parte del archivo como preview
    }

    // Construir mensaje de respuesta
    let txt = `*🖼 Telegraph Uploader*\n\n`
    txt += `• *Tipo*: ${fileType.mime}\n`
    txt += `• *Tamaño*: ${formatBytes(media.length)}\n`
    txt += `• *Enlace*: ${link}\n`
    txt += `• *Acortado*: ${await shortUrl(link)}\n\n`
    txt += `_El enlace ${fileType.mime.startsWith('image') ? 'no expira' : 'puede expirar después de 30 días'}_`

    // Enviar resultado
    await conn.sendFile(
      m.chat, 
      previewBuffer, 
      'preview.jpg', 
      txt, 
      m
    )
    await m.react('✅')

  } catch (error) {
    console.error('Error en tourl:', error)
    await m.reply(`❌ *Error al procesar*: ${error.message}`)
    await m.react('❌')
  }
}

// Función alternativa para subir a Telegraph
async function uploadToTelegraph(buffer, mimeType) {
  try {
    // Implementación básica (debes reemplazar con tu lógica real)
    const isImage = mimeType.startsWith('image/')
    const formData = new FormData()
    formData.append('file', new Blob([buffer]), { type: mimeType })
    
    const res = await fetch(isImage ? 'https://telegra.ph/upload' : 'https://graph.org/upload', {
      method: 'POST',
      body: formData
    })
    
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    
    return isImage 
      ? `https://telegra.ph${json[0].src}` 
      : `https://graph.org${json[0].src}`
  } catch (e) {
    console.error('Error en uploadToTelegraph:', e)
    throw new Error('Error al subir el archivo')
  }
}

// Helper functions
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]
}

async function shortUrl(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    return await res.text()
  } catch {
    return url
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|telegraph|upload)$/i
handler.limit = true
export default handler