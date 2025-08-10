import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender] || {}
  if (user.registered) return m.reply('✧ Ya estás registrado en el sistema.')

  // Registro automático mejorado
  user.name = conn.getName(m.sender) || 'Usuario'
  user.regTime = +new Date()
  user.registered = true
  user.age = user.age || 0
  user.birthdate = user.birthdate || ''
  user.phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international') || ''
  user.serial = createHash('md5').update(m.sender).digest('hex')
  
  m.reply(`✓ Registro automático completado:\n▸ Nombre: ${user.name}`)
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup && !global.db.data.users[m.sender]?.registered) {
    let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    user.name = conn.getName(m.sender) || 'Usuario'
    user.regTime = +new Date()
    user.registered = true
    user.age = user.age || 0
    user.birthdate = user.birthdate || ''
  }
  return true
}

let setbirthHandler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  if (!user?.registered) return m.reply('✧ Primero debes registrarte con /reg')

  if (!args[0]) return conn.reply(m.chat, 
    `✧ Uso correcto:\n/setbirth DD/MM/YYYY\n\nEjemplo:\n/setbirth 29/06/2007`, 
    m
  )

  let birthdate = args[0]
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) {
    return conn.reply(m.chat, '✧ Formato incorrecto. Usa DD/MM/YYYY', m)
  }

  let [day, month, year] = birthdate.split('/').map(Number)
  let today = new Date()
  let birthDate = new Date(year, month - 1, day)
  
  // Validaciones
  if (birthDate > today) return conn.reply(m.chat, '✧ La fecha no puede ser futura', m)
  if (year < 1900) return conn.reply(m.chat, '✧ Año inválido', m)
  
  let age = today.getFullYear() - year
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
    age--
  }

  if (age < 5) return conn.reply(m.chat, '✧ Edad mínima: 5 años', m)
  if (age > 100) return conn.reply(m.chat, '✧ Edad máxima: 100 años', m)

  user.birthdate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
  user.age = age
  
  conn.reply(m.chat, 
    `✓ Datos actualizados:\n\n▸ Edad: ${age} años\n▸ Cumpleaños: ${day}/${month}\n▸ Fecha: ${user.birthdate}`, 
    m
  )
}

handler.help = ['reg', 'register']
handler.tags = ['rg']
handler.command = /^(reg|register|registro|registrar)$/i
setbirthHandler.command = /^setbirth$/i

export { handler as default, setbirthHandler }