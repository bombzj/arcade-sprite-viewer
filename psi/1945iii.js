"use strict"

var paletteAddress = 0x60074;		// per level * scen = 8 * 4


// load pal from rom and oveewrite old
function loadRomPal() {
	
	loadRomPalPsi(paletteAddress, 0xA1, 0x25000000, 0x100000);

	if(showPal)
		drawPal();
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = [
	
];
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
// function drawAnimation(addr) {

// }
// function loopDrawAnimation(addr, offset) {

// }

// function drawAnimationFrame(addr) {
	
// }


var bgAddress = 0x112850;
var bg2Address = 0x1923A;	// layer 2 background

let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawbg() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = bf.getInt(bgAddress + curbg * 16 + 4);
	let tileaddr = bf.getInt(bgAddress + curbg * 16 + 8);
	let bigindex = bf.getInt(bgAddress + curbg * 16);
	
	let addr = bf.getInt(bgAddress + curbg * 4);
	if(!(addr & 0x25000000))
		debugger;
	addr = addr & 0xFFFFF | 0x100000;
	bf.position(addr);
	let pal = bf.get() & 0xF0;
	let flag = bf.get();
	
	let addtile = (flag & 0x7) << 16;
	let mode4 = flag & 0x10;	// 4 bytes mode
	let color16 = flag & 0x20;	// 16 color
	
	bf.skip(2);
	
	let w = bf.getShort();
	let h = bf.getShort();
	labelInfo.innerHTML += ' size:' + w + ',' + h + ' addr:0x' + addr.toString(16).toUpperCase()
	if(w > 30 || h > 50)
		debugger;
	
//	labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
//			+ ' 2x2tile address:' + mapTileAddress[curbg].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	for(let i=0;i<h;i++) {
		for(let j=0;j<w;j++) {

			let tile;
			if(mode4) {
				let tmp = bf.getInt();
				tile = tmp & 0x7FFFF;
				pal = tmp >> 24 & 0xF0;
			} else {
				tile = bf.getuShort();
				tile = tile | addtile;
			}

			if(color16)
				drawTilesBase(imageData, tile, 1, 1, (pal), 16, false, false, false);
			else
				drawTilesBase(imageData, tile, 1, 1, (pal), 16, false, false, false, 0, 256);
			ctxBack.putImageData(imageData, (i-bgAddressSkip * 4) * gridWidth, j * gridHeight);

		}
	}
}


var map2Data = [
	
];
let bg2Width = 16;
let bg2Height = 8;
// function drawbg2() {

// }

function setMapTileStart(bgstart) {
	bgScene = bgstart;
	refresh();
}


frameAddress = [
	0x143F74, 0x147748, 0x14D0E8, 0x155218, 0x15718C, 0x1587B8
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f){
	var bf = new bytebuffer(romFrameData);
	if(f >= 0)
		addr = addr + f * 0xC;
	else {
		if(addr > 0x1000000)	// need translation
			addr = addr - 0x25000000 | 0x100000;
	}
		
	bf.position(addr);

	
	let frame = {
			sprites : []
	};

	let zoomy = bf.get();
	let y = bf.gets();
	let zoomx = bf.get();
	let x = bf.gets();

	let ny = bf.get() & 0xF;
	bf.skip();
	let nx = bf.get() & 0xF;
	bf.skip();
	
	let palette = bf.get();
	let flag = bf.get();
	let tile = bf.getuShort();
	let sprite = {
			x : x,
			y : y,
			tile : tile,
			nx : nx + 1,
			ny : ny + 1,
			vflip : (zoomy & 0x3) == 0,	// this tile need flip
			hflip : false,	// this tile need flip
			pal : palette,
			color : flag & 0x80	// if 256 color
		};
//	frame.cb2 = {
//			x	: -cbx,
//			x2	: cbx << 1,
//			y	: -cby,
//			y2	: cby << 1
//	}
	frame.info = 'addr:0x' + addr.toString(16).toUpperCase() + ' pal:' + palette.toString(16).toUpperCase();
	frame.sprites.push(sprite);

	return frame;
}

