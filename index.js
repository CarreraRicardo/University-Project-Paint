'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port  = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

let shapesToDistributed

let arrayToSendClients
let shapes = []
io.on('connection', (socket) => {
  console.log(`A user connection ${socket.id}`)
  socket.broadcast.emit('figures',shapes) 
  socket.emit('figures',shapes) 
  socket.on('shapes',(shape) => {
      shapes.push(shape);
  		socket.broadcast.emit('figures',shapes) 
  })
})

server.listen(port, () => {
  console.log(`Estoy conectado al puerto ${port}`)
})


