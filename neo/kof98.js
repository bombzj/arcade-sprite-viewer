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
		palsetSpr = bfr.getShort(0x4A1A + curAnim * 8) >> 4;		// ROM:0000496A   lea     unk_4A1A,a0
		palset2 = palsetSpr;
	}
	// load character palette
	bf.position(paletteAddress + palsetSpr * 0x200);
	for(let i = 0;i < 0x10;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}
	// load character extra palette
	bf.position(paletteAddress + bfr.getShort(0x4B6A + curAnim * 2) * 0x20);
	for(let i = 0;i < 0x10;i++) {		// ROM:000035F4     moveq   #9,d3
		loadRomPalNeo(bf, (i + 0x20 << 4));
	}
	if(showPal)
		drawPal();

	kofdrawAnimation(aaddr + 0x100000);
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
function getRomFrame(addr, f, vflip = false, hflip = false) {
	return kofgetRomFrame(addr, f, vflip, hflip);
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