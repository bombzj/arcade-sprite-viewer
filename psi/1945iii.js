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
function drawAnimation(addr) {

}
function loopDrawAnimation(addr, offset) {

}

function drawAnimationFrame(addr) {
	
}


var mapAddress = 0x112850;
var map2Address = 0x1923A;	// layer 2 background

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawMap() {

}


var map2Data = [
	
];
let map2Width = 16;
let map2Height = 8;
function drawMap2() {

}

function setMapTileStart(mapstart) {
	mapScene = mapstart;
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

