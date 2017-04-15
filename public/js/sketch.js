'use strict'

const arrayImg = document.getElementById('shapes').children
let shapeClicked
let drawing
let socket = io.connect('http://192.168.1.66:3000') // ip del localhost
let mouse
let finishedMouse
let localShapes = []

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


}

function draw() {

	background('WHITE')
	noLoop()
	// recibe arreglo de las figuras de otros vatos 
	socket.on('figures',(arrayShapes) =>{

		
		paint(arrayShapes)

	})
	
}

function mousePressed(){

	drawing = true
	mouse.x = mouseX
	mouse.y = mouseY

}

function mouseDragged(){

	if(drawing === true){

		switch(shapeClicked){

			case 'rectangle':

			rectMode(CORNER)
			noFill();
			clear();
			finishedMouse.x = mouseX - mouse.x
			finishedMouse.y = mouseY - mouse.y
			rect(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y);
			break;

		}

		

	}

}

function mouseReleased(){

	drawing = false;

	switch(shapeClicked){

		case 'rectangle':

			var rectangulo = {

				x:mouse.x,
				y:mouse.y,
				lastX:finishedMouse.x,
				lastY:finishedMouse.y,
				type:'rectangle'
			};

			localShapes.push(rectangulo)

			paint(localShapes)

			socket.emit('shapes',localShapes)

			

		break;


	}
	

}

function paint(shapes){

	shapes.forEach(function(shape){

		switch(shape.type){

			case 'rectangle':

			  rect(shape.x,shape.y,shape.lastX,shape.lastY)

			break;

		}

		

	});



}










