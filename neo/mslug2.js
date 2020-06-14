"use strict"

var paletteAddress = 0x114000;	// all palettes are here
var paletteAddress2 = 0x116400;

// load pal from rom and oveewrite old
function loadRomPal() {

	mslugPalette(0x78FFC);
	mslugPalette(0x7902E);
	mslugPalette(0x53272);
	
	if(showPal)
		drawPal();
}

function mslugPalette(addr) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);

	for(let p = 0;p < 0x100;p++) {
		let idx2 = bf.getuShort(addr);		// write to
		if(idx2 == 0xFFFF) {
			break;
		}
		let idx = bf.getShort(addr + 2);		// write from
		idx <<= 5;
		let addr2 = 0x200000 + idx;
		bf2.position(addr2);

		let to = idx2 * 0x10;
		palData[to] = 0;
		bf2.skip(2);

		for(let i = 0;i < 15;i++) {
			let dt = bf2.getuShort() << 1;
			if(dt > 0x8000) {	// signed because ROM:000809EE    move.w  (a3,d0.w),(a4)+
				dt -= 0x10000;
			}
			let addr3 = 0x214000 + dt;		
			let color = bf.getuShort(addr3);
			palData[i + to + 1] = neo2rgb(color);
		}
		addr += 6;
	}

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


frameAddress = [		// bp 331C get D4
	0x11F222, 0x100000, 0x156D42, 0x1568D6, 0x156902, 0x144E92, 0x10083C, // 0x106670, 0x100040, 0x103BF2, 0x148B5A, 0x16C9DE, 0x16CA2E
	// 0x3F3D, 0x3F3E, 0x36DD, 0x1525, 0x68F, 0x68C, 0x695, 0x692, 0x1B2A, 0x1B2C, 0x1B32, 0x2CBD
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f = 0) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let frame = {
		sprites: [],
	};
	

	// draw by $8544
	// if(f >= 0) {	// use frameAddress and has multiple frames
	// 	addr = bf.getInt(addr - 0x100000 + f * 4);
	// 	addr = bf.getShort(addr - 0x100000 + 4);
	// }
	
	
	bf.position(addr);
	bf.skip(1);
	let flag = bf.get();
	let palette = 2;
	let x = bf.getShort();
	let y = bf.getShort();
	let nx = bf.get();
	let ny = bf.get();
	//let d0 = bf.getuShort();
debugger

	frame.info = '0x'+addr.toString(16).toUpperCase();

	for(let i = 0;i < nx;i++) {
		for(let j = 0;j < ny;j++) {
			let tile = bf.getuShort() + ((flag & 0xF0) << 12);
			let sprite = {
				x: i << 4,
				y: j << 4,
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

var animPlayerAddr = [];

var palmap = [

];

function loadRomFrame() {
	// var bf = new bytebuffer(romFrameData);
	
	// for(let i = 0;i < 21;i++) {
	// 	let addr = bf.getInt(0x120280 + i * 4);
	// 	frameAddress.push(addr);
	// 	// if(palmap[i])
	// 	// 	spritePaletteMap.set(addr, palmap[i]);
	// }
}