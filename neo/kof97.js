"use strict"

var paletteAddress = 0x3CFFF0;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);

	// load sprite palette
	
	for(let p = 0;p < 8;p++) {
		bf.position(paletteAddress + p * 0x400);
		for(let i = 0;i < 32;i++) {
			loadRomPalNeo(bf, (i << 4) + p * 16 * 32);
		}
	}
	
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
function drawAnimation(addr) {return;
//	let addr = animAddress[curAnim];
	var bf = new bytebuffer(romFrameData);
	if(!addr)
		addr = animAddress[curAnim];

	if(animTimer) {
		clearTimeout(animTimer)
		animTimer = null;
	}
	

	loopDrawAnimation(addr, 0xA);
}
function loopDrawAnimation(addr, offset) {
	animTimer = null;

	var bf = new bytebuffer(romFrameData, addr);
	let fr = bf.getInt();
	let link = bf.getInt();
	let flag = bf.getShort();


	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRomFrame(fr);
	addr += offset;

	if(flag < 0)
		return;
	animTimer = setTimeout("loopDrawAnimation("+ addr +"," + offset+")", 200);
}

function drawAnimationFrame(addr, c = ctx, offx = 128, offy = 160, cbbase = 0x103000) {

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
	//0xB6DFE, 0xB5B44, 0xBDBFE, 
	0xB5A82, 0xB6B0A, 0xBDBEC, 0xBDF24, 0xBE25C, 0xBE26A
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);

	if(f >= 0) {	// use frameAddress and has multiple frames
		let offset = bf.getShort(addr + 2);

		addr += offset + 2;
	}

	bf.position(addr);
	let frame = {
		sprites: [],
	};
	
	bf.skip(2);
	let cnt = bf.get() + 1;
	let cnt2 = bf.get() + 1;
	let offset = bf.getShort();
	if(f) {
		offset = offset * f;
	} else {
		offset = 0;
	}


	bf2.position(addr + offset + 0x6);

	for(let i = 0;i < cnt;i++) {
		for(let j = 0;j < cnt2;j++) {
			let tile = bf2.getuShort();
			let palette = bf2.get();
			let flag = bf2.get();
			let sprite = {
				x: i * 0x10,
				y: j * 0x10,
				tile: tile,
				nx: 1,
				ny: 1,
				vflip: flag & 0x2,	// this tile need flip
				hflip: flag & 0x1,	// this tile need flip
				pal: palette,
			};
			frame.sprites.push(sprite);
		}
	}



	return frame;
}


var curPlayerType;
var curPlayerFrame;

var animPlayerAddr = [];
//draw anim by player 0-3
function drawRomFramePlayer() {
	
}
