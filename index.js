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

io.on('connection', (socket) => {

  console.log(`A user connection ${socket.id}`)

  socket.on('shapes',(arrayShapes) => {

		  		

  		
  		setInterval(() => {


  			socket.broadcast.emit('figures',arrayShapes) 


  		},1000)

		

  })

  
  
})




server.listen(port, () => {
  console.log(`Estoy conectado al puerto ${port}`)
})


