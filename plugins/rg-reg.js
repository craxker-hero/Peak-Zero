import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'

let handler = async function (m, { conn }) {
  // Función para registrar automáticamente
  let registerUser = async (sender) => {
    let user = global.db.data.users[sender]
    if (user.registered) return false
    
    let name = conn.getName(sender)
    let phoneNumber = PhoneNumber('+' + sender.split('@')[0]).getNumber('international')
    
    // Datos básicos del registro
    user.name = name || 'Usuario'
    user.regTime = +new Date()
    user.registered = true
    user.phone = phoneNumber || ''
    user.serial = createHash('md5').update(sender).digest('hex')
    
    // Valores por defecto (pueden cambiarse después)
    user.age = 0 // 0 indica no especificado
    user.birthdate = '' // Para usar con /setbirth
    
    return true
  }

  // Registrar al usuario si no lo está
  await registerUser(m.sender)
}

// Comando para establecer fecha de nacimiento
let setbirthHandler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  
  if (!user.registered) {
    await registerUser(m.sender)
  }
  
  if (!args[0]) return m.reply(`✳️ Uso: /setbirth DD/MM/YYYY\nEjemplo: /setbirth 15/04/1995`)
  
  let birthdate = args[0]
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) {
    return m.reply('⚠︎ Formato incorrecto. Usa DD/MM/YYYY')
  }
  
  let [day, month, year] = birthdate.split('/').map(Number)
  let birthDate = new Date(year, month - 1, day)
  let today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  
  // Verificar si ya pasó el cumpleaños este año
  if (today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  if (age < 5) return m.reply('✧ Edad mínima: 5 años')
  if (age > 100) return m.reply('✦ Edad máxima: 100 años')
  
  user.birthdate = birthdate
  user.age = age
  
  m.reply(`❐ Fecha de nacimiento registrada:\n▸ Edad: ${age} años\n▸ Cumpleaños: ${day}/${month}`)
}

// Registrar automáticamente antes de cualquier comando
handler.before = async function (m) {
  if (!m.isGroup && global.db.data.users[m.sender] && !global.db.data.users[m.sender].registered) {
    let name = conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    
    user.name = name || 'Usuario'
    user.regTime = +new Date()
    user.registered = true
    user.phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international') || ''
    user.serial = createHash('md5').update(m.sender).digest('hex')
    user.age = 0
    user.birthdate = ''
  }
  return true
}

// Asignar handlers
export default handler
export { setbirthHandler }