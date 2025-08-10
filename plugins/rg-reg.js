import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m) => {
  let user = global.db.data.users[m.sender] || {}
  if (user.registered) return
  
  // Registro automático
  user.name = conn.getName(m.sender)
  user.regTime = +new Date()
  user.registered = true
  user.age = 0
  user.birthdate = ''
  user.phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international') || ''
  user.serial = createHash('md5').update(m.sender).digest('hex')
}

handler.before = async function (m) {
  if (!m.isGroup && !global.db.data.users[m.sender]?.registered) {
    let user = global.db.data.users[m.sender] || {}
    user.name = conn.getName(m.sender)
    user.regTime = +new Date()
    user.registered = true
    user.age = 0
    user.birthdate = ''
  }
  return true
}

// Comando para establecer fecha de nacimiento
let setbirthHandler = async (m, { args }) => {
  let user = global.db.data.users[m.sender] || {}
  
  if (!args[0]) return m.reply(`✳️ Uso: /setbirth DD/MM/YYYY\nEjemplo: /setbirth 15/04/1995`)
  
  let birthdate = args[0]
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) {
    return m.reply('❀ Formato incorrecto. Usa DD/MM/YYYY')
  }
  
  let [day, month, year] = birthdate.split('/').map(Number)
  let birthDate = new Date(year, month - 1, day)
  let today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  
  if (today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  if (age < 5) return m.reply('✦ Edad mínima: 5 años')
  if (age > 100) return m.reply('✦ Edad máxima: 100 años')
  
  user.birthdate = birthdate
  user.age = age
  
  m.reply(`✓ Fecha de nacimiento registrada:\n▸ Edad: ${age} años\n▸ Cumpleaños: ${day}/${month}`)
}

export { handler as default, setbirthHandler }