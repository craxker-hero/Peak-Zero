import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, '🍃 Responde a una *Imagen* o *Vídeo.*', m)
  
  try {
    let media = await q.download()
    let fileType = await fileTypeFromBuffer(media)
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    
    // Intentar subir con diferentes métodos
    let link
    try {
      link = await (isTele ? uploadImage : uploadFile)(media)
    } catch (e) {
      console.error('Error con uploadImage/uploadFile:', e)
      // Respaldar con otras APIs si falla
      link = await uploadToBackupAPI(media, fileType.mime)
    }

    // Obtener vista previa si es imagen
    let imgBuffer
    try {
      imgBuffer = await (await fetch(link)).buffer()
    } catch {
      imgBuffer = media.slice(0, 30720) // Tomar parte del archivo como preview
    }

    // Formatear mensaje como solicitado
    let txt = `> _✦「 ¡File uploaded! 」_\n`
    txt += `❏　» ${link}\n`
    txt += `❀　» ${formatBytes(media.length)}\n`
    txt += `↺　» ${isTele ? 'No expira' : 'Desconocido'}\n\n`
    txt += `_Subido por: @${m.sender.split('@')[0]}_`

    // Enviar mensaje con vista previa
    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: txt,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error('Error en tourl:', e)
    await conn.reply(m.chat, `⚠︎ *Error:* ${e.message}`, m)
  }
}

// Función de respaldo con múltiples APIs
async function uploadToBackupAPI(buffer, mimeType) {
  const apis = [
    {
      name: 'Telegraph',
      url: 'https://telegra.ph/upload',
      processor: res => `https://telegra.ph${res[0].src}`,
      form: (form) => form.append('file', buffer)
    },
    {
      name: 'ImgBB',
      url: 'https://api.imgbb.com/1/upload?key=76d7a964a4b7b49a2cbb0d7a8f198271',
      processor: res => res.data.url,
      form: (form) => form.append('image', buffer.toString('base64'))
    },
    {
      name: 'File.io',
      url: 'https://file.io',
      processor: res => res.link,
      form: (form) => form.append('file', buffer)
    }
  ]

  for (let api of apis) {
    try {
      let form = new FormData()
      api.form(form)
      
      let res = await fetch(api.url, {
        method: 'POST',
        body: form
      })
      let json = await res.json()
      
      if (json.error) continue
      return api.processor(json)
    } catch (e) {
      console.error(`Error con API ${api.name}:`, e)
      continue
    }
  }
  throw new Error('Todas las APIs de respaldo fallaron')
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['tourl', 'quax']
export default handler