"use strict"

var paletteAddress = 0xA8B48;		// per level * scen = 8 * 4
var paletteAddressIndex1 = 0xA9AE8;	// for sprite, per level * scene = 8 * 10?
var paletteAddressIndex2 = 0xAA376;	// for scroll layer 1, seems fixed for HUD
var paletteAddressIndex3 = 0xAAD5A;	// for scroll layer 2
var paletteAddressIndex4 = 0xAFD92;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	var paletteIndex = bf.getShort(paletteAddressIndex1 + palset * 2) + paletteAddressIndex1;	// palset = level
	var paletteIndex2 = paletteAddressIndex2;
	var paletteIndex3 = bf.getShort(paletteAddressIndex3 + palset * 2) + paletteAddressIndex3;
	var paletteIndex4 = bf.getShort(paletteAddressIndex4 + palset * 2) + paletteAddressIndex4;
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2 + ' addr:' + paletteIndex.toString(16).toUpperCase();
	
	// load sprite palette
	bf.position(paletteIndex);
	for(let i = 0;i < 32;i++) {
		let p = bf.getShort();
		bf2.position(paletteAddress + p * 32);
		loadRomPalCps1(bf2, (i << 4));
		
	}

	// load layer 2 & 3 palette
	bf.position(paletteAddressIndex2);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 1 * 16 * 32);
	}
	
	// load layer 2 & 3 palette
	bf.position(paletteIndex3);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 2 * 16 * 32);
	}
	
	bf.position(paletteIndex4);
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

var playerCB = [	// collision boxes groups for 4 players
	0x100000,0x100C00,0x101800,0x102400
];


var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation(addr) {
}
function loopDrawAnimation(addr, offset) {

}

function drawAnimationFrame(addr, c = ctx, offx = 128, offy = 160, cbbase = 0x103000) {

}

function drawCB(bf, c = ctx, offx = 128, offy = 160) {
	let z = bf.getShort();
	let z2 = bf.getShort();
	let x = bf.getShort();
	let x2 = bf.getShort();
	let y = bf.getShort();
	let y2 = bf.getShort();
	c.strokeRect(x + offx, -y + offy, x2, -y2);
//	labelInfo.title = 'x=' + x + ',' + x2 + ' y=' + y + ',' + y2 + ' z=' + z + ',' + z2;
}


let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawMap() {

}


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
function getRomFrame(addr){

}


var curPlayerType;
var curPlayerFrame;
var playerSpriteAddress = [0x163E, 0x164E, 0x165E, 0x166E, 0x168E];

var animPlayerAddr = [];
//draw anim by player 0-3
function drawRomFramePlayer() {

}

function loopDrawAnimationPlayer() {

}


