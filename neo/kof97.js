"use strict"

var paletteAddress = 0x3CFFF0;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);

	// load sprite palette
	
	for(let p = 0;p < 8;p++) {
		bf.position(paletteAddress + p * 0x400);
		for(let i = 0;i < 32;i++) {
			loadRomPalNeo(bf, (i << 4) + p * 16 * 32);
		}
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
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation(addr) {return;
//	let addr = animAddress[curAnim];
	var bf = new bytebuffer(romFrameData);
	if(!addr)
		addr = animAddress[curAnim];

	if(animTimer) {
		clearTimeout(animTimer)
		animTimer = null;
	}
	

	loopDrawAnimation(addr, 0xA);
}
function loopDrawAnimation(addr, offset) {
	animTimer = null;

	var bf = new bytebuffer(romFrameData, addr);
	let fr = bf.getInt();
	let link = bf.getInt();
	let flag = bf.getShort();


	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRomFrame(fr);
	addr += offset;

	if(flag < 0)
		return;
	animTimer = setTimeout("loopDrawAnimation("+ addr +"," + offset+")", 200);
}

function drawAnimationFrame(addr, c = ctx, offx = 128, offy = 160, cbbase = 0x103000) {

}


var mapAddress = 0x112850;
var map2Address = 0x1923A;	// layer 2 background

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawMap() {

}


var map2Data = [
	
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
	
}


var curPlayerType;
var curPlayerFrame;

var animPlayerAddr = [];
//draw anim by player 0-3
function drawRomFramePlayer() {
	
}
