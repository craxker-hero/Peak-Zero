import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime) return m.reply(`Responda a una imagen/vídeo o envíe uno con el comando *${usedPrefix + command}*`)
  
  await m.react('⏳')

  try {
    let media = await q.download()
    let fileType = await fileTypeFromBuffer(media)
    
    if (!fileType) throw new Error('Formato no reconocido')
    
    // Límite de tamaño: 15MB para imágenes, 50MB para vídeos
    const maxSize = fileType.mime.startsWith('video/') ? 50 * 1024 * 1024 : 15 * 1024 * 1024
    if (media.length > maxSize) throw new Error(`Archivo demasiado grande (${formatBytes(media.length)}). Límite: ${formatBytes(maxSize)}`)

    // Intentar con múltiples APIs
    let uploadResults = await Promise.any([
      uploadToFreeAPI(media, fileType.mime).catch(e => null),
      uploadToImgBB(media).catch(e => null),
      uploadToFileIo(media, fileType.mime).catch(e => null)
    ])

    if (!uploadResults) throw new Error('Todas las APIs fallaron')

    let { url, source } = uploadResults
    let shortUrl = await tryShorten(url)
    
    let txt = `*📤 SUBIDA EXITOSA* (via ${source})\n\n`
    txt += `• *Tipo*: ${fileType.mime}\n`
    txt += `• *Tamaño*: ${formatBytes(media.length)}\n`
    txt += `• *Enlace*: ${url}\n`
    txt += `• *Acortado*: ${shortUrl}\n\n`
    txt += `_${source === 'Telegraph' ? 'No expira' : 'Puede expirar después de 30 días'}_`

    await conn.sendFile(m.chat, media, 'file', txt, m)
    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.reply(`❌ Error: ${error.message}`)
    await m.react('❌')
  }
}

// ================== APIs ALTERNATIVAS ================== //

// 1. Telegraph (para imágenes)
async function uploadToFreeAPI(buffer, mimeType) {
  let form = new FormData()
  form.append('file', buffer, { filename: 'file.' + mimeType.split('/')[1] })
  
  let res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  })
  
  let json = await res.json()
  if (!json[0]?.src) throw new Error('API Telegraph falló')
  return { url: 'https://telegra.ph' + json[0].src, source: 'Telegraph' }
}

// 2. ImgBB (API Key pública, puede tener límites)
async function uploadToImgBB(buffer) {
  let form = new FormData()
  form.append('image', buffer.toString('base64'))
  
  let res = await fetch('https://api.imgbb.com/1/upload?key=76d7a964a4b7b49a2cbb0d7a8f198271', { // Key pública
    method: 'POST',
    body: form
  })
  
  let json = await res.json()
  if (!json.data?.url) throw new Error('API ImgBB falló')
  return { url: json.data.url, source: 'ImgBB' }
}

// 3. File.io (para cualquier archivo)
async function uploadToFileIo(buffer, mimeType) {
  let form = new FormData()
  form.append('file', buffer, { filename: 'file.' + mimeType.split('/')[1] })
  
  let res = await fetch('https://file.io', {
    method: 'POST',
    body: form
  })
  
  let json = await res.json()
  if (!json.link) throw new Error('API File.io falló')
  return { url: json.link, source: 'File.io' }
}

// ================== FUNCIONES AUXILIARES ================== //

async function tryShorten(url) {
  try {
    let res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    return await res.text()
  } catch {
    return url
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|upload|subir)$/i
export default handler