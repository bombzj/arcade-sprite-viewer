"use strict"
var ctx = canvas.getContext("2d");
var ctx2 = canvas2.getContext("2d");
var ctxBack = canvasBack.getContext("2d");

var scale = 2;
var scale2 = 4;	// for canvas2
//	ctx.scale(scale,scale);

ctx.imageSmoothingEnabled = false;
ctx2.imageSmoothingEnabled = false;
ctxBack.imageSmoothingEnabled = false;

canvas.style = `width:544px;height:800px;`;

var curPal = 0;	// current palatte index


var curStartTile;	// current top row index
var tileMode;		// 0 = 16x16, 1 = 32x32, 2 = 8x8

var selx = -1, sely = -1;		// the x y index of selecting tile (left top one if multiple)
var selected=false;				// tile(s) selected

var width = 16;					// tiles per row

var height = 22;				// rows display

var gridWidth = 16;				// pixels per row in one tile
var gridHeight = 16;			// pixels per column in one tile

var frames = [];				// save all frames info here


var tilenx, tileny;		// if select multiple tiles, tiles per selected row / selected rows
var pressed={};			// keep key pressed status


var palData;	// loaded palette data from file
var gfxData;	// loaded images data from file
var romFrameData;	// data from rom, per frame with sprites

var mainImageData = null;

var mode;		// 0 = tile mode, 1 = rom frame mode
var curRomFrame;
var curRomFrame2 = 0;		// if more than one frames together
var curbg;
var romName;
var maxbg = 100;

function init(name) {
	romName = name;
	if(!machine)
		return;
  

	palData = new Uint32Array(16 * 32 * 20);	// 4 pages of palettes if cps1, 20 pages for psi
	for(let i = 0;i < 16;i++) {
		for(let c = 0;c < 256;c++) {	// copy a page with 16 palettes, each palette contains 16 colors
				let dp = c + i * 16 * 16;
				palData[dp] = c << 16 | c | 0xFF000000;
		}
	}

	statusStorage = "status_" + name;
	labelInfo.innerHTML = '<font color="red">Downloading gfx...</font>';

	loadData('rom/' + name + '.gfx', function (data2) {
		labelInfo.innerHTML = '<font color="red">Downloading rom...</font>';
		let arr = new Uint32Array(data2, 0, 400);
		if(arr[0] == 0x05267234) {
			labelInfo.innerHTML = '<font color="red">Extracting...</font>';
			let start = 0;
			for(let i = 1;i < 100;i++) {
				if(arr[i] == 0) {
					start = i + 1;
					break;
				}
			}

			let alldata = pako.inflate(new Uint8Array(data2, start * 4)).buffer;
			gfxData = new Uint8Array(alldata, 0, arr[1]);
			romFrameData = new Uint8Array(alldata, arr[1], arr[2]);
			initviewer();
		} else {
			loadData('rom/' + name, function (data3) {
				labelInfo.innerHTML = '<font color="red">Extracting...</font>';
	
				if(new Uint32Array(data3, 0, 1)[0] == 0x8088B1F) {
					romFrameData = pako.inflate(data3);
				} else {
					romFrameData = new Uint8Array(data3);
				}
				initviewer();
	
			}, function() {
				labelInfo.innerHTML = '<font color="red">Rom not found</font>';
			});

			if(arr[0] == 0x8088B1F) {
				gfxData = pako.inflate(data2);
			} else {
				gfxData = new Uint8Array(data2);
			}
		}


	}, function() {
		labelInfo.innerHTML = '<font color="red">Gfx not found</font>';
	});

}


function initviewer() {
	bfr = getrdbuf();

	labelInfo.innerHTML = '';

	// initial frames info from local storage
	loadStatus();
	loadFrame();
	loadRomFrame();

	loadRomPal();
	refresh();
}

// empty function, needs to be replaced
function loadRomFrame() {}

// with f, addr is of anim, return frame with index of f, without f, addr is of frame
function getRomFrame(addr, f){}

function loadData(path, success, error)
{
var xhr = new XMLHttpRequest();
xhr.responseType = "arraybuffer";
xhr.onreadystatechange = function() {
  if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
          if (success)
              success(xhr.response);
      } else {
          if (error)
              error(xhr);
      }
  }
};
xhr.open("GET", path, true);
xhr.send();
}

var bfr;	// rom data readonly temp
// get rom data buffer
function getrdbuf(pos) {
	return new bytebuffer(romFrameData, pos);
}

var palset;	// current palette set with 32*16 colors, per level
var palset2;	// per scene?
var palsetSpr;	// palset for sprite (neogeo)
var curpalpage = 0;	// current palette page to display
var maxPalSet = 50;

var showPal;
var showCB;

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var palgrid=6;
var showpalsets = [0, 1, 2, 3];
function drawPal() {
	for(let s = 0;s < showpalsets.length;s++) {
		let p = showpalsets[s];
		
		for(let i=0;i<16;i++) {
			for(let j=0;j<32;j++) {
				var palBase = ((j + curpalpage) * 16 + i) + 16 * 32 * p;
				let color = palData[palBase];
				color = (color & 0xFF) << 16 | (color & 0xFF00) | (color & 0xFF0000) >> 16;	// raw data color is bgr, not rgb
			    ctx2.fillStyle = '#' + color.toString(16).padStart(6, '0');
			    ctx2.fillRect(i*palgrid+100*s, j*palgrid, palgrid, palgrid); 
			}
		}
	}
}


function refresh() {
	if(animTimer) {
		clearTimeout(animTimer)
		animTimer = null;
	}
	
	if(mode < 2 || mode == 5) {
		canvas.style.display="";
		canvasBack.style.display="none";
	} else {
		canvas.style.display="none";
		canvasBack.style.display="";
		ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	}
	if(mode == 0) {
		drawTiles();
	} else if(mode == 1) {
		drawRomFrame();
	} else if(mode == 2) {
		if(typeof drawbg === 'function') {
			labelInfo.innerHTML = 'map:' + curbg + ',' + bgScene;
			drawbg();
		} else {
			labelInfo.innerHTML = '<font color="red">unsupported</font>';
		}
	} else if(mode == 3) {
		if(typeof drawbg2 === 'function') {
			labelInfo.innerHTML = 'map:' + curbg + ',' + bgScene;
			drawbg2();
		} else {
			labelInfo.innerHTML = '<font color="red">unsupported</font>';
		}
	} else if(mode == 4) {
		if(typeof drawRomFramePlayer === 'function') {
			drawRomFramePlayer();
		} else {
			labelInfo.innerHTML = '<font color="red">unsupported</font>';
		}
	} else if(mode == 5) {
		if(typeof drawAnimation === 'function') {
			drawAnimation();
		} else {
			labelInfo.innerHTML = '<font color="red">unsupported</font>';
		}
	}
}

function switchmode(m) {
	mode = m;
	refresh();
	saveStatus();
}

var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;

var bgScene = 0;
var bgAddressSkip = 0;
var bgAddressSkipY = 0;

var hideBackground = false;


function setMapTileStart(bgstart) {
	bgScene = bgstart;
	refresh();
}


var spritePaletteMap = new Map();	// sprite addr -> palset
var frameAddress = [];
var preaddr = 0;	// don't auto switch pal if addr not changed

// draw a frame contains several sprites
function drawRomFrame(addr, offx = 128, offy = 160) {
	if(curRomFrame >= frameAddress.length) {
		labelInfo.innerHTML = 'EOF'
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let frame;
	if(addr>0) {
		frame = getRomFrame(addr);
	} else {
		if(curRomFrame >= frameAddress.length)
			return;
		addr = frameAddress[curRomFrame];
		frame = getRomFrame(addr, curRomFrame2);

		if(addr != preaddr) {
			let p = spritePaletteMap.get(addr);
			if(p >= 0){
				// switch to proper palset
				palset = p;
				loadRomPal();
			}
			preaddr = addr;
		}

	}

	if(!frame)
		return;
	drawRomFrameBase(frame)

//	nFrame.value=addr.toString(16).toUpperCase();
//	hexFrame.value=(curRomFrame*4).toString(16).toUpperCase();
	labelInfo.innerHTML = frame.info;
}

function drawRomFrameBase(frame, c = ctx, offx = 128, offy = 160) {
	if(!frame) {
		debugger;
		return;
	}
	for(let spr of frame.sprites) {
		var imageData = c.createImageData(spr.nx * (gridWidth), spr.ny * (gridHeight));
		
		drawSpriteTile(imageData, spr);
		
		c.putImageData(imageData, spr.x + offx, spr.y + offy);
	}
	
	if(showCB) {
		c.lineWidth = 1;
		// draw axis
		c.strokeStyle = 'purple';
		c.beginPath();
		c.moveTo(offx - 30, offy);
		c.lineTo(offx + 30, offy);
		c.moveTo(offx, offy - 30);
		c.lineTo(offx, offy + 30);
		c.stroke();

		// draw collision box
		if(frame.cb1) {
			c.strokeStyle = 'green';
			c.strokeRect(frame.cb1.x + offx, -frame.cb1.y + offy, frame.cb1.x2, -frame.cb1.y2);
		}
		if(frame.cb2) {
			c.strokeStyle = 'red';
			c.strokeRect(frame.cb2.x + offx, -frame.cb2.y + offy, frame.cb2.x2, -frame.cb2.y2);
		}
	}
}


function drawSpriteTile(image, spr) {
	if(spr.color)
		drawTilesBase(image, spr.tile, spr.nx, spr.ny, spr.pal, 16, false, spr.vflip, spr.hflip, 0, 256);
	else
		drawTilesBase(image, spr.tile, spr.nx, spr.ny, spr.pal, 16, false, spr.vflip, spr.hflip);
}

function drawTiles(startTile = curStartTile, w = width, h = height, pal = curPal) {
	labelInfo.innerText='row:' + curStartTile.toString(16).toUpperCase()
			+ ' pal:0x' + curPal.toString(16).toUpperCase() + ' tileMode:' + tileMode;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	
	if(tileMode == 0) {
		mainImageData = ctx.createImageData(w * (gridWidth+1), h * (gridHeight+1));
		drawTilesBase(mainImageData, startTile, w, h, pal, 16, true);
	} else if(tileMode == 1) {
		w = w >> 1;
		h = h >> 1;
		mainImageData = ctx.createImageData(w * (gridWidth*2+1), h * (gridHeight*2+1));
		drawTilesBase(mainImageData, startTile, w, h, pal + 0x60, 32, true);
	} else if(tileMode == 2) {
		w = w << 1;
		h = h << 1;
		mainImageData = ctx.createImageData(w * (8+1), h * (8+1));
		drawTilesBase(mainImageData, startTile, w, h, pal, 8, true);
	} else if(tileMode == 3) {	// 256 color
		mainImageData = ctx.createImageData(w * (gridWidth+1), h * (gridHeight+1));
		drawTilesBase(mainImageData, startTile, w, h, pal, 16, true, false, false, 0, 256);
	}

	ctx.putImageData(mainImageData, 0, 0);
}

// like dino, srcw = 16 for gfx2, for 1945 srcw always equals to w
function drawTilesBase(image, startTile, w, h, pal, srcw, gridline = false, vflip = false, hflip = false, hide = 0, color = 16) {
	hide = hide * 3;
//	vflip=hflip=false;
	var baseImageIndex = 0;

	var palBase = pal * 16;
	var imageData = new Uint32Array(image.data.buffer);
	
	var bytePerGridWidth = srcw >> 1;
	if(color == 256)
		bytePerGridWidth <<= 1;
	var pixelSkipPerTile = (w-1) * srcw;	// move to the next row to draw
	var pixelSkipPerTile2 = ((w-1) * (srcw+1)+1);	// if gridline

	for(let nx = 0;nx < h;nx++) {
		var baseIndex;
		for(let ny = 0;ny < w;ny++) {
			let rnx = vflip ? h - nx - 1 : nx;
			let rny = hflip ? w - ny - 1 : ny;
			if(machine.type == 1)	// psi
				baseIndex = (startTile + rnx * w + rny) * srcw * srcw;
			else		// cps1
				baseIndex = (startTile + rnx * srcw + rny) * srcw * srcw;
			if(color == 256)
				baseIndex <<= 1;
			if(srcw != 8)
				baseIndex >>= 1;
			if(gridline)
				baseImageIndex = (nx * (srcw+1) * (srcw+1) * w + ny * (srcw+1));
			else
				baseImageIndex = (nx * srcw * srcw * w + ny * srcw);
				
			if(vflip) {
				if(hflip) {
					baseIndex += bytePerGridWidth * srcw - 1;
				} else {
					baseIndex += bytePerGridWidth * (srcw - 1);
				}
			} else {
				if(hflip) {
					baseIndex += bytePerGridWidth - 1;
				} else {
					
				}
			}
			for(let i = 0;i < srcw;i++) {
				for(let j = 0;j < bytePerGridWidth;j++) {
					var color2 = gfxData[baseIndex];
					var colorLeft = (color2 >> 4);
					var colorRight = (color2 % 16);
					
					if(color == 256) {
						colorLeft = color2;
					}
					
					if(hflip) {
						var t=colorLeft;colorLeft=colorRight;colorRight=t;
					}
					
					imageData[baseImageIndex] = palData[palBase + colorLeft];

					if(hide)
					if(colorLeft == 15 || colorLeft < hide) {
						imageData[baseImageIndex] = 0;
					}
					baseImageIndex++;
					
					if(color == 16) {	// if 16color, 2 pixel in 1 byte

						imageData[baseImageIndex] = palData[palBase + colorRight];

						if(hide)
						if(colorRight == 15 || colorRight < hide) {
							imageData[baseImageIndex] = 0;
						}
						
						baseImageIndex++;
					}
					
					if(hflip)
						baseIndex--;
					else
						baseIndex++;
				}
				if(vflip) {
					if(hflip) {
						
					} else {
						baseIndex -= bytePerGridWidth * 2;
					}
				} else {
					if(hflip) {
						baseIndex += bytePerGridWidth * 2;
					} else {
						if(srcw == 8)
							baseIndex += bytePerGridWidth;
					}
				}
					
				if(gridline)
					baseImageIndex += pixelSkipPerTile2;
				else
					baseImageIndex += pixelSkipPerTile;
			}
		}
	}
}

canvas.addEventListener("mousemove", function(event) {

	var x = event.offsetX/scale;
	var y = event.offsetY/scale;
	
	var tx = Math.floor(x / 17);
	var ty = Math.floor(y / 17);
	
	labelx.innerText=tx;
	labely.innerText=ty;
	labeltn.value=(tx + ty*16+curStartTile).toString(16).toUpperCase();
	
	if(selx<0){
		seltile.style.left=tx*34-2;
		seltile.style.top=ty*34-2;
	} else if(!selected){

		var selx2=tx;
		var sely2=ty;
		
		if(selx2 > selx)
			tilenx = selx2-selx+1;
		else
			tilenx=1;
		
		if(sely2 > sely)
			tileny = sely2-sely+1;
		else
			tileny=1;

		seltile.style.left=selx*34-2;
		seltile.style.top=sely*34-2;
		
		seltile.style.width=scale*((gridWidth+1)*tilenx);
		seltile.style.height=scale*((gridHeight+1)*tileny);
	}

});

window.addEventListener("mousemove", function(event) {
	if(selx>=0){
		moving.style.left=event.clientX-moving.clientWidth/2;
		moving.style.top=event.clientY-moving.clientHeight/2;
	}

});

canvas.addEventListener("mousedown", function(event) {
	return;	// deprecated, used to drag&drop tiles
	if(selected)
		return;
	// select start
	tilenx = 1;	// 1 by 1 as default
	tileny = 1;

	var x = event.offsetX/scale;
	var y = event.offsetY/scale;
	
	selx=Math.floor(x / 17);
	sely=Math.floor(y / 17);

	seltile.style.left=selx*34;
	seltile.style.top=sely*34;

});

canvas.addEventListener("mouseup", function(event) {
	if(selected)
		return;
	// select finish
	if(selx >= 0) {
		var x = event.offsetX/scale;
		var y = event.offsetY/scale;

		moving.style.width=tilenx*16*scale2;
		moving.style.height=tileny*16*scale2;
		canvas3.width=tilenx*16;
		canvas3.height=tileny*16;
		canvas3.style.width=tilenx*16*scale2;
		canvas3.style.height=tileny*16*scale2;
		
		var ctx3 = canvas3.getContext("2d");

		ctx3.scale(scale2,scale2);
		ctx3.imageSmoothingEnabled = false;
		
		
		var imageData = ctx3.createImageData(tilenx * (gridWidth), tileny * (gridHeight));
		
		drawTilesBase(imageData, curStartTile + selx + sely * width, tilenx, tileny, curPal, 16);
		
		ctx3.putImageData(imageData, 0, 0);
		
		moving.style.left=event.clientX;
		moving.style.top=event.clientY;

		moving.style.display="";
		selected=true;
	}
});

canvas.addEventListener("mousewheel",  function(event) {
	curStartTile += Math.floor(event.deltaY/50)*width;
	if(curStartTile < 0)
		curStartTile=0;
		
	drawTiles();
})


var drawx, drawy;	// position that floating selected tiles draw in 

canvas2div.addEventListener("mousemove", function(event) {
	event.stopPropagation();
	if(selimg!=null) {	// draging image
		if(pressed[17]){	// control key to align to grid
			drawx = Math.floor(((event.clientX-startdragx)/scale2+selimg.sprite.x)/gridWidth)*gridWidth;
			drawy = Math.floor(((event.clientY-startdragy)/scale2+selimg.sprite.y)/gridHeight)*gridHeight;
		} else {
			drawx = Math.floor((event.clientX-startdragx)/scale2)+selimg.sprite.x;
			drawy = Math.floor((event.clientY-startdragy)/scale2)+selimg.sprite.y;
		}

//		console.log(drawx, drawy)

		if(drawx < 0)
			drawx = 0;
		if(drawy < 0)
			drawy = 0;
		labelx.innerText=drawx;
		labely.innerText=drawy;
		var x = drawx*scale2;
		var y = drawy*scale2;
		
		selimg.style.left=x;
		selimg.style.top=y;
		return;
	}
	
	if(selected){
		drawx = Math.floor(event.offsetX/scale2)-gridWidth*tilenx/2;
		drawy = Math.floor(event.offsetY/scale2)-gridHeight*tileny/2;
		if(drawx < 0)
			drawx = 0;
		if(drawy < 0)
			drawy = 0;
		labelx.innerText=drawx;
		labely.innerText=drawy;
		var x = drawx*scale2;
		var y = drawy*scale2;

		moving.style.left=x + canvas2div.offsetLeft + canvas2div.clientLeft;
		moving.style.top=y + canvas2div.offsetTop + canvas2div.clientTop;
		return;
	}
	if(dragallimg){
		let dx = event.clientX-startdragx;
		let dy = event.clientY-startdragy;
		var imgs = canvas2div.getElementsByTagName("img");
		for(let img of imgs) {
			img.drawx = Math.floor(dx/scale2)+img.sprite.x;
			img.drawy = Math.floor(dy/scale2)+img.sprite.y;
			img.style.left=img.drawx*scale2;
			img.style.top=img.drawy*scale2;
		}
	}
});

canvas2div.addEventListener("mouseup", function(event) {
	event.stopPropagation();
	if(selimg!=null) {	// dropping image
		selimg.style.pointerEvents="";
		selimg.style.opacity=1;
		selimg.sprite.x=drawx;
		selimg.sprite.y=drawy;
		
		selimg=null;
		return;
	}
	if(dragallimg){
		dragallimg = false;
		var imgs = canvas2div.getElementsByTagName("img");
		for(let img of imgs) {
			img.sprite.x=img.drawx;
			img.sprite.y=img.drawy;
		}
	}
});

var startdragx, startdragy;	// when drag image from canvas2div, record the click position as anchor
var startdragleft, startdragtop;	// left top of image when start drag, also keep original position for reverting if cancel

canvas2div.addEventListener("mousedown", function(event) {
	event.stopPropagation();
	if(selimg!=null) {	// dropping image
		selimg.style.pointerEvents="";
		selimg.style.opacity=1;
		selimg=null;
		return;
	}
	

	var x = event.offsetX/scale2;
	var y = event.offsetY/scale2;
	x=Math.floor(x / 17) * 16;
	y=Math.floor(y / 17) * 16;


	if(selected){
		// ctx2.drawImage(canvas, selx * (gridWidth+1)+1, sely * (gridHeight+1)+1, gridWidth, gridHeight, drawx, drawy, gridWidth, gridHeight);
		var spr = createSprite();
		createNewImg(spr);
		moving.style.display="none";
		
		selx=-1;
		sely=-1;
		selected=false;
		seltile.style.width=16*scale+1;
		seltile.style.height=16*scale+1;
		return;
	}
	
	if(!dragallimg && pressed[17]){	// start drag all images
		dragallimg = true;
		startdragx=event.clientX;
		startdragy=event.clientY;
	}
});

//canvas2div.addEventListener('dragover', function(event) {
//	event.preventDefault();
//});
//
//canvas2div.addEventListener('drop', function(event) {
//	debugger
//});
var selimg=null;	// dragging img from canvas2
var dragallimg = false;	// click blank area to drag all images

function createNewImg(spr) {
	var newImg = document.createElement("img");
	canvas2div.appendChild(newImg);
	newImg.src=canvas3.toDataURL();
	newImg.style.cssText="position:absolute;";
	newImg.style.width=gridWidth*scale2*spr.nx;
	newImg.style.height=gridHeight*scale2*spr.ny;
	newImg.style.left=spr.x*scale2;//moving.offsetLeft-canvas2div.offsetLeft-canvas2div.clientLeft;
	newImg.style.top=spr.y*scale2;//moving.offsetTop-canvas2div.offsetTop-canvas2div.clientTop;
	newImg.style.display="";
	newImg.draggable=false;
	newImg.sprite = spr;
	

	newImg.addEventListener('mousedown', function(event) {
		if(selx>=0)	// drawing tile
			return;
		selimg=this;
		startdragleft=this.offsetLeft;
		startdragtop=this.offsetTop;
		startdragx=event.clientX;
		startdragy=event.clientY;
		this.style.opacity=0.5;
		this.style.pointerEvents="none";
		event.stopPropagation();
	});
}

window.addEventListener("keydown", function (event) {
	if(event.srcElement.tagName.toUpperCase() != 'BODY') {
		return;
	}
    pressed[event.keyCode] = true;
    
	switch(event.key) {
		case 'ArrowUp':
			if(event.shiftKey) {	// move background
				bgAddressSkipY--;
				if(bgAddressSkipY <0)
					bgAddressSkipY=0
			} else if(event.ctrlKey) {	// change palette
				palset-=1;
				if(palset < 0)
					palset = 0;
				loadRomPal();
			} else {
				if(mode == 0) {
					curStartTile-=width;
					if(curStartTile < 0)
						curStartTile = 0;
				} else if(mode == 1) {
					curRomFrame--;
					if(curRomFrame < 0)
						curRomFrame = 0;
					curRomFrame2=0;
				} else if(mode == 2 || mode == 3) {
					curbg--;
					if(curbg < 0)
						curbg = 0;
					bgScene=0;
					bgAddressSkip=0;
					bgAddressSkipY=0;
				} else if(mode == 4) {
					curPlayerFrame--;
					if(curPlayerFrame < 0)
						curPlayerFrame = 0;
				} else if(mode == 5) {
					palsetSpr = 0;
					curAnimAct = 0;
					curAnim--;
					if(curAnim < 0)
						curAnim = 0;
				}
					
			}
			refresh();
			saveStatus();
		break;
			
		case 'ArrowDown':
			if(event.shiftKey) {	// move background
				bgAddressSkipY++;
			} else if(event.ctrlKey) {	// change palette
				palset++;
				if(palset >= maxPalSet)
					palset = maxPalSet;
				loadRomPal();
			} else {
				if(mode == 0) {
					curStartTile+=width;
				} else if(mode == 1) {
					curRomFrame++;
					if(curRomFrame >= frameAddress.length)
						curRomFrame = frameAddress.length-1;
					curRomFrame2=0;
				} else if(mode == 2 || mode == 3) {
					//if(curbg < mapTileAddress.length - 1) {
					curbg++;
					if(curbg >= maxbg)
						curbg = maxbg;
					bgScene=0;
					bgAddressSkip=0;
					bgAddressSkipY=0;
					//}
				} else if(mode == 4) {
					curPlayerFrame++;
				} else if(mode == 5) {
					palsetSpr = 0;
					curAnimAct = 0;
					curAnim++;
//					if(curAnim >= animAddress.length)
//						curAnim = animAddress.length - 1;
				}
			}
			refresh();
			saveStatus();
		break;
		
		case 'Home':
			curStartTile=0;
			refresh();
		break;
		
		case 'End':
			curStartTile=Math.floor(gfxData.length/128/16)-24;
			refresh();
		break;

		case '=':
			canvas.style = `width:544px;height:800px;`;
		break;
		case '-':
			canvas.style = `width:272px;height:400px;`;
		break;
		
		case ',':
			if(event.ctrlKey) {
				if(showPal) {
					curpalpage-=0x40;
					if(curpalpage < 0) {
						curpalpage = 0;
					}
					ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
					loadRomPal();
				}
			} else {
				if(mode == 2 || mode == 3) {
					bgAddressSkip--;
					if(bgAddressSkip <0) {
						bgAddressSkip=0
					}
				} else if(mode == 5) {
					palsetSpr--;
				} else {
					if(curPal > 0)
						curPal--
				}
				refresh();
			}
		break;
			
		case '.':
			if(event.ctrlKey) {
				if(showPal) {
					curpalpage+=0x40;
					ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
					loadRomPal();
				}
			} else {
				if(mode == 2 || mode == 3) {
					bgAddressSkip++;
				} else if(mode == 5) {
					palsetSpr++;
				} else {
					curPal++;
				}
				refresh();
			}
		break;
		
		case 'ArrowLeft':
			if(event.shiftKey) {	// move background
				bgAddressSkip--;
				if(bgAddressSkip <0)
					bgAddressSkip=0
			} else if(event.ctrlKey) {	// change palette
				palset2--;
				if(palset2<0)
					palset2=0;
				loadRomPal();
			} else {
				if(mode == 0) {
					curStartTile--
					if(curStartTile < 0)
						curStartTile = 0;
				} else if(mode == 1) {
					curRomFrame2--;
					if(curRomFrame2 < 0)
						curRomFrame2 = 0;
				} else if(mode == 2 || mode == 3) {
					bgScene--;
					if(bgScene<0)
						bgScene=0;
					bgAddressSkip=0;
					bgAddressSkipY=0;
				} else if(mode == 4) {
					curPlayerType--;
					if(curPlayerType < 0)
						curPlayerType = 0;
				} else if(mode == 5) {
					curAnimAct--;
					if(curAnimAct < 0)
						curAnimAct = 0;
				}
			}
			refresh();
			saveStatus();
		break;
			
		case 'ArrowRight':
			if(event.shiftKey) {	// move background
				bgAddressSkip++;
			} else if(event.ctrlKey) {	// change palette
				palset2++;
				loadRomPal();
			} else {
				if(mode == 0) {
					curStartTile++;
				} else if(mode == 1) {
					curRomFrame2++;
				} else if(mode == 2 || mode == 3) {
					bgScene++;
					bgAddressSkip=0;
					bgAddressSkipY=0;
				} else if(mode == 4) {
					curPlayerType++;
					if(curPlayerType >= playerSpriteAddress.length)
						curPlayerType = playerSpriteAddress.length-1;
				} else if(mode == 5) {
					curAnimAct++;
				}
			}
			refresh();
			saveStatus();
		break;
		
		case 'PageUp':
			if(mode == 0) {
				curStartTile-=width*16
				if(curStartTile < 0)
					curStartTile=0;
			} else if(mode == 1) {
				curRomFrame -= 32;
				if(curRomFrame < 0)
					curRomFrame = 0;
			}
			refresh();
			saveStatus();
		break;
			
		case 'PageDown':
			if(mode == 0) {
				curStartTile+=width*16;
			} else if(mode == 1) {
				curRomFrame+=32;
				if(curRomFrame >= frameAddress.length)
					curRomFrame = frameAddress.length-1;
			}
			refresh();
			saveStatus();
		break;
		
		case 'Escape':
			if(selimg!=null){
				selimg.style.left=startdragleft;
				selimg.style.top=startdragtop;
				selimg.style.pointerEvents="";
				selimg.style.opacity=1;
				selimg=null;
			} else if(selx >= 0){
				moving.style.display="none";
				selx=-1;
				sely=-1;
				seltile.style.width=16*scale+1;
				seltile.style.height=16*scale+1;
				selected=false;
			} else if(dragallimg) {
				dragallimg=false;
				var imgs = canvas2div.getElementsByTagName("img");
				for(let img of imgs) {
					img.style.left=img.sprite.x*scale2;
					img.style.top=img.sprite.y*scale2;
				}
			}
		break;
		case 'Delete':
			if(selimg!=null){
				frames[curframe].sprites[selimg.sprite.i]=null;
				canvas2div.removeChild(selimg);
				imgset.remove(selimg);
				selimg=null;
			} 
		break;
		case 'm':
			mode++;
			if(mode > 5	)
				mode = 0;
			refresh();
			saveStatus();
			comboMode.selectedIndex = mode;
			break;
		case 'M':
			mode--;
			if(mode < 0)
				mode = 5;
			refresh();
			saveStatus();
			comboMode.selectedIndex = mode;
			break;
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
			mode = parseInt(event.key);
			refresh();
			saveStatus();
			comboMode.selectedIndex = mode;
			break;
		case '[':
			if(mode == 0) {
				tileMode--;
				if(tileMode < 0)
					tileMode = 0;
				refresh();
				saveStatus();
			}
			break;
		case ']':
			if(mode == 0) {
				tileMode++;
				if(tileMode > 3)
					tileMode = 3;
				refresh();
				saveStatus();
			}
			break;
		case 'p':
			showPal = !showPal;
			ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
			loadRomPal();
			saveStatus();
			break;
		case 'c':
			if(!event.ctrlKey) {
				showCB = !showCB;
				refresh();
				saveStatus();
			}
			break;
		case 'h':
			hideBackground = !hideBackground;
			refresh();
			break;
	}
	
}, false);



window.addEventListener("keyup", function (event) {
	// console.log("key = " + event.key);
	delete pressed[event.keyCode];
}, false);

var curframe=0;	// current frame
var totalframe=1;

framePrev.addEventListener("mousedown", function(event) {
	saveFrame(curframe);
	curframe--;
	if(curframe < 0)
		curframe = 0;
	else {
		loadFrame(curframe);
		saveStatus()
	}
});

frameNext.addEventListener("mousedown", function(event) {
	saveFrame(curframe);
	curframe++;
	if(totalframe <= curframe)
		totalframe++;
	loadFrame();
	saveStatus();
});




function loadFrame(i = curframe) {
	frameNumSpan.innerText=curframe + '/' + totalframe;
	// remove old
	var imgs = canvas2div.getElementsByTagName("img");
	while(imgs[0]) {
		imgs[0].remove();
	}
	if(frames[i]) {
		// add new frame sprites
		for(let spr of frames[i].sprites) {
			if(!spr)
				continue;
			canvas3.width=spr.nx * (gridWidth);
			canvas3.height=spr.ny * (gridHeight);
			var ctx3 = canvas3.getContext("2d");
			var imageData = ctx3.createImageData(spr.nx * (gridWidth), spr.ny * (gridHeight));
			drawTilesBase(imageData, spr.tile, spr.nx, spr.ny, spr.pal, 16);
			ctx3.putImageData(imageData, 0, 0);
			
			createNewImg(spr);
		}
		
	}else{	// new one
		frames[i] = {
			sprites : []
		}
	}
}

function saveFrame(i) {
	if(!frames[i])
		return;
	localStorage.setItem("frame"+i, JSON.stringify(frames[i]));
}

// return next empty 
function createSprite(){
	var tileData = {
			tile	:	curStartTile + sely*width+selx,
			pal		:	curPal,
			x		:	drawx,
			y		:	drawy,
			nx		:	tilenx,
			ny		:	tileny,
	}
	
	let s = frames[curframe].sprites;
	for(let i=0;i<s.length;i++){
		if(!s[i]) {
			s[i] = tileData;
			s[i].i = i;
			return tileData;
		}
	}
	tileData.i = s.length;
	s[tileData.i] = tileData;
	return tileData;
}

/*
ctx.fillStyle = "red";
ctx.fillRect(10, 10, 50, 50);

function copy() {
  var imgData = ctx.getImageData(10, 10, 50, 50);
debugger
  ctx.putImageData(imgData, 10, 70);
}

copy()
*/

let pin = "lkjreavnvkl#$^%2t42deFDF12344dgf$%235f";

function downloadJson() {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(frames));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", "frames.json");
}

var statusStorage;
function loadStatus() {
	var s = JSON.parse(localStorage.getItem(statusStorage));
	if(!s)
		s = {};
	curStartTile = (undefined != s.curStartTile) ? s.curStartTile : 0;
	curPal = (undefined != s.curPal) ? s.curPal : 0;
	curframe = (undefined != s.curframe) ? s.curframe : 0;
	mode = (undefined != s.mode) ? s.mode : 0;
	curRomFrame = (undefined != s.curRomFrame) ? s.curRomFrame : 0;
	curbg = (undefined != s.curbg) ? s.curbg : 0;
	bgScene = (undefined != s.bgScene) ? s.bgScene : 0;
	bgHeight = (undefined != s.bgHeight) ? s.bgHeight : 8;
	palset = (undefined != s.palset) ? s.palset : 0;
	palset2 = (undefined != s.palset2) ? s.palset2 : 0;
	curPlayerFrame = (undefined != s.curPlayerFrame) ? s.curPlayerFrame : 0;
	curPlayerType = (undefined != s.curPlayerType) ? s.curPlayerType : 0;
	curAnim = (undefined != s.curAnim) ? s.curAnim : 0;
	curAnimAct = (undefined != s.curAnimAct) ? s.curAnimAct : 0;
	showPal = (undefined != s.showPal) ? s.showPal : true;
	tileMode = (undefined != s.tileMode) ? s.tileMode : 0;
	showCB = (undefined != s.showCB) ? s.showCB : false;
	// load all frames
	for(let i=0;i<totalframe;i++) {
		frames[i] = JSON.parse(localStorage.getItem("frame"+i));
	}
	comboMode.selectedIndex = mode;
}

function saveStatus() {
	var status = {
		curStartTile	: curStartTile,
		curPal			: curPal,
		curframe		: curframe,
		totalframe		: totalframe,
		mode			: mode,
		curRomFrame		: curRomFrame,
		curbg			: curbg,
		bgHeight		: bgHeight,
		bgScene		: bgScene,
		palset			: palset,
		palset2			: palset2,
		curPlayerFrame	: curPlayerFrame,
		curPlayerType	: curPlayerType,
		curAnim			: curAnim,
		curAnimAct		: curAnimAct,
		showPal			: showPal,
		tileMode		: tileMode,
		showCB			: showCB,
	};
	localStorage.setItem(statusStorage, JSON.stringify(status));
}


// paste image, check its palette and show result
window.addEventListener('paste', (event) => {
    let paste = (event.clipboardData || window.clipboardData);
	let items = paste.items;
	for(let item of items) {
		if (item.type.indexOf("image") == -1) continue;
		
		var URLObj = window.URL || window.webkitURL;
		var img = new Image();
		
        img.onload = function(){
            // Draw the image
            analysePal(img);
        };
        
        img.src = URLObj.createObjectURL(item.getAsFile());
        event.preventDefault();
	}
    
});

// analyse palette from pasted image
function analysePal(img) {
	let canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	let ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	let imgdata = ctx.getImageData(0, 0, img.width, img.height).data;
	
	let count=imgdata.length / 4;

	let map = new Map();
	for(let i=0;i<count;i++) {
		const color = (imgdata[i*4]<<16) + (imgdata[i*4+1]<<8) + imgdata[i*4+2];
		
        const collection = map.get(color);
        if (!collection) {
            map.set(color, 1);
        } else {
        	map.set(color, collection + 1);
        }
	}
	
	var palsets = getpalsets();
	
	for(let i of map.entries()) {
		console.log("color", i[0], i[1], "pal=", allpalmap.get(i[0]));
	}
	
	for(let i = 0;i < palsets.length;i++) {
		let has=true;
		for(let e of map.entries()) {
			if(!palsets[i].has(e[0])){
				has=false;
				break;
			}
		}
		if(has) {
			console.log("pal = " + i);
			break;
		}
	}
}

// already deprecated because palettes can be taken from rom
var allpalmap=null;	// all palettes together
function getpalsets(){
	if(!allpalmap) {
		allpalmap=new Map();
		for(let i = 0;i < palData.length / 3;i++) {
			let index=i*3;
			const color = (palData[index]<<16) + (palData[index+1]<<8) + palData[index+2];
	        let collection = allpalmap.get(color);
	        if (!collection) {
	        	allpalmap.set(color, [Math.floor(i/16)+':'+(i%16)]);
	        } else {
	        	collection.push(Math.floor(i/16)+':'+(i%16));
	        }
		}
	}
	var sets = [];
	for(let i = 0;i < palData.length / 3 / 16;i++) {
		let set = new Set();
		for(let j = 0;j < 16;j++) {
			let index=(i*16+j)*3;
			const color = (palData[index]<<16) + (palData[index+1]<<8) + palData[index+2];
			set.add(color);
		}
		sets[i] = set;
	}
	return sets;
}

var curPlayerType;
var curPlayerFrame;

