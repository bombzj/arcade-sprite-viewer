"use strict"

var paletteAddress = 0xB7A52;		// per level * scen = 8 * 4
var paletteAddressIndex1 = 0x1C7268;	// for sprite, per level * scene = 8 * 10?
var paletteAddressIndex2 = 0xBBA52;	// for scroll layer 1, seems fixed for HUD
var paletteAddressIndex3 = 0x1C737C;	// for scroll layer 2
var paletteAddressIndex4 = 0x8C52;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	var paletteIndex = bf.getInt(paletteAddressIndex1 + palset * 4);	// palset = level
	var paletteIndex2 = paletteAddressIndex2;
	var paletteIndex3 = bf.getInt(paletteAddressIndex3 + (palset * 4 + palset2) * 4);	
	var paletteIndex4 = bf.getInt(paletteAddressIndex4 + (palset * 4 + palset2) * 4);	
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2 + ' addr:' + paletteIndex.toString(16).toUpperCase();
	
	// load sprite palette
	bf.position(paletteIndex);
	for(let i = 0;i < 3;i++) {
		loadRomPalCps1(bf, i << 4)
	}

	// load layer 2 & 3 palette
	bf.position(paletteIndex2);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 16 * 32)
	}
	
	// load layer 2 & 3 palette
	bf.position(paletteIndex3);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 2 * 16 * 32)
	}
	
	bf.position(paletteIndex4);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 3 * 16 * 32)
	}
	

	if(showPal)
		drawPal();
}
var showPal;

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}


var playerCB = [	// collision boxes groups for 4 players
	0x100000,0x100C00,0x101800,0x102400
];

var animAddressIndex = 0x0B7472;
var animAddress = [ ];

var mapData = [
	
];
var mapAddress = [	// real map
	
]

var map2Address;	// layer 2 background


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


//get frame from addr. return a frame obj
function getRomFrame(addr){

}

var romFrames = [];		// frames that extracted from romFrameData
//load frames data from rom
function loadRomFrame() {

}


