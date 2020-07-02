"use strict"

var palsetAddress = [
];

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = getrdbuf();

	mslugPalette(0xE7B58);		// ROM:000046CE
	mslugPalette(0xE7BDA);		// ROM:0000470E
	let addr = palsetAddress[palset];
	if(typeof addr !== 'number') {
		for(let addr2 of addr) {
			mslugPalette(addr2);
		}
	} else {
		mslugPalette(addr);
	}
	

	palette_empty = paletted_start;	// dynamic palette

	// mslugPalette2(0x8A9);
	// mslugPalette2(0x8AB);

	// var playerPalette = 0x90E54;

	// mslugPalette2(bf.getuShort(playerPalette));
	// mslugPalette2(bf.getuShort(playerPalette + 2));
	// mslugPalette2(bf.getuShort(playerPalette + 4));
	// mslugPalette2(bf.getuShort(playerPalette + 6));

	// mslugPalette2(0x125);
	// mslugPalette2(0x3BE);

	// mslugPalette2(0x7A);
	// mslugPalette2(0x7C);
	// mslugPalette2(0x7E);
	// mslugPalette2(0x80);

	// mslugPalette2(0x38D);
	// mslugPalette2(0x3AA);
	// mslugPalette2(0x200);
	
	if(showPal)
		drawPal();
}

function mslugPalette(addr) {
	for(let p = 0;p < 0x100;p++) {
		let idx2 = bfr.getuShort(addr);		// write to
		if(idx2 == 0xFFFF) {
			break;
		}
		let idx = bfr.getShort(addr + 2);

		mslugPaletteBase(idx, idx2 * 0x10)

		addr += 6;
	}
}

var paletted_start = 0x70
var palette_empty;
// palette not fixed in position
function mslugPalette2(addr) {
	mslugPaletteBase(addr, palette_empty * 0x10)
	palette_empty++;
}

function mslugPaletteBase(idx, to) {
	var bf2 = getrdbuf();

	idx <<= 5;
	let addr2 = 0x12BD12 + idx;
	bf2.position(addr2);

	palData[to] = 0;
	bf2.skip(2);

	for(let i = 0;i < 15;i++) {
		let dt = bf2.getuShort() << 1;
		if(dt > 0x8000) {	// signed because ROM:000809EE    move.w  (a3,d0.w),(a4)+
			dt -= 0x10000;
		}
		let addr3 = 0x15CB52 + dt;		
		let color = bfr.getuShort(addr3);
		palData[i + to + 1] = neo2rgb(color);
	}
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = [
	[0x3D69A6,0x9D0], [0x37B9C6,0x9D0], 0x3968C0, [0x396D10,0x38D], [0x396DE0,0x38D], 0x396E64, 0x396ECA, 0x3c6164,
];
var curAnim;	// cur	rent animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation(addr) {
	animCB = null;
//	let addr = animAddress[curAnim];
	var bf = getrdbuf();
	if(!addr) {
		addr = animAddress[curAnim];
		if(typeof addr !== 'number') {
			animCB = addr[2];
			if(palsetSpr) {
				mslugPaletteBase(palsetSpr, paletted_start * 0x10);
			} else {
				mslugPaletteBase(addr[1], paletted_start * 0x10);
				palsetSpr = addr[1];
			}
			addr = addr[0];
		}
	}
	if(animTimer) {
		clearTimeout(animTimer)
		animTimer = null;
	}

	let addr2 = (addr & 0x7FFFFF) >> 16;
	let offset = addr & 0xFFFF;


	addr2 = (addr2 << 3) + 0x1002;
	let page = bf.getuShort(addr2);
	let poffset = unscramble(page);
	addr = bf.getInt(addr2 + 2) + poffset + offset;
	

	loopDrawAnimation(addr);
}
var animCB;	// for cb saving in animation
function loopDrawAnimation(addr, offset = 0xA) {
	animTimer = null;

	var bf = new bytebuffer(romFrameData, addr);

	for(let i = 0;i < 10;i++) {
		let animfunc = bf.get();
		if(animfunc == 4) {
			break;
		} else if(animfunc == 0x10) {	// has more to do but...
			bf.skip(3);
		} else if(animfunc == 0x20) {	// has more to do but...
			let prop = bf.get();
			let data = bf.getInt();
			if(prop == 0x50) {
				// change collision box
				animCB = data;
			}
		} else if(animfunc == 0x0) {
			bf.skip(7);
		} else if(animfunc == 0x18 || animfunc == 0x1C) {
			bf.skip(3);
		} else {
			labelInfo.innerText = 'unsupport: anim:' + (addr).toString(16).toUpperCase() + ' func:' + animfunc.toString(16).toUpperCase();
			return;
		}
	}
	let tmp = bf.get();
	tmp = bf.get();
	tmp = bf.get();
	let addr2 = bf.getInt();
	let frame = getRomFrame(addr2);
	if(animCB) {
		frame.cb1 = getCB(animCB);
	}
	if(!frame) {
		return;
	}
	labelInfo.innerText = 'anim:' + (addr).toString(16).toUpperCase();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRomFrameBase(frame);
	addr += offset;

	animTimer = setTimeout("loopDrawAnimation("+ addr +"," + offset+")", 200);
}
function getCB(addr) {
	if(!addr) {
		return null;
	}
	var bf = new bytebuffer(romFrameData, addr);
	return {
		x : bf.getShort(),
		y : bf.getShort(),
		x2 : bf.getShort(),
		y2 : bf.getShort(),
	}
}

function drawAnimationFrame(addr, c = ctx, offx = 128, offy = 160, cbbase = 0x103000) {

}


var bgAddress = [
];

let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap

var autoAnim = 0;

function drawbg() {
	palset = curbg;
	loadRomPal();

	var bf = getrdbuf();
	var bf2 = getrdbuf();
	let addr = bgAddress[curbg] + bgScene * 12;	// bgAddressSkip

	// ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	let countdown = bgScene;
	let addr2, offset, w, h, saveaddr;	// save addr for display
	let nextbg;	// next background in the same scene
	bf.position(addr);
	for(let j = 0;j < 10;j++) {
		let func = bf.getShort();
		if(func == 0) {
			let tmp1 = bf.getShort();
			nextbg = bf.getShort();
		} else if(func == 0x4) {
			saveaddr = bf.position();
			addr2 = bf.getShort();
			offset = bf.getuShort();
			w = bf.getShort();
			h = bf.getShort();
			let tmp1 = bf.getInt();
			if(addr2 == 0) {		// skip this
				continue;
			}
			if(--countdown < 0) {
				break;	// found a background
			}
		} else {
			labelInfo.innerText += ' bg not found';
			return;
		}
	}

	addr2 <<= 2;
	addr2 += 0x200008;	// ROM:00018440                 movea.l ($200004).l,a2
	let addr3 = bfr.getInt(addr2) + 4;

	if(h > 0x100) {	// too 
		debugger;
		return;
	}

	labelInfo.innerText += ' height:'+h+' addr:' + saveaddr.toString(16).toUpperCase();

	bf2.position(addr3);
	bf2.skip(4 * h * bgAddressSkip);

	let imax = Math.min(w - bgAddressSkip, 34);
	for(let i = 0;i < imax;i++) {
		for(let j = 0;j < h;j++) {
			let tile = bf2.getuShort();
			let pal = bf2.get();
			let flag = bf2.get();
			tile += (flag & 0xF0) << 12;
			let a8 = flag & 0b1000;	// 8 frame auto animation
			let a4 = flag & 0b0100;	// 4 frame auto animation
			if(a8) {
				tile += (autoAnim & 0x7);
			} else if(a4) {
				tile += (autoAnim & 0x3);
			}
			drawTilesBase(imageData, tile, 1, 1, pal, 16, false, (flag & 0x2), (flag & 0x1), false);

			ctxBack.putImageData(imageData, i * gridHeight, j * gridWidth - bgAddressSkipY * 32);
		}
	}

	autoAnim++;
}

function setMapTileStart(bgstart) {
	bgScene = bgstart;
	refresh();
}


frameAddress = [		// bp 331C get D4
	0x33C34, 0x33CEA, 0x33D96, 0x33E6A,
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f) {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
	let frame = {
		sprites: [],
	};
	
	let addr2, offset;
	if(f >= 0) {
		bf.position(addr + f * 10);
		addr2 = bf.getShort();
		offset = bf.getuShort();	// memory page
	} else {
		addr2 = (addr & 0x7FFFFF) >> 16;
		offset = addr & 0xFFFF;
	}

	addr2 = (addr2 << 3) + 0x1002;
	let page = bf.getuShort(addr2);
	let poffset = unscramble(page);
	addr = bf.getInt(addr2 + 2) + poffset + offset;


	frame.info = '0x'+addr.toString(16).toUpperCase();

	bf.position(addr);
	let cnt = bf.get();	// sprite count
	if(cnt > 0x10) {
		debugger;
		return;
	}
	let flag = bf.get();
	let palette = paletted_start;

	for(let c = 0;c < cnt;c++) {
		
		let x = bf.getShort();
		let y = -bf.getShort();
		let nx = bf.get();
		let ny = bf.get();
		//let d0 = bf.getuShort();
	
		for(let i = 0;i < nx;i++) {
			for(let j = 0;j < ny;j++) {
				let tile = bf.getuShort() + ((flag & 0xF0) << 12);
				let sprite = {
					x: (i << 4) + x,
					y: (j << 4) + y,
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

	return frame;
}

var animPlayerAddr = [];

var palmap = [

];

var levelAddress = 0x474F4;	// all level data begin here
function loadRomFrame() {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
	
	// for(let i = 0;i < 21;i++) {
	// 	let addr = bf.getInt(0x120280 + i * 4);
	// 	frameAddress.push(addr);
	// 	// if(palmap[i])
	// 	// 	spritePaletteMap.set(addr, palmap[i]);
	// }

	// load level data to palette and map
	// palsetAddress = [];
	// bgAddress = [];
	for(let s = 0;s < 5;s++) {
		let sceneAddr = bf.getInt(levelAddress + s * 4);	// all scenes are linked together
		bf.position(sceneAddr + 2);
		for(let i = 0;i < 100;i++) {
			let offset = bf.getShort();
			if(offset == 0) {
				break;
			}
			let nextScene = bf.position() + offset;
			let funcScene = bf.get();
			bf.skip();
	
			let dataaddr = bf.getInt();
			bf2.position(dataaddr);
	
			let palette = [];
			for(let j = 0;j < 100;j++) {
				let func = bf2.getShort();
				if(func == -1) {
					break;
				} else if(func == 0x28) {		// end of level data?
					let status = bf2.getShort();
					if(status > 0) {
						break;
					}
				} else if(func == 0x2C) {
					let status = bf2.getShort();
					if(status > 0) {
						break;
					}
					bf2.skip(4);
				} else if(func == 0x4) {
					let pa = bf2.getShort() * 4 + 0x2003D0 - 0x100000;
					palette.push(bfr.getInt(pa) - 0x100000);
				} else if(func == 0x24) {
					let x = bf2.getShort();
					let bg = bf2.getInt();
					palsetAddress.push(palette);
					bgAddress.push(bg);
				} else if(func == 0x34 || func == 0x40 || func == 0x3C || func == 0x48 || func == 0x20) {
					bf2.skip(2);
				} else if(func == 0x14 || func == 0x18) {
					bf2.skip(6);
				} else if(func == 0x0 || func == 0x30 || func == 0x38) {
					bf2.skip(8);
				} else if(func == 0x8 || func == 0x10 || func == 0x4C || func == 0x44 || func == 0xC || func == 0x1C) {
					bf2.skip(4);
				} else {
					console.log('unknown func 0x' + func.toString(16).toUpperCase() + ' at ' +
						(bf2.position()-2).toString(16).toUpperCase());
					//debugger
					break;
				}
			}
	
			bf.position(nextScene);
		}
	}
	console.log('background loaded: ' + bgAddress.length);
	maxbg = bgAddress.length;
}
