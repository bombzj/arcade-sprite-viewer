"use strict"

var paletteAddress = 0x3CFFF0;
var palettebgindex = 0x4412;		// ROM:0000435A    lea     unk_4412,a0
var palettebg2index = 0x43C2;		// ROM:0000429C    lea     unk_43C2,a0

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

var animAddress = 0x250000;
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

	var bf = new getrdbuf(addr);
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
			let newx = bf.getShort();
			let newy = bf.getShort();
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
	let af = bf.getuShort();		// sprite offset
	let vflip = af & 0x4000;
	let hflip = af & 0x8000;

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

	animTimer = setTimeout("loopDrawAnimation("+ base +"," + addr+")", 20 * lapse);
}


var bgAddress = [
	0xB3662, 0xB2A5A, 0xB426A, 0xB4B72, 0xB537A,
	0xB8968, 0xB9E78, 0xB9570, 0xBA780,
	0xBB2D8, 0xBBEE0, 0xBCAE8,
	0xBE5BA, 0xBF1C2, 0xBFC8A, 0xC0752, 0xC121A, 0xC1CE2, 0xC27AA, 0xC3272, ,0xC3D3A,
	0xC468A, 0xC5292, 0xC5E9A,
	0xC6B2A, 0xC67A2, 0xC7732,
	0xC85D2, 0xC91DA, 0xC9DE2, 0xCA76A, 0xCAE72,
	0xD1F70, 0xD2B78, 0xD3780, 0xD4388
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
function getRomFrame(addr, f, vflip = false, hflip = false) {
	return kofgetRomFrame(addr, f, vflip, hflip);
}

var animPlayerAddr = [];

var palmap = [
	8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
	56,58,60,50,52,54,62,64,66,
	68
];

function loadRomFrame() {
	var bf = getrdbuf();
	
	for(let i = 0;i < 36;i++) {		//36 characters
		let addr = bf.getInt(animAddress + i * 4);
		frameAddress.push(addr);

		if(palmap[i])
			spritePaletteMap.set(addr, palmap[i] * 2);
	}
	maxPalSet = 500;
}