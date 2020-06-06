"use strict"

var paletteAddress = 0x6006C;		// per level * scen = 8 * 4
//var paletteAddressIndex1 = 0xA9AE8;	// for sprite, per level * scene = 8 * 10?
//var paletteAddressIndex2 = 0xAA376;	// for scroll layer 1, seems fixed for HUD
//var paletteAddressIndex3 = 0xAAD5A;	// for scroll layer 2
//var paletteAddressIndex4 = 0xAFD92;

// load pal from rom and oveewrite old
function loadRomPal() {
	
	loadRomPalPsi(paletteAddress, 0xA1, 0x26080000, 0x100000);

	if(showPal)
		drawPal();
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = [
	0x6F75A, 0x74C04
];
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation(addr) {
	
}
function loopDrawAnimation(addr, offset) {

}


var mapAddress = 0x115F50;
var map2Address = 0x1923A;	// layer 2 background

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawMap() {
	
}


var map2Data = [
	0x2313E,	0x2315C,	0x2317A,	0x23184,	0x231A2,	0x231B6,	0x231D4,	0x231FC
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
	
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f){

	return frame;
}

