"use strict"

var paletteAddress = 0x114000;	// all palettes are here
var paletteAddress2 = 0x116400;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	// load1
	bf.position(paletteAddress);
	for(let i = 0;i < 16;i++) {
		loadRomPalNeo(bf, (i << 4));
	}

	bf.position(paletteAddress2);
	for(let i = 0;i < 0x40 * 2 + 0x30;i++) {
		loadRomPalNeo(bf, (i << 4) + 0x400/2);
	}

	// load2
	let addr3 = bf.getInt(0xFC58 + palset * 4);
	bf.position(addr3 - 0x100000);
	for(let i = 0;i < 0x30;i++) {
		loadRomPalNeo(bf, (i << 4) + 0x1A00/2);
	}

	// load3, 2 characters?
	let addr4 = bf.getInt(0xFD10 + palset * 4);
	bf.position(addr4 - 0x100000);
	for(let i = 0;i < 0x8;i++) {
		loadRomPalNeo(bf, (i << 4) + 0x200/2);
	}
	bf.position(addr4 - 0x100000);
	for(let i = 0;i < 0x8;i++) {
		loadRomPalNeo(bf, (i << 4) + 0x300/2);
	}

	// load character palette

		// bf.position(paletteAddress2 + palset * 0x400);
		// for(let i = 0;i < 32;i++) {
		// 	loadRomPalNeo(bf, (i << 4));
		// }
	
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


frameAddress = [		// bp 331C get D4
	// 0x3F3D, 0x3F3E, 0x36DD, 0x1525, 0x68F, 0x695, 0x1B2A, 0x1B32, 0x2CBD
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let frame = {
		sprites: [],
	};
	

	// draw by $8544
	if(f >= 0) {	// use frameAddress and has multiple frames
		addr = bf.getInt(addr - 0x100000 + f * 4);
		addr = bf.getShort(addr - 0x100000 + 4);
	}
	
	
	bf.position(addr * 4 + 0x72000);
	let d0 = bf.getuShort();

	let addr2 = bf.getuShort() + ((d0 & 0x7) << 16);
	addr2 = addr2 * 2 + 0x82004;

	d0 >>= 2;
	let d4 = d0 & 0x3C00;
	let func = d4 >> 8;

	frame.info = '0x'+addr2.toString(16).toUpperCase() + ',func:' + func.toString(16).toUpperCase();

	d0 &= 0x3FE;
	let ny = bf.get(0x4164 + d0);
	let nx = bf.get(0x4165 + d0);

	bf.position(addr2);
	if(func == 0x18 || func == 0x3C) {
		// only provide first tile, with fill mask
		let palette = bf.get();
		let flag = bf.get();
		
		let tile = bf.getuShort() + ((flag & 0xF0) << 12);

	
		for(let i = 0;i < nx;i++) {
			let fill;			// in this column, which row need fill (per bit), which means max 8
			if(func == 0x18) {
				fill = bf.get();
			} else {
				fill = bf.getuShort();
			}

			for(let j = 0;j < ny;j++) {
				let mask;
				if(func == 0x18) {
					mask = 0x80 >>> j;
				} else {
					mask = 0x8000 >>> j;
				}

				if((fill & mask) == 0)		
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
	
	} else if(func == 0x0 || func == 0x14 || func == 0x4 || func == 0x8 || func == 0xC) {
		// without fill mask
		
		let flag;
		let tileadd;
		let palette;
		if(func == 0x4) {
			palette = bf.get();		// unused?
			flag = bf.get();
			tileadd = (flag & 0xF0) << 12;
		} else if(func == 0x8) {
			palette = bf.get();
			tileadd = bf.get() << 8;
		} else if(func == 0xC) {
			palette = bf.get();
			flag = bf.get();
			tileadd = (bf.get() << 8) + ((flag & 0xF0) << 12);
		} else if(func == 0x0) {

		}

		for(let i = 0;i < nx;i++) {

			for(let j = 0;j < ny;j++) {
				let tile;
				if(func == 0x14) {
					if(cnt++ & 0x1) {
						flag = bf.get();
						tile = bf.getuShort();
					} else {
						tile = bf.getuShort();
						flag = bf.get();
					}

					tileadd = (flag & 0xF0) << 12;
				} else if(func == 0x8 || func == 0xC) {
					tile = bf.get();
				} else if(func == 0x0) {
					tile = bf.getuShort();
					palette = bf.get();
					flag = bf.get();
					tileadd = (flag & 0xF0) << 12;
				} else {
					tile = bf.getuShort();
				}

				
				tile += tileadd;
				
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

	} else {
		labelInfo.innerText = frame.info + ' unsupported'
		return;
	}


	return frame;
}

var animPlayerAddr = [];

var palmap = [
	8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
	56,58,60,50,52,54,62,64,66,
	68
];

function loadRomFrame() {
	var bf = new bytebuffer(romFrameData);
	
	for(let i = 0;i < 21;i++) {
		let addr = bf.getInt(0x120280 + i * 4);
		frameAddress.push(addr);
		// if(palmap[i])
		// 	spritePaletteMap.set(addr, palmap[i]);
	}
	maxPalSet = 500;
}