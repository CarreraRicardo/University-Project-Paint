'use strict'

const arrayImg = document.getElementById('shapes').children
let shapeClicked
let drawing
let socket = io.connect('http://192.168.1.66:3000') // ip del localhost
let mouse
let finishedMouse
let triangles
let localShapes = []
let shapes = []
let dif
let color
for(let i = 0; i < arrayImg.length; i++){
	arrayImg[i].addEventListener('click',() =>{
		shapeClicked = arrayImg[i].getAttribute('data-figure')
		console.log(shapeClicked);
	})
}

function setup() {
  const canvas = createCanvas(1060, 540)
  canvas.parent('canvasDiv')
  canvas.class('borders')
  drawing = false
  mouse = {x:0,y:0}
  finishedMouse = {x:0,y:0}
  triangles = {x1:0,y1:0,x2:0,y2:0,x3:0,y3:0}
  dif = 0
}

function draw() {
	background('WHITE')
	clear();
	if (mouseIsPressed && drawing === true) {
		color = document.getElementById("color").value;
		stroke(color)
		strokeWeight(4)
		switch(shapeClicked){
			case 'rectangle':
				rectMode(CORNER)
				finishedMouse.x = mouseX - mouse.x
				finishedMouse.y = mouseY - mouse.y

				rect(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y);
				break;
			case 'circle':
				//ellipseMode(CORNER)
				finishedMouse.x = mouseX - mouse.x
				finishedMouse.y = mouseY - mouse.y	
				ellipse(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)
			break;
			case 'line':
				finishedMouse.x = pmouseX
				finishedMouse.y = pmouseY
				
				
				line(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)
			break;
			case 'triangle':
				if(mouse.x === pmouseX){
					console.log(`mismo punto 1 ${mouse.x} , ${pmouseX}`)
					
					triangle(mouse.x,mouse.y,pmouseX,pmouseY,pmouseX,mouse.y)
				}
				else{
					dif = (pmouseX - mouse.x) / 2
					triangles.x1 = mouse.x
					triangles.y1 = mouse.y
					triangles.x2 = mouse.x + dif
					triangles.y2 = pmouseY
					triangles.x3 = pmouseX
					triangles.y3 = mouse.y
					
					triangle(triangles.x1,triangles.y1,triangles.x2,triangles.y2,triangles.x3,triangles.y3)
				}
			break;
		}
	}
	paint(shapes);
	paint(localShapes)
}
socket.on('figures',(arrayShapes) =>{
	shapes = arrayShapes;
})
function mousePressed(){
	drawing = true
	mouse.x = mouseX
	mouse.y = mouseY
}

function mouseReleased(){
	drawing = false;
	switch(shapeClicked){
		case 'rectangle':
			let rectangulo = {
				x:mouse.x,
				y:mouse.y,
				lastX:finishedMouse.x,
				lastY:finishedMouse.y,
				type:'rectangle',
				color:color
			};
			localShapes.push(rectangulo)
			socket.emit('shapes',rectangulo)
		break;
		case 'circle':
			let circulo = {
				x:mouse.x,
				y:mouse.y,
				lastX:finishedMouse.x,
				lastY:finishedMouse.y,
				type:'circle',
				color:color
			};
			localShapes.push(circulo)
			socket.emit('shapes',circulo)
		break;
		case 'line':
			let linea = {
				x:mouse.x,
				y:mouse.y,
				lastX:finishedMouse.x,
				lastY:finishedMouse.y,
				type:'line',
				color:color
			};
			localShapes.push(linea)
			socket.emit('shapes',linea)
		break;
		case 'triangle':
			let triangulo = {
				x1:triangles.x1,
				y1:triangles.y1,
				x2:triangles.x2,
				y2:triangles.y2,
				x3:triangles.x3,
				y3:triangles.y3,
				type:'triangle',
				color:color
			};
			localShapes.push(triangulo)
			socket.emit('shapes',triangulo)
		break;
	}
}

function paint(shapes){
	shapes.forEach(function(shape){
		stroke(shape.color)
		strokeWeight(4)
		switch(shape.type){
			case 'rectangle':
			  noFill();
			  rect(shape.x,shape.y,shape.lastX,shape.lastY)
			break;
			case 'circle':
			 ellipse(shape.x,shape.y,shape.lastX,shape.lastY)
			break;
			case 'line':
				line(shape.x,shape.y,shape.lastX,shape.lastY);
			break;
			case 'triangle':
				triangle(shape.x1,shape.y1,shape.x2,shape.y2,shape.x3,shape.y3);
			break;
		}
	});
}










