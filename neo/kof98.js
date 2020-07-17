"use strict"

var paletteAddress = 0x3D77F0;
var palettebgindex = 0x47D8;		// ROM:00004720    lea     unk_47D8,a0
var palettebg2index = 0x4788;		// ROM:0000467E    lea     unk_4788,a0
// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = getrdbuf();

	// load basic palette
	bf.position(paletteAddress);
	for(let i = 0;i < 0x10;i++) {
		loadRomPalNeo(bf, (i << 4));
	}

	// load background palette
	var bf2 = getrdbuf(palettebgindex + palset * 8);
	let offset = bf2.getShort();
	let start = bf2.getShort();
	let cnt = bf2.getShort() + 1;
	bf.position(paletteAddress + (offset << 5));
	for(let i = 0;i < cnt;i++) {
		loadRomPalNeo(bf, (i + start) << 4);
	}

	// load background palette
	bf2.position(palettebg2index + palset * 8);
	offset = bf2.getShort();
	start = bf2.getShort();
	cnt = bf2.getShort() + 1;
	bf.position(paletteAddress + (offset << 5));
	for(let i = 0;i < cnt;i++) {
		loadRomPalNeo(bf, (i + start) << 4);
	}

	// load character palette
	bf.position(paletteAddress + palset2 * 0x200);
	for(let i = 0;i < 0x20;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}

	if(showPal)
		drawPal();
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = 0x240000;
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation() {
//	let addr = animAddress[curAnim];
	var bf = getrdbuf();

	let aaddr = bf.getInt(0x300002 + curAnim * 4) + 0x100000;	// animation address
	aaddr = bf.getInt(aaddr + curAnimAct * 4);

	if(!palsetSpr) {
		palsetSpr = palmap[curAnim] * 2;
		palset2 = palsetSpr;
	}
	// load character palette
	bf.position(paletteAddress + palsetSpr * 0x200);
	for(let i = 0;i < 0x20;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}
	animVars.offx = 128;
	animVars.offy = 160;
	animVars.cbs = [];
	loopDrawAnimation(aaddr + 0x100000, 0);
}

var animVars = {};
var typecolor = ['red',	// attack
		 'green',	// head
		 'orange',	// body	
		  'blue'
		];

function loopDrawAnimation(base, addr) {
	animTimer = null;
	
	var bf = getrdbuf(addr);
	let cbs = animVars.cbs;
	let newx, newy;
	for(let i = 0;i < 10;i++) {
		let flag = bf.gets(base + addr);
		if(flag >= 0) {
			break;
		}
		flag = -flag - 1;
		if(flag == 0) {
			addr = 0;
			continue;
		} else if(flag == 1) {
			addr -= 6;
			continue;
		} else if(flag == 2) {	// hitbox & effect
			bf.position(base + addr + 1);
			let effect = bf.get();
			let type = effect & 0x3;
			effect >>= 2;
			let x = bf.gets();
			let y = bf.gets();
			let x2 = bf.gets();
			let y2 = bf.gets();
			cbs[type] = {
				x	:	x,
				y	:	y,
				x2	:	x2,
				y2	:	y2,
				type : type,
				effect : effect
			};
		} else if(flag == 3) {

		} else if(flag == 4) {	// move delta x y
			animVars.offx += bf.getShort(base + addr + 2);
			// animVars.offy += bf.getShort(base + addr + 4);		
		} else if(flag == 5) {	// new object
			bf.position(base + addr + 1);
			let obj = bf.get();
			newx = bf.getShort() + animVars.offx;
			newy = bf.getShort() + animVars.offx;

		} else {

		}
		addr += 6;
	}
	let lapse = bf.gets(base + addr) + 1;
	let stepframe = bf.getuShort(base + addr + 2);

	let paddr = bf.getInt(0x200002 + curAnim * 4);	// position info & pointer to image
	bf.position(paddr + stepframe * 6);

	let x = bf.getShort();
	let y = bf.getShort();
	let af = bf.getShort();		// sprite offset

	let addr2 = bf.getInt(animAddress + curAnim * 4);

	let frame = getRomFrame(addr2, af & 0x3FF);		// 613E       andi.w  #$3FF,d6
	if(!frame) {
		return;
	}
	
	labelInfo.innerText = 'anim:' + (base + addr).toString(16).toUpperCase();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let offx = animVars.offx;
	let offy = animVars.offy;
	drawRomFrameBase(frame, undefined, offx + x, offy + y);

	if(showCB) {
		// draw collision box
		for(let c of cbs) {
			if(c) {
				ctx.strokeStyle = typecolor[c.type];
				ctx.strokeRect(c.x + offx - c.x2, c.y + offy - c.y2, c.x2 * 2, c.y2 * 2);
			}
		}
		if(newx) {
			ctx.strokeStyle = 'red';
			ctx.beginPath();
			ctx.moveTo(newx - 30, newy);
			ctx.lineTo(newx + 30, newy);
			ctx.moveTo(newx, newy - 30);
			ctx.lineTo(newx, newy + 30);
			ctx.stroke();
		}
	}


	addr += 6;

	animTimer = setTimeout("loopDrawAnimation("+ base +"," + addr +")", 20 * lapse);
}


var bgAddress = [
	0xBBF66, 0xBCB6E, 0xBD776, 0xBDD06, 0xBDE4E, 0xBDC3E, 0xBDF96, 0xBEB9E, 0xBEC26,
	0xBFCE6, 0xBF0DE, 0xC08EE, 0xC44F6, 0xC80FE, 0xC8906, 0xCC50E,
	0xCCD16, 0xCD91E, 
	0xCF576, 0xCE96E, 0xD017E, 
	0xD156A, 0xD2172, 0xD2D7A, 0xD3982, 0xD458A,
	0xD4C92, 0xD589A, 0xD6F72, 0xD64A2, 0xD6EAA,
	0xDAB12, 0xD9D8A, 0xDB71A,
	0xDBFA2, 0xDCBAA, 0xDD7B2, 0xDE3BA, 0xDEC42,
	0xDF4CA, 0xE00D2, 0xE06DA,

	0xB3CDE,
];
maxbg = bgAddress.length;
var bg2Address = 0x1923A;	// layer 2 background

let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawbg() {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
	let addr = bgAddress[curbg];

	bf.position(addr);
	let w = bf.getShort();
	let h = bf.getShort();

	labelInfo.innerText += ' '+ w + 'x' + h + ' addr:'+addr.toString(16).toUpperCase();

	drawbgbasemslug(bf.position() + 4, w, h);
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
	// 0x2DC896, 0x25680E, 0x2536C6, 0x25966A, 0x27FBF6, 0x26B710,
	// 0xB5A82, 0xB6B0A, 0xBDBEC, 0xBDF24, 0xBE25C, 0xBE26A
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f) {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
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
	var bf = getrdbuf();
	
	for(let i = 0;i < 44;i++) {
		let addr = bf.getInt(animAddress + i * 4);
		frameAddress.push(addr);
		if(palmap[i])
			spritePaletteMap.set(addr, palmap[i] * 2);
	}
	maxPalSet = 500;
}