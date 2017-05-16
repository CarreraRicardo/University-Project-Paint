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
let cont = 0
let idShape = 0
let indexToTransform
let escale
let zoomIntensity
let lastXPos,lastYPos
let figuraClick


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
  indexToTransform = 0
  escale = 1
  zoomIntensity = 0.2
}

function draw() {
	background('WHITE')
	clear();
	if (mouseIsPressed && drawing === true) {

		//console.log('pinto')

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
				//ellipse(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)

				circleBresenham(mouse.x,mouse.y,finishedMouse.x)

			break;
			case 'line':
				finishedMouse.x = pmouseX
				finishedMouse.y = pmouseY
				
				
				//line(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)
				//lineBresenham(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)
				Direct(mouse.x,mouse.y,finishedMouse.x,finishedMouse.y)
			

			break;
			case 'triangle':
				if(mouse.x === pmouseX){
					//console.log(`mismo punto 1 ${mouse.x} , ${pmouseX}`)
					
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

	mouseTranslate();

	//console.log(localShapes.length)

	indexToTransform = insideShape(localShapes)

	//console.log("index to transform1: " + indexToTransform);

}

socket.on('figures',(arrayShapes) =>{
	shapes = arrayShapes;
})

function mousePressed(){

	if (indexToTransform < 0 ){

		drawing = true
		mouse.x = mouseX
		mouse.y = mouseY

	}
	else{

		drawing = false;
		lastXPos = mouseX
		lastYPos = mouseY

	}

	//	console.log("drawing:" + drawing)	

}

function mouseReleased(){


	drawing = false;

	//console.log("indexToTransform: " + indexToTransform)

	if(indexToTransform < 0){

		switch(shapeClicked){

			case 'rectangle':
				idShape++
				let rectangulo = {
					x:mouse.x,
					y:mouse.y,
					lastX:finishedMouse.x,
					lastY:finishedMouse.y,
					type:'rectangle',
					color:color,
					idShape:idShape
				};
				localShapes.push(rectangulo)
				socket.emit('shapes',rectangulo)
			break;
			case 'circle':
				
				idShape++

				let circulo = {
					x:mouse.x,
					y:mouse.y,
					lastX:finishedMouse.x,
					lastY:finishedMouse.y,
					type:'circle',
					color:color,
					idShape:idShape
				};
				localShapes.push(circulo)
				socket.emit('shapes',circulo)
			break;
			case 'line':
				idShape++
				let linea = {
					x:mouse.x,
					y:mouse.y,
					lastX:finishedMouse.x,
					lastY:finishedMouse.y,
					type:'line',
					color:color,
					idShape:idShape
				};
				localShapes.push(linea)
				socket.emit('shapes',linea)
			break;
			case 'triangle':

				idShape++
				let triangulo = {
					x1:triangles.x1,
					y1:triangles.y1,
					x2:triangles.x2,
					y2:triangles.y2,
					x3:triangles.x3,
					y3:triangles.y3,
					type:'triangle',
					color:color,
					idShape:idShape
				};
				localShapes.push(triangulo)
				socket.emit('shapes',triangulo)
			break;
		}// termina switch
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
			 //ellipse(shape.x,shape.y,shape.lastX,shape.lastY)

			 circleBresenham(shape.x,shape.y,shape.lastX)
			 console.log("id del circulo "+ shape.idShape)
			 
			break;

			case 'line':
				//line(shape.x,shape.y,shape.lastX,shape.lastY);
				//lineBresenham(shape.x,shape.y,shape.lastX,shape.lastY)
				Direct(shape.x,shape.y,shape.lastX,shape.lastY)
				
				

			break;
			case 'triangle':
				triangle(shape.x1,shape.y1,shape.x2,shape.y2,shape.x3,shape.y3);
				console.log("id del triangulo "+ shape.x1)
			break;
		}
	});
}

function insideShape(shapes){

	for(let i = 0; i < shapes.length;i++){

		switch(shapes[i].type){

			case 'line':

				var tolerance = 10

				var linePoint = linepointNearestMouse(shapes[i],mouseX,mouseY);

				//console.log(linePoint.x);

				var dx=mouseX-linePoint.x;
    			var dy=mouseY-linePoint.y;

    			var distance=Math.abs(Math.sqrt(dx*dx+dy*dy));

    			

    			if(distance < tolerance){

    				console.log(shapes[i].type + shapes[i].idShape)

    				return shapes[i].idShape;
    			}


			break;

			case 'circle':

				if(Math.pow(mouseX-shapes[i].x,2)+Math.pow(mouseY-shapes[i].y,2) < Math.pow(shapes[i].lastX,2)){
					//alert(shapes[i].idShape);
					return shapes[i].idShape;	
				}
			case 'rectangle':
				if(shapes[i].x + shapes[i].lastX >= mouseX && shapes[i].x <= mouseX && shapes[i].y + shapes[i].lastY >= mouseY && shapes[i].y <= mouseY) {
					return shapes[i].idShape;
				}
			break;
			case 'triangle':

				/*
				var abc = area (shapes[i].x1, shapes[i].y1, shapes[i].x2, shapes[i].y2, shapes[i].x3, shapes[i].y3);
				/* Calculate area of triangle PBC   
				var pbc = area (mouseX, mouseY, shapes[i].x2, shapes[i].y2, shapes[i].x3, shapes[i].y3);
				/* Calculate area of triangle PAC   
				var pac = area (shapes[i].x1, shapes[i].y1, mouseX, mouseY, shapes[i].x3, shapes[i].y3);
				/* Calculate area of triangle PAB    
				var pab = area (shapes[i].x1, shapes[i].y1, shapes[i].x2, shapes[i].y2, mouseX, mouseY);
				
				if (abc == pbc + pac + pab) {

					console.log(`detecto triangulo`)
					return shapes[i].idShape;
				}
				*/

			
				var mousePoints ={

					x:mouseX,
					y:mouseY


				};

				var v1 = {
					x:shapes[i].x1,
					y: shapes[i].y1
				};

				var v2 = {
					x:shapes[i].x2,
					y: shapes[i].y2
				}; 

				var v3 = {
					x:shapes[i].x3,
					y:shapes[i].y3
				};

				if(inTriangle(mousePoints,v1,v2,v3)){


					return shapes[i].idShape

				}  



				
			break;
		}
		
	}

	return -100;

}

function area(x1, y1, x2, y2, x3, y3) {
	return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2);
}

function sign(p1,p2,p3){

	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y) 

}

function inTriangle(pt,v1,v2,v3){

	var b1 = sign(pt, v1, v2) < 0.0
    var b2 = sign(pt, v2, v3) < 0.0
    var b3 = sign(pt, v3, v1) < 0.0

    return ((b1 == b2) && (b2 == b3))

}



var transform = {

	scale:function(s1,s2,figure){

		switch(figure.type){

			case 'circle':

			//console.log("radio: " + figure.lastX + " Escadalos: " + s1 + ":" + s2)

			let coords = []

			let newX = figure.x * s1
			let newY = figure.y * s2
			let newRadio = Math.round(figure.lastX * s1)

			//console.log('nuevo radio: ' + newRadio)

			coords.push(newX,newY,newRadio)

			//console.log("nuevas Coordenadas "+ newX  + ":"+ newY + ":" + newRadio);

			return coords;

			break;

			case 'line':

				//console.log(figure.lastX + ":" + figure.lastY);

				let coord = []

				let newX1 = figure.x * s1
				let newY1 = figure.y * s2
				let newX2 = figure.lastX * s1
				let newY2 = figure.lastY  * s2

				//console.log(newX2 + ":" + newY2)

				coord.push(newX1,newY1,newX2,newY2)

				return coord;

			break;
			case 'rectangle':
				let coord1 = [];
				let newXR = figure.x * s1;
				let newYR = figure.y * s2;
				let newLastX = figure.lastX * s1;
				let newLastY = figure.lastY * s2;
				coord1.push(newXR, newYR,newLastX, newLastY)
				return coord1;
			break;
			case 'triangle':

				//console.log(figure.x1 + ":" + figure.x2);

				let coords1 = []

				let newX1T = figure.x1 * s1
				let newY1T = figure.y1 * s2
				let newX2T = figure.x2 * s1
				let newY2T = figure.y2  * s2
				let newX3T = figure.x3 * s1
				let newY3T = figure.y3  * s2
				coords1.push(newX1T,newY1T,newX2T,newY2T, newX3T, newY3T)

				return coords1;

			break;

		}

	},
	translate:function(mouseX,mouseY,figure){
		let mouse = []
		mouse.push(mouseX)
		mouse.push(mouseY)
		return mouse
	}
}

function mouseTranslate(){
	if(indexToTransform > 0 && drawing === false && mouseIsPressed ){

		

		//console.log("valor de lastXpos: " + lastXPos);

		let indexFigure

		for(let i = 0; i < localShapes.length; i++){

			if(localShapes[i].idShape === indexToTransform){

				indexFigure = i;

				//console.log("viejas cooredenadas" + localShapes[i].x + ":" + localShapes[i].y + ":" + localShapes[i].lastX);

				break;

			}
		}
		let coords = transform.translate(mouseX,mouseY,localShapes[indexFigure])
		switch(localShapes[indexFigure].type) {
			
			case 'circle':
			case 'rectangle':
				localShapes[indexFigure].x = coords[0]
				localShapes[indexFigure].y = coords[1]

				socket.emit('transform',localShapes[indexFigure])

			break;
			case 'triangle':
				//let lx1 = Math.abs(localShapes[indexFigure].x - localShapes[indexFigure].x2)
				//let ly1 = Math.abs(localShapes[indexFigure].y - localShapes[indexFigure].y2)

				var dx1=coords[0]-lastXPos;
    			var dy1=coords[1]-lastYPos;
				
				lastXPos = coords[0]
    			lastYPos = coords[1]

    			localShapes[indexFigure].x1 += dx1
				localShapes[indexFigure].y1 += dy1 
				localShapes[indexFigure].x2 += dx1
				localShapes[indexFigure].y2 += dy1 
				localShapes[indexFigure].x3 += dx1 
				localShapes[indexFigure].y3 += dy1 
				
				socket.emit('transform',localShapes[indexFigure])


			break;
			case 'line':

				
				/*
				let lx = Math.abs(localShapes[indexFigure].x - localShapes[indexFigure].lastX)
				let ly = Math.abs(localShapes[indexFigure].y - localShapes[indexFigure].lastY)
				*/


				 var dx=coords[0]-lastXPos;
    			 var dy=coords[1]-lastYPos;	

    			 lastXPos = coords[0]
    			 lastYPos = coords[1]

				//localShapes[indexFigure].x = coords[0]
				//localShapes[indexFigure].y = coords[1]
				//localShapes[indexFigure].lastX = coords[0] + lx
				//localShapes[indexFigure].lastY = coords[1] + ly
				
				localShapes[indexFigure].x += dx
				localShapes[indexFigure].y += dy
				localShapes[indexFigure].lastX += dx
				localShapes[indexFigure].lastY += dy
				

				socket.emit('transform',localShapes[indexFigure])

			break;
		}
	}
}



function mouseWheel(event){

	if(indexToTransform > 0){

		
		 // Normalize wheel to +1 or -1.

		let wheel = event.delta / 120;

		 // Compute zoom factor.

		let zoom = Math.exp(wheel * zoomIntensity)

		
		
		let indexFigure

		for(let i = 0; i < localShapes.length; i++){

			if(localShapes[i].idShape === indexToTransform){

				indexFigure = i;

				//console.log("viejas cooredenadas" + localShapes[i].x + ":" + localShapes[i].y + ":" + localShapes[i].lastX);

				break;

			}
		}

		

		//console.log(coords[0] + ":" + coords[1] + ":" + coords[2]);

		switch(localShapes[indexFigure].type){

			case 'circle':

			let coords = transform.scale(zoom,zoom,localShapes[indexFigure])

			//localShapes[indexFigure].x = coords[0]
			//localShapes[indexFigure].y = coords[1]
			localShapes[indexFigure].lastX = coords[2]

			socket.emit('transform',localShapes[indexFigure])


			break;

			case 'line':

			//console.log(localShapes[indexFigure].type + "2");

			 let coord = transform.scale(zoom,zoom,localShapes[indexFigure])



			localShapes[indexFigure].x = coord[0]
			localShapes[indexFigure].y = coord[1]
			localShapes[indexFigure].lastX = coord[2]
			localShapes[indexFigure].lastY = coord[3]

			socket.emit('transform',localShapes[indexFigure])


			break;
			case 'rectangle':
			let coord1 = transform.scale(zoom,zoom,localShapes[indexFigure])
			localShapes[indexFigure].x = coord1[0]
			localShapes[indexFigure].y = coord1[1]
			localShapes[indexFigure].lastX = coord1[2]
			localShapes[indexFigure].lastY = coord1[3]

			socket.emit('transform',localShapes[indexFigure])

			break;
			case 'triangle':

			//console.log(localShapes[indexFigure].type + "2");

			//console.log("valores del triangulo:" + localShapes[indexFigure].x1 + ":" + localShapes[indexFigure].y1 + 
			//	" " + localShapes[indexFigure].x2 + ":" + localShapes[indexFigure].y2 + " " + localShapes[indexFigure].x3 + 
			//	":" + localShapes[indexFigure].y3);

			 let coords1 = transform.scale(zoom,zoom,localShapes[indexFigure])
		 


			localShapes[indexFigure].x1 = coords1[0]
			localShapes[indexFigure].y1 = coords1[1]
			localShapes[indexFigure].x2 = coords1[2]
			localShapes[indexFigure].y2 = coords1[3]
			localShapes[indexFigure].x3 = coords1[4]
			localShapes[indexFigure].y3 = coords1[5]

			socket.emit('transform',localShapes[indexFigure])

			break;
		}


	}

}
	


//////////////////////////////////
var lineBresenham = function(x0, y0, x1, y1) {
	var dx = x1 - x0;
	var dy = y1 - y0;
	var stepx = dx < 0 ? -1 : 1;
	var stepy = dy < 0 ? -1 : 1;
	dx = Math.abs(dx);
	dy = Math.abs(dy);
	var ddy = dy * 2;
	var ddx = dx * 2;
	var dxy = ddy - ddx;
	var dyx = ddx - ddy;
	
	if (dx > dy) {
		var p = ddy - dx;
		while(x0 != x1) {
			x0 += stepx;
			if(p < 0) {
				p = p + ddy;
			} else {
				y0 += stepy;
				p = p + dxy;
			}
			point(x0, y0);
		}
	}
	else {
		var p = ddx - dy;
		while(y0 != y1) {
			y0 += stepy;
			if(p < 0) {
				p = p + ddx;
			} else {
				x0 += stepx;
				p = p + dyx;
			}
			point(x0, y0);
		}
	}
};

var circlePlotPoints = function(xc, yc, x, y) {
	point(xc + x, yc + y);
	point(xc + x, yc - y);
	point(xc - x, yc + y);
	point(xc - x, yc - y);
	point(xc + y, yc + x);
	point(xc + y, yc - x);
	point(xc - y, yc + x);
	point(xc - y, yc - x);

	
};

var circleBresenham = function(xc, yc, radius) {
	var x = 0;
	var y = radius;
	var p = 5/4 - radius;
	while(x < y ) {
		x++;
		if (p < 0) {
			p = p + (2 * x) + 1;
		} else {
			y--;
			p = p + 2*(x - y) + 1;
		}
		circlePlotPoints(xc, yc, x, y);
	}
};

function linepointNearestMouse(line,x,y) {
    //
    function lerp(a,b,x){ 


    	return(a+x*(b-a)); 

    }

    var dx=line.lastX-line.x;

    var dy=line.lastY-line.y;

    var t=((x-line.x)*dx+(y-line.y)*dy)/(dx*dx+dy*dy);

    var lineX=lerp(line.x, line.lastX, t);

    var lineY=lerp(line.y, line.lastY, t);

    return({x:lineX,y:lineY});
}






/*

Detecta circulo
if(Math.pow(mouseX-shape.x,2)+Math.pow(mouseY-shape.y,2) < Math.pow(shape.lastX,2)){

			 	console.log("dentro del circulo");


}
*/

/*

Detecta linea
var tolerance = 5

				var linePoint = linepointNearestMouse(shape,mouseX,mouseY);

				console.log(linePoint.x);

				var dx=mouseX-linePoint.x;
    			var dy=mouseY-linePoint.y;

    			var distance=Math.abs(Math.sqrt(dx*dx+dy*dy));

    			

    			if(distance < tolerance){

    				alert("hola mundo");


    			}


function linepointNearestMouse(line,x,y) {
    //
    function lerp(a,b,x){ 


    	return(a+x*(b-a)); 

    }

    var dx=line.lastX-line.x;

    var dy=line.lastY-line.y;

    var t=((x-line.x)*dx+(y-line.y)*dy)/(dx*dx+dy*dy);

    var lineX=lerp(line.x, line.lastX, t);

    var lineY=lerp(line.y, line.lastY, t);

    return({x:lineX,y:lineY});
}

*/

function Direct(x1,y1,x2,y2){

	var pendiente = (y2 - y1) / (x2 - x1);

	var b = y1 - (pendiente * x1);

	var x = x1;
	var y = y1;

	if(x1 < x2){

		for(var i = x1; i < x2; i++){

			point(x,y);
			x++;
			y = Math.round(pendiente * x + b);
		}

	}
	else if(x1 > x2){

		for(var i = x1; i > x2; i--){

			point(x,y);
			x--;
			y = Math.round(pendiente * x + b);
		}


	}
	else if(x1  === x2){

		pendiente = (x2 - x1) / (y2 - y1);

		b = x1 - (pendiente * y1);

		if(y1 < y2){

			for(var i = y1; i < y2; i++){

				point(x,y);
				y++;
				x = Math.round(pendiente * y + b);
			}

		}
		else{

			for(var i = y1; i > y2; i--){

				point(x,y);
				y--;
				x = Math.round(pendiente * y + b);
			}


		}

		

	}

	

}













