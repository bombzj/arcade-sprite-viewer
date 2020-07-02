"use strict"

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2;
	
	// sub_A360
	bf.position(bf.getInt(0x1B028A + palset * 4));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x20)
	}
	// sub_A38E
	bf.position(bf.getInt(0x1B02DA + palset * 4));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x40)
	}
	// sub_A3BC
	bf.position(bf.getInt(0x1B032A + palset * 4));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x60)
	}


	// sub_A3FC
	bf.position(0x1C7424);
	for(let i = 0;i < 0x2;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x1E)
	}
	// sub_A426
	bf.position(0x1D90A4);
	for(let i = 0;i < 0x6;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0xC)
	}

	// sub_A438
	bf.position(bf.getInt(0x1C737C + palset * 4));
	for(let i = 0;i < 0x5;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x16)
	}


	// sub_A426
	bf.position(0x1C79C4);
	for(let i = 0;i < 0x4;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x12)
	}

	// sub_A426， 4 characters?
	bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	for(let i = 0;i < 0x3;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x0)
	}
	bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	for(let i = 0;i < 0x3;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x3)
	}
	bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	for(let i = 0;i < 0x3;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x6)
	}
	bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	for(let i = 0;i < 0x3;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x9)
	}

	// sub_A49A


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
var bgAddress = [	// real map
	
]

var bg2Address;	// layer 2 background


let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?

// draw a background with tilemap
function drawbg() {

}


var map2Data = [
	0x2313E,	0x2315C,	0x2317A,	0x23184,	0x231A2,	0x231B6,	0x231D4,	0x231FC
];
let bg2Width = 16;
let bg2Height = 8;
function drawbg2() {

}

function setMapTileStart(bgstart) {
	bgScene = bgstart;
	refresh();
}


//get frame from addr. return a frame obj
function getRomFrame(addr){

}

var romFrames = [];		// frames that extracted from romFrameData
//load frames data from rom
function loadRomFrame() {

}


