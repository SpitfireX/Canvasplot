var fun = parser.parse("f(x)=max(sin(x), 0)");
//fun = parser.parse("f(x) = sqrt(x) * log(x/3) + sin(pow(x, 1/5)) * cos(pow(x,3))");
var fun2 = parser.parse("f(x)=tan(x)");
// fun2 = parser.parse("f(x)=x^2/sin(x)+x/x^3");
fun2 = parser.parse("f(x)=1/x")

var canvas, ctx;
var width, height;
var origin = [0,0];
var xscale = 50;
var yscale = 50;
var gridScale = 2;

var labels = true;
var grid = true;
var coordianteSystem = true;

var mdown = false;
var minit = false;
var mcoords = {x:0,y:0};

function init(){
	window.addEventListener("resize", updateOrigin);
	
	$(document).dblclick(function() {
		$("#sidebar").toggle("slide", {direction:"right"}, updateOrigin);
	});
	
	canvas = document.getElementById("viewport");
	ctx = canvas.getContext("2d");
	
	var scrollListener = function(e){
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if(e.altKey){
			if (xscale > 5 || delta > 0)
				xscale += delta;
		} else if (e.shiftKey) {
			if (yscale > 5 || delta > 0)
				yscale += delta;
		} else {
			if (xscale > 5 || delta > 0)
				xscale += delta;
			if (yscale > 5 || delta > 0)
				yscale += delta;
		}

		update();
	}
	canvas.addEventListener("mousewheel", scrollListener);
	canvas.addEventListener("DOMMouseScroll", scrollListener);
	
	canvas.addEventListener("mousedown", function(e){
		if (e.button != 1)
			return;
		mdown = true;
		minit = false;
	});
	canvas.addEventListener("mouseup", function(e){
		mdown = false;
		minit = false;
	});
	canvas.addEventListener("mousemove", function(e){
		if (!mdown)
			return;
		
		if (minit){
			dx = e.x - mcoords.x;
			dy = e.y - mcoords.y;
			
			origin[0] += dx;
			origin[1] += dy;
			
			update();
		}
		
		minit = true;
		mcoords.x = e.x;
		mcoords.y = e.y;
	});
	
	updateOrigin();
}

function updateOrigin(){
	width = canvas.scrollWidth;
	height = canvas.scrollHeight;
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	
	origin = [Math.floor(width/2), Math.floor(height/2)];
	update();
}

function update(){
	ctx.clearRect(0, 0, width, height);
	drawGrid();
	drawFunction(fun, "blue");
	drawFunction(fun2, "green");
	drawCoordinateSystem();
}

function drawCoordinateSystem(){
	if (!coordianteSystem)
		return;
	
	ctx.save();
	
	////axes
	ctx.font = "12px monospace";
	ctx.lineWidth = 2;
	ctx.lineJoin = "miter";
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	
	//x-axis
	ctx.moveTo(0, origin[1]);
	ctx.lineTo(width, origin[1]);
	
	//y-axis
	ctx.moveTo(origin[0], 0);
	ctx.lineTo(origin[0], height);
	
	ctx.stroke();
	
	////ticks
	ctx.lineWidth = 2;
	ctx.beginPath();
	
	//x-axis ticks
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	
	for (var x = origin[0] + xscale; x <= width; x += xscale){
		ctx.moveTo(x, origin[1]-5);
		ctx.lineTo(x, origin[1]+5);
		if(labels)
			ctx.fillText(Math.floor((x - origin[0])/xscale), x, origin[1] + 6);
	}
	
	for (var x = origin[0] - xscale; x >= 0; x -= xscale){
		ctx.moveTo(x, origin[1]-5);
		ctx.lineTo(x, origin[1]+5);
		if(labels)
			ctx.fillText(Math.round((x - origin[0])/xscale), x, origin[1] + 6);
	}
	
	//y-axis ticks
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	
	for (var y = origin[1] + yscale; y <= height; y += yscale){
		ctx.moveTo(origin[0]-5, y);
		ctx.lineTo(origin[0]+5, y);
		if(labels)
			ctx.fillText(-Math.round((y - origin[1])/yscale), origin[0] + 6, y);
	}
	
	for (var y = origin[1] - yscale; y >= 0; y -= yscale){
		ctx.moveTo(origin[0]-5, y);
		ctx.lineTo(origin[0]+5, y);
		if(labels)
			ctx.fillText(-Math.round((y - origin[1])/yscale), origin[0] + 6, y);
	}
	
	//origin label
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	if(labels)
		ctx.fillText("0", origin[0] + 6, origin[1] + 6);
	
	ctx.stroke();
	ctx.restore();
};

function drawGrid(){
	if (!grid)
		return;
	
	////grid
	ctx.save();
	ctx.translate(0.5, 0.5);
	
	var gw = xscale / gridScale;
	var gh = yscale / gridScale;
	
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#d9d9d9";
	ctx.beginPath();
	
	//vertical grid
	for (var x = origin[0]; x <= width; x += gw){
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
	}
	for (var x = origin[0] - gw; x >= 0; x -= gw){
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
	}
	
	//horizontal grid
	for (var y = origin[1]; y <= height; y += gh){
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
	}
	for (var y = origin[1] - gh; y >= 0; y -= gh){
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
	}
	
	ctx.stroke();
	ctx.restore();
}

function traceFunction(fun){
	range = [(0-origin[0])/xscale, (width-origin[0])/xscale];
	values = [];
	for (var x = 0; x < width; x++){
		var y = -fun((x/xscale)+range[0]);
		values.push((y*yscale)+origin[1]);
	}
	
	current = [];
	paths = [current];
	skip = false;
	for (var x = 0; x < values.length; x++){
		if(!skip){
			current.push([x, values[x]]);
			if (values[x] < 0 || values[x] >= height){
				skip = true;
				current = [];
				paths.push(current);
				// console.log("end", x, values[x]);
			}
		} else {
			if (x < values.length && 
				(values[x] >= 0 && values[x] < height)){
					skip = false;
					current.push([x-1, values[x-1]]);
					current.push([x, values[x]]);
					// console.log("start", x-1, values[x-1]);
			}
		}
	}
	
	paths = paths.filter(function(path){
		return path.length > 0;
	});

	return paths;
}

function drawFunction(fun, color){
	paths = traceFunction(fun);
	
	ctx.save();
	ctx.translate(0.5, 0.5);
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	
	for (var i = 0; i < paths.length; i++){
		// if (i%2 == 0)
			// ctx.strokeStyle = "red";
		// else
			// ctx.strokeStyle = "green";
		
		ctx.beginPath();
		
		var x = paths[i][0][0];
		var y = paths[i][0][1];
		ctx.moveTo(x, y);
		
		for (var j = 1; j < paths[i].length; j++){
			x = paths[i][j][0];
			y = paths[i][j][1];
			ctx.lineTo(x, y);
		}
		
		ctx.stroke();
	}
	
	ctx.restore();
}