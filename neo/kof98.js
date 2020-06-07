"use strict"

var paletteAddress = 0x3D77F0;

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

	// load character palette

		bf.position(paletteAddress + palset * 0x400);
		for(let i = 0;i < 32;i++) {
			loadRomPalNeo(bf, (i << 4));
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
	// 0x2DC896, 0x25680E, 0x2536C6, 0x25966A, 0x27FBF6, 0x26B710,
	// 0xB5A82, 0xB6B0A, 0xBDBEC, 0xBDF24, 0xBE25C, 0xBE26A
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let frame = {
		sprites: [],
	};
	

	if(addr < 0x100000) {
		// draw by $8544
		if(f >= 0) {	// use frameAddress and has multiple frames
			let offset = bf.getShort(addr + 2);
	
			addr += offset + 2;
		}
		frame.info = '0x'+addr.toString(16).toUpperCase();
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
		frame.info = 
		bf.position(addr);
		
		let palette = bf.get();
		let func = bf.get();
		frame.info = '0x'+addr.toString(16).toUpperCase() + ',func:' + func.toString(16).toUpperCase() + 
					',pal:' + palette.toString(16).toUpperCase();

		if(func == 0x1 || func == 0x0) {
			// only provide first tile, all tiles are in order, 1 2 3 4 5
			let flag = 0;
			let nx = bf.get();
			let ny = bf.get();
			
			let tile = bf.getInt();
	
		
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x1) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x1) {
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
		} else if(func == 0x8 || func == 0x7) {
			// word per tile, upper bits from header
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			let tmp = bf.get();	// not used?
			let flag = bf.get();
			let tileadd = (flag & 0xF0) << 12;
			if(func == 0x8) {
				bf2.position(bf.position() + nx);
				if(bf2.getr(0) == 0) {	// sometimes extra 0 is there, why?
					bf2.skip();
				}
			} else {
				bf2.position(bf.position() + nx * 2);
			}
			
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x8) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x8) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
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
		} else if(func == 0xA || func == 0x9) {
			// byte per tile, more upper bits from header
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			// let palette = bf.get();
			let flag = bf.getuShort();
			let tileadd = ((flag & 0xF0) << 12) + (flag & 0xFF00);

			if(func == 0xA) {
				bf2.position(bf.position() + nx);
			} else {
				bf2.position(bf.position() + nx * 2);
			}
		
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0xA) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0xA) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;
						
					let tile = bf2.get() + tileadd;
					
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
		} else if(func == 0x6 || func == 0x5) {
	// word per tile, upper bits from header, with different flags
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			// let palette = bf.get();
			// let flag = bf.get();
			// let tileadd = (flag & 0xF0) << 12;

			if(func == 0x6) {
				bf2.position(bf.position() + nx);
				if(bf2.getr(0) == 0) {	// sometimes extra 0 is there, why?
					bf2.skip();
				}
			} else {
				bf2.position(bf.position() + nx * 2);
			}
		
			let cnt = 0;
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x6) {
					fill = bf.get();
				} else {debugger
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x6) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;

					let flag, tile;
					if(cnt++ & 0x1) {
						flag = bf2.get();
						tile = bf2.getuShort();
					} else {
						tile = bf2.getuShort();
						flag = bf2.get();
					}


					let tileadd = (flag & 0xF0) << 12;
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
		} else if(func == 0x2 || func == 0x3) {
			// word per tile without fill mask
			let nx = bf.get();
			let ny = bf.get();
			
			let flag;
			let tileadd;
				
			if(func == 0x3) {
				let tmp  = bf.get();		// unused?
				flag = bf.get();
				tileadd = (flag & 0xF0) << 12;
			}

			let cnt = 0;
			for(let i = 0;i < nx;i++) {

				for(let j = 0;j < ny;j++) {
					let tile;
					if(func == 0x2) {
						if(cnt++ & 0x1) {
							flag = bf.get();
							tile = bf.getuShort();
						} else {
							tile = bf.getuShort();
							flag = bf.get();
						}

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

		}		

	}

	return frame;
}

var animPlayerAddr = [];

var palmap = [
	8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
	50,52,54,56,58,60,62,64,66,
	68,70,72,74,76,78,80
];

function loadRomFrame() {
	var bf = new bytebuffer(romFrameData);
	
	for(let i = 0;i < 44;i++) {
		let addr = bf.getInt(0x240000 + i * 4);
		frameAddress.push(addr);
		if(palmap[i])
			spritePaletteMap.set(addr, palmap[i]);
	}
	maxPalSet = 500;
}