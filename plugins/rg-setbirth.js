let handler = async (m, { conn, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender] || {}
  
  if (!args[0]) return conn.reply(m.chat, 
    `✳️ Uso: *${usedPrefix}setbirth DD/MM/YYYY*\nEjemplo: *${usedPrefix}setbirth 29/06/2007*`, 
    m
  )

  let birthdate = args[0]
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) {
    return conn.reply(m.chat, '⚠️ Formato incorrecto. Usa DD/MM/YYYY', m)
  }

  let [day, month, year] = birthdate.split('/').map(Number)
  let today = new Date()
  let birthDate = new Date(year, month - 1, day)
  
  // Validaciones mejoradas
  if (isNaN(birthDate.getTime())) return conn.reply(m.chat, '⚠️ Fecha inválida', m)
  if (birthDate > today) return conn.reply(m.chat, '⚠️ La fecha no puede ser en el futuro', m)
  if (year < 1900 || year > today.getFullYear()) return conn.reply(m.chat, '⚠️ Año inválido', m)
  if (month < 1 || month > 12) return conn.reply(m.chat, '⚠️ Mes inválido', m)
  if (day < 1 || day > 31) return conn.reply(m.chat, '⚠️ Día inválido', m)
  
  // Validar días por mes
  let daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return conn.reply(m.chat, `⚠️ El mes ${month} no tiene ${day} días`, m)

  let age = today.getFullYear() - year
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
    age--
  }

  if (age < 5) return conn.reply(m.chat, '⚠️ Edad mínima: 5 años', m)
  if (age > 100) return conn.reply(m.chat, '⚠️ Edad máxima: 100 años', m)

  // Guardar datos
  user.birthdate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
  user.age = age
  
  conn.reply(m.chat, 
    `✅ *Fecha registrada*\n\n▸ *Edad:* ${age} años\n▸ *Cumpleaños:* ${day}/${month}\n▸ *Año:* ${year}`, 
    m
  )
}

handler.help = ['setbirth <DD/MM/YYYY>']
handler.tags = ['rg']
handler.command = /^setbirth$/i
export default handler