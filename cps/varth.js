"use strict"

var paletteAddress = 0xA8B48;		// per level * scen = 8 * 4
var paletteAddressIndex1 = 0xE8400;	// for sprite, per level * scene = 8 * 10?
var paletteAddressIndex2 = 0xE8600;	// for scroll layer 1, seems fixed for HUD
var paletteAddressIndex3 = 0xEC200;	// for scroll layer 2
var paletteAddressIndex4 = 0xECA00;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	var paletteIndex = paletteAddressIndex1;	// palset = level
	var paletteIndex2 = paletteAddressIndex2 + palset * 512;
	var paletteIndex3 = paletteAddressIndex3;
	var paletteIndex4 = 0xECA00 + (palset << 10);
	var paletteIndex5 = 0xF0600 + (palset << 10);
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2 + ' addr:' + paletteIndex.toString(16).toUpperCase();
	
	// load sprite palette fixed
	bf.position(paletteIndex);
	for(let i = 0;i < 16;i++) {
		loadRomPalCps1(bf, i << 4)
	}

	// load  sprite palette changing
	bf.position(paletteIndex2);
	for(let i = 0;i < 16;i++) {
		loadRomPalCps1(bf, (i << 4) + 16 * 16);
	}
	
	// load 
	bf.position(paletteIndex3);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 16 * 32);
	}
	
	bf.position(paletteIndex4);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 2 * 16 * 32);
	}
	bf.position(paletteIndex5);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 3 * 16 * 32);
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

// show object animation from rom address
function drawAnimation(addr) {

}



var mapAddress = 0x18A86;
var map2Address = 0x1923A;	// layer 2 background

var mapAddressSkip = 0;
let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?

// draw a background with tilemap
function drawMap() {
	
}

var map2Data = [
	0x88564
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
	0x2B220, 0x2B224, 0x2B22A, 0x2B248, 0x2B24E, 0x2B26C,
	0x2B278, 0x2B284, 0x48B46, 0x20B8E, 0x218FE, 0x2249E,
	0x320CA, 0x2310C, 0x232CC, 0x235A4,
	0x2E502, 0x310F6, 0xFE256, 0x4FFE4, 0x4E624, 0xFDEBE, 0x170C0, 0x4E624
];

// get frame from addr. return a frame obj
function getRomFrame(addr, curRomFrame2){

}




