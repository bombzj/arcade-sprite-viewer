"use strict"

var paletteAddress = 0x1C77F0;
var palettebgindex = 0x34FE;		// ROM:00003494    lea     unk_34FE,a0
var palettebg2index = 0x34A6;		// ROM:000033F4    lea     unk_34A6,a0

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);

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
	for(let i = 0;i < 0x10;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}

	if(showPal)
		drawPal();
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = 0x338000;
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
function drawAnimation() {
//	let addr = animAddress[curAnim];
	var bf = new bytebuffer(romFrameData);

	let aaddr = bf.getInt(0x200002 + curAnim * 4);	// animation address
	aaddr = bf.getInt(aaddr + curAnimAct * 4);

	if(!palsetSpr) {
		palsetSpr = bfr.getShort(0x3AFA + curAnim * 4) >> 4;			// ROM:00003658   lea     unk_3AFA,a0
		palset2 = palsetSpr;
	}
	// load character palette
	bf.position(paletteAddress + palsetSpr * 0x200);
	for(let i = 0;i < 0x10;i++) {
		loadRomPalNeo(bf, (i + 0x10 << 4));
	}
	// load character extra palette
	bf.position(paletteAddress + bfr.getShort(0x3C62 + curAnim * 2) * 0x20);
	for(let i = 0;i < 0xA;i++) {		// ROM:000035F4     moveq   #9,d3
		loadRomPalNeo(bf, (i + 0x20 << 4));
	}

	kofdrawAnimation(aaddr, 0x100000, 0x100000);
}


var bgAddress = [
	0xD0A62
];

var bg2Address = 0x1923A;	// layer 2 background

let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawbg() {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
	// let addr = bgAddress[curbg];
	let addr = 0xD87E8 + curbg * 0x10;
	labelInfo.innerText += ' addr:'+addr.toString(16).toUpperCase();
	let bank = unscramble(bfr.getuShort(addr)) - 0x100000;
	addr = bfr.getInt(addr + 2) + bank;

	bf.position(addr);
	let w = bf.getShort();
	let h = bf.getShort();

	labelInfo.innerText += ' '+ w + 'x' + h;
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
	return kofgetRomFrame(addr, f, vflip, hflip, 0x100000);
}

var animPlayerAddr = [];

var palmap = [
	8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,
	27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,
	46,47,48,49,50,51,52,53,54
];

function loadRomFrame() {
	var bf = new bytebuffer(romFrameData);
	
	for(let i = 0;i < 40;i++) {
		let addr = bf.getInt(animAddress + i * 4) + 0x100000;
		frameAddress.push(addr);
		if(palmap[i])
			spritePaletteMap.set(addr, palmap[i] * 2);
	}
	maxPalSet = 500;
}

function unscramble(sel) {
	var bankoffset =
	[
		0x000000, 0x100000, 0x200000, 0x300000, // 00
		0x3f7800, 0x4f7800, 0x3ff800, 0x4ff800, // 04
		0x407800, 0x507800, 0x40f800, 0x50f800, // 08
		0x416800, 0x516800, 0x41d800, 0x51d800, // 12
		0x424000, 0x524000, 0x523800, 0x623800, // 16
		0x526000, 0x626000, 0x528000, 0x628000, // 20
		0x52a000, 0x62a000, 0x52b800, 0x62b800, // 24
		0x52d000, 0x62d000, 0x52e800, 0x62e800, // 28
		0x618000, 0x619000, 0x61a000, 0x61a800, // 32
	];

	// unscramble bank number
	let data =
		(BIT(sel, 15) << 0)+
		(BIT(sel, 14) << 1)+
		(BIT(sel,  7) << 2)+
		(BIT(sel,  3) << 3)+
		(BIT(sel, 10) << 4)+
		(BIT(sel,  5) << 5);

	return -0x100000 + bankoffset[data];
}
function calc(sel) {
	let data =
	(BIT(sel, 15) << 0)+
	(BIT(sel, 14) << 1)+
	(BIT(sel,  7) << 2)+
	(BIT(sel,  3) << 3)+
	(BIT(sel, 10) << 4)+
	(BIT(sel,  5) << 5);
	return data.toString(2) + ' from ' + sel.toString(2);
}

function BIT(sel, n) {
	return (sel >> n) & 1;
}