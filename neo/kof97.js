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
	0x2DC896, 0x25680E, 0x2536C6, 0x25966A, 0x27FBF6, 0x26B710,
	0xB5A82, 0xB6B0A, 0xBDBEC, 0xBDF24, 0xBE25C, 0xBE26A
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f = 0) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let frame = {
		sprites: [],
	};
	frame.info = '0x'+addr.toString(16).toUpperCase();

	if(addr < 0x100000) {
		// draw by $8544
		if(f >= 0) {	// use frameAddress and has multiple frames
			let offset = bf.getShort(addr + 2);
	
			addr += offset + 2;
		}
	
		bf.position(addr);
		
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
				tile += (flag & 0xF0) << 12;	// more bits for tile number
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


	} else {
		// draw by 6022
		if(f >= 0) {	// use frameAddress and has multiple frames
			addr = bf.getInt(addr + f * 4);
		}
	
		bf.position(addr);
		
		let palette = bf.get();
		let func = bf.get();
		frame.info += ',func:' + func.toString(16).toUpperCase();

		if(func == 0x1) {
			// only provide first tile, all tiles are in order, 1 2 3 4 5
			let flag = 0;
			let nx = bf.get();
			let ny = bf.get();
			
			let tile = bf.getInt();
	
		
			for(let i = 0;i < nx;i++) {
				let fill = bf.get();		// in this column, which row need fill (per bit), which means max 8
				for(let j = 0;j < ny;j++) {
					if((fill & (0x80 >>> j)) == 0)		
						continue;
					// let tile = bf2.getuShort();
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: i << 4,
						y: j << 4,
						tile: tile++,
						nx: 1,
						ny: 1,
						vflip: flag & 0x2,	// this tile need flip
						hflip: flag & 0x1,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}
		} else if(func == 0x8) {

			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			let palette = bf.get();
			let flag = bf.get();
			let tileadd = (flag & 0xF0) << 12;

			bf2.position(bf.position() + nx);
		
			for(let i = 0;i < nx;i++) {
				let fill = bf.get();		// in this column, which row need fill (per bit), which means max 8
				for(let j = 0;j < ny;j++) {debugger
					if((fill & (0x80 >>> j)) == 0)		
						continue;
					let tile = bf2.getuShort() + tileadd;
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
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
