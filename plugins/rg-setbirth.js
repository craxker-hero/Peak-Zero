let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = {
      name: conn.getName(m.sender),
      registered: false,
      age: 0,
      exp: 0,
      level: 0,
      money: 0
    }
    user = global.db.data.users[m.sender]
  }

  if (!args[0]) return m.reply(`✳️ Uso: ${usedPrefix}setbirth DD/MM/YYYY\nEjemplo: ${usedPrefix}setbirth 29/06/2007`)

  let birthdate = args[0]
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) {
    return m.reply('✧ Formato incorrecto. Usa DD/MM/YYYY')
  }

  let [day, month, year] = birthdate.split('/').map(Number)
  let today = new Date()
  let birthDate = new Date(year, month - 1, day)
  
  // Validaciones
  if (birthDate > today) return m.reply('⚠︎ La fecha de nacimiento no puede ser en el futuro')
  if (year < 1900) return m.reply('✧ Año inválido')
  
  let age = today.getFullYear() - birthDate.getFullYear()
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--
  }

  if (age < 5) return m.reply('✰ Edad mínima: 5 años')
  if (age > 100) return m.reply('✯ Edad máxima: 100 años')

  user.birthdate = birthdate
  user.age = age
  
  m.reply(`✓ Fecha de nacimiento registrada:\n▸ Edad: ${age} años\n▸ Cumpleaños: ${day}/${month}`)
}

handler.help = ['setbirth <DD/MM/YYYY>']
handler.tags = ['rg']
handler.command = /^setbirth$/i
export default handler