"use strict"

var paletteAddress = 0x486B62;	

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);

	// load basic palette
	bf.position(paletteAddress);
	for(let i = 0;i < 0x10;i++) {
		loadRomPalNeo(bf, (i << 4));
	}
	// kofloadpal(0xB21E2);
	let addr = bfr.getShort(0xB20F8 + palset * 0x10) + 0xB20F8;
	kofloadpal(addr);

	// load background palette
	kofloadpal2(0xB15AA + (palset << 6));

	// load ??? palette
	kofloadpal2(0xB17EA + palset * 8);	// ROM:0000330E                 lea     (unk_B17EA).l,a0

	kofloadpal2(0xB1842);	// ROM:00003322                 lea     (unk_B1842).l,a0

	addr = bfr.getShort(0xB2018 + palset * 0x10) + 0xB2018;
	kofloadpal2(addr);	// ROM:000032F0                 lea     (unk_B2018).l,a0

	// // load character palette
	bf.position(paletteAddress + palset2 * 0x200);
	for(let i = 0;i < 0x20;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}

	if(showPal)
		drawPal();
}

function kofloadpal(addr) {
	var bf = getrdbuf();
	var bf2 = getrdbuf(addr);
	for(let p = 0;p < 0x100;p++) {
		let from = bf2.getShort();
		if(from == -1) {
			break;
		}
		let to = bf2.getShort();
		bf.position(paletteAddress + (from << 5));
		loadRomPalNeo(bf, to << 4);
	}
}

function kofloadpal2(addr) {
	let bf = getrdbuf();
	let bf2 = getrdbuf(addr);
	let offset = bf2.getShort();
	let start = bf2.getShort();
	let cnt = bf2.getShort() + 1;
	bf.position(paletteAddress + (offset << 5));
	for(let i = 0;i < cnt;i++) {
		loadRomPalNeo(bf, (i + start) << 4);
	}
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = 0x200002;
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation() {
//	let addr = animAddress[curAnim];
	var bf = new bytebuffer(romFrameData);

	let aaddr = bf.getInt(0x200002 + curAnim * 4 + 0x100000) + 0x100000;	// animation address
	aaddr = bf.getInt(aaddr + curAnimAct * 4) + 0x100000;

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
	loopDrawAnimation(aaddr, 0);
}

var animVars = {};
var typecolor = ['red',	// attack
		 'green',	// head
		 'orange',	// body	
		  'blue'
		];

function loopDrawAnimation(base, addr) {
	animTimer = null;

	var bf = new bytebuffer(romFrameData, addr);
	let cbs = animVars.cbs;
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
			return;	// stop animation
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
			let newx = bf.getShort();
			let newy = bf.getShort();
		} else {

		}
		addr += 6;
	}
	let lapse = bf.gets(base + addr) + 1;
	let stepframe = bf.getuShort(base + addr + 2);

	let paddr = bf.getInt(0x200002 + curAnim * 4 + 0x200000) + 0x200000;	// position info & pointer to image
	bf.position(paddr + stepframe * 6);

	let x = bf.getShort();
	let y = bf.getShort();
	let af = bf.getuShort();		// sprite offset
	let vflip = af & 0x4000;
	let hflip = af & 0x8000;
	let two = af & 0x2000;	// this frame has more than one sprite.

	let addr2 = bf.getInt(animAddress + curAnim * 4);

	labelInfo.innerText = 'anim:' + (base + addr).toString(16).toUpperCase() + ' f:' + af.toString(16).toUpperCase();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let frame = getRomFrame(addr2, af & 0x3FF, vflip, hflip);
	if(!frame) {
		return;
	}
	
	let offx = animVars.offx;
	let offy = animVars.offy;
	drawRomFrameBase(frame, undefined, offx + x, offy + y);

	while(two) {
		let x = bf.getShort();
		let y = bf.getShort();
		let af = bf.getuShort();		// sprite offset
		let vflip = af & 0x4000;
		let hflip = af & 0x8000;
		two = af & 0x2000;
	
		let addr2 = bf.getInt(animAddress + curAnim * 4);
	
		let frame = getRomFrame(addr2, af & 0x3FF, vflip, hflip);		// ROM:0000613E   andi.w  #$3FF,d6
		if(frame) {
			drawRomFrameBase(frame, undefined, offx + x, offy + y);
		}
	}

	if(showCB) {
		// draw collision box
		for(let c of cbs) {
			if(c) {
				ctx.strokeStyle = typecolor[c.type];
				ctx.strokeRect(c.x + offx - c.x2, c.y + offy - c.y2, c.x2 * 2, c.y2 * 2);
			}
		}
	}
	addr += 6;

	animTimer = setTimeout("loopDrawAnimation("+ base +"," + addr +")", 20 * lapse);
}


var bgAddress = [
	0x2BF750, 0x2C0358, 0x2C0F60, 0x2C1B68, 0x2C2110, 0x2C26B8,
	0x2C2C60, 0x2C5078, 0x2C3868, 0x2C5900,
	0x2C7154, 0x2C956C, 
	0x2CB5F0, 0x2CCE00,
	0x2CDE40, 0x2CEA48, 0x2CEFA0,
	0x2CF128, 0x2D1540,
	0x2D1FE4, 0x2D2BEC, 0x2D38F4,
	0x2D4EE8, 0x2D57F0,
	0x2D6660, 0x2D7268,
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
	let addr = bgAddress[curbg] - 0x100000;

	bf.position(addr);
	let w = bf.getShort();
	let h = bf.getShort();

	labelInfo.innerText += ' '+ w + 'x' + h + ' addr:'+addr.toString(16).toUpperCase();
	if(w > 0x50 || h > 0x30) {
		debugger;
		return;
	}
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
function getRomFrame(addr, f, vflip = false, hflip = false) {
	return kofgetRomFrame(addr, f, vflip, hflip);
}

var animPlayerAddr = [];

var palmap = [
	8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
	42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,
	72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,
];

function loadRomFrame() {
	var bf = new bytebuffer(romFrameData);
	
	for(let i = 0;i < 42;i++) {
		let addr = bf.getInt(animAddress + i * 4);
		frameAddress.push(addr);
		if(palmap[i])
			spritePaletteMap.set(addr, palmap[i] * 2);
	}
	maxPalSet = 500;
}
