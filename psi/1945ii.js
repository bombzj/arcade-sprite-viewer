"use strict"

var paletteAddress = 0x9F980;		// per level * scen = 8 * 4

// load pal from rom and oveewrite old
function loadRomPal() {

	loadRomPalPsi(paletteAddress, 0x7B);

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

var animAddress = [
	0x6F75A, 0x74C04
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
//	let addr = animAddress[curAnim];
//	var bf = new bytebuffer(romFrameData);
	
//	let offset = bf.getShort(addr + curAnimAct * 2);
//	if(offset == 0) {
//		labelInfo.innerText = "EOF";
//		return;
//	}
//	let startAddress = addr + offset;
	

	loopDrawAnimation(addr, 0xA);

//	labelInfo.innerText = 'addr:' + addr.toString(16).toUpperCase() + "/" + startAddress.toString(16).toUpperCase() + " off:"
//			+ offset.toString(16).toUpperCase() + ' act:' + curAnimAct
//			+ ' ' + curAnim + '/' + curAnimAct + "/" + (bf.getShort(addr)/2-1);
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
	var bf = new bytebuffer(romFrameData, addr);
	let fr = bf.getShort();
	let fr2 = bf.getShort();
	let index = bf.getInt();	// ??
	let cb1 = bf.get();	// collision box attack
	let cb2 = bf.get();	// collision box defense
	if(fr < 0) {
		return fr;
	}
	
	let frame = romFrames[fr / 4];
	if(!frame) debugger
	drawRomFrameBase(frame, c, offx, offy);
	if(fr2 >= 0) {
		let frame2 = romFrames[fr2 / 4];
		if(!frame2) debugger
		drawRomFrameBase(frame2, c, offx, offy);
	}
	
	c.lineWidth = 1;
	// draw cross
	c.strokeStyle = 'purple';
	c.moveTo(offx - 30, offy);
	c.lineTo(offx + 30, offy);
	c.moveTo(offx, offy - 30);
	c.lineTo(offx, offy + 30);
	c.stroke();
	// draw collision box
	bf.position(cbbase + 0xc * cb1);
	c.strokeStyle = 'green';
	drawCB(bf, c, offx, offy)
	bf.position(cbbase + 0xc * cb2);
	c.strokeStyle = 'red';
	drawCB(bf, c, offx, offy)
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


var mapAddress = 0x62F58;
var map2Address = 0x1923A;	// layer 2 background

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap
function drawMap() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = bf.getInt(mapAddress + curMap * 16 + 4);
	let tileaddr = bf.getInt(mapAddress + curMap * 16 + 8);
	let bigindex = bf.getInt(mapAddress + curMap * 16);
	
	let addr = bf.getInt(mapAddress + curMap * 4);
	bf.position(addr);
	let pal = bf.get() & 0xF0;
	let flag = bf.get();
	
	let addtile = (flag & 0x7) << 16;
	let mode4 = flag & 0x10;	// 4 bytes mode
	let color16 = flag & 0x20;	// 16 color
	
	bf.skip(2);
	
	let w = bf.getShort();
	let h = bf.getShort();
	labelInfo.innerHTML += ' size:' + w + ',' + h + ' addr:0x' + addr.toString(16).toUpperCase()
	if(w > 30 || h > 200)
		debugger;
	
//	labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
//			+ ' 2x2tile address:' + mapTileAddress[curMap].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	for(let i=0;i<h;i++) {
		for(let j=0;j<w;j++) {

			let tile;
			if(mode4) {
				let tmp = bf.getInt();
				tile = tmp & 0x7FFFF;
				pal = tmp >> 24 & 0xF0;
			} else {
				tile = bf.getuShort();
				tile = tile | addtile;
			}

			if(color16)
				drawTilesBase(imageData, tile, 1, 1, (pal), 16, false, false, false);
			else
				drawTilesBase(imageData, tile, 1, 1, (pal), 16, false, false, false, 0, 256);
			ctxBack.putImageData(imageData, (i-mapAddressSkip * 4) * gridWidth, j * gridHeight);

		}
	}

}


var map2Data = [
	0x2313E,	0x2315C,	0x2317A,	0x23184,	0x231A2,	0x231B6,	0x231D4,	0x231FC
];
let map2Width = 16;
let map2Height = 8;
function drawMap2() {return;
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = bf.getInt(map2Address + curMap * 16 + 4);
	let tileaddr = bf.getInt(map2Address + curMap * 16 + 8);
	let bigindex = bf.getInt(map2Address + curMap * 16);
	
//	labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
//			+ ' 2x2tile address:' + mapTileAddress[curMap].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth*2, gridHeight*2);

	var height = 2;
	bf3.position(bigindex);
	
	let startscr=0;
	for(let scr=0;scr<6 + mapAddressSkip * 2;scr++) {
		if(scr%2==0)bf3.skip(4)
		let scrTile = bf3.getShort();
		if(scr<mapAddressSkip * 2)
			continue;
		
		

		let scrx = Math.floor(startscr / height) * 256;
		let scry = (height - startscr % height - 1) * 256;

		bf.position(tileindex+scrTile * 16 * 2);
	
		for(let i=0;i<4;i++) {
			for(let j=0;j<4;j++) {
				let maptile=bf.getShort();
				bf2.position(maptile*4*4 + tileaddr);
				for(let gi=0;gi<mapGrid;gi++)
					for(let gj=0;gj<mapGrid;gj++) {
						
						let tile = bf2.getShort();
						let flag = bf2.get();
						let pal = bf2.get();
						if(hideBackground) {	// hide background based on flag and color, 0x10 maybe the switch
							let hide = flag & 0xF;
							if((pal & 0x80) == 0)
								hide = 16;
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20), hide);
						} else 
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20));
						ctxBack.putImageData(imageData, scrx + (i*mapGrid+gi) * gridWidth*2, scry + (j*mapGrid+gj)%16 * gridHeight*2);
					}
			}
		}
		startscr++;
	}


}

function setMapTileStart(mapstart) {
	mapScene = mapstart;
	refresh();
}


frameAddress = [
	0x7B9D0, 0x7CE64, 0x7E028, 0x843AC, 0x84E08, 0x856C0, 0x7CDE0, 0x85ED0, 0x8713C,
	0x89BA8, 0x8B87C, 0x8FA1C, 0x86E6C, 0x87D9C
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f){
	var bf = new bytebuffer(romFrameData);
	if(f >= 0)
		addr = addr + f * 0xC;
	bf.position(addr);

	
	let frame = {
			sprites : []
	};

	let zoomy = bf.get();
	let y = bf.gets();
	let zoomx = bf.get();
	let x = bf.gets();

	let ny = bf.get() & 0xF;
	bf.skip();
	let nx = bf.get() & 0xF;
	bf.skip();
	
	let palette = bf.get();
	let flag = bf.get();
	let tile = bf.getuShort();
	let sprite = {
			x : x,
			y : y,
			tile : tile,
			nx : nx + 1,
			ny : ny + 1,
			vflip : (zoomy & 0x3) == 0,	// this tile need flip
			hflip : false,	// this tile need flip
			pal : palette,
			color : flag & 0x80	// if 256 color
		};
//	frame.cb2 = {
//			x	: -cbx,
//			x2	: cbx << 1,
//			y	: -cby,
//			y2	: cby << 1
//	}
	frame.info = 'addr:0x' + addr.toString(16).toUpperCase() + ' pal:' + palette.toString(16).toUpperCase();
	frame.sprites.push(sprite);

	return frame;
}


var curPlayerType;
var curPlayerFrame;
var playerSpriteAddress = [0x163E, 0x164E, 0x165E, 0x166E, 0x168E];

var animPlayerAddr = [];
//draw anim by player 0-3
function drawRomFramePlayer() {return;
	var bf = new bytebuffer(romFrameData);
	for(let player = 0;player < 4;player++) {
		let type = bf.getInt(player * 4 + playerSpriteAddress[curPlayerType]);
		animPlayerAddr[player] = bf.getShort(type + curPlayerFrame * 2) + type;
		if(animPlayerAddr[player] == 0) {
			labelInfo.innerText = "EOF";
			return;
		}
	}

	loopDrawAnimationPlayer();
//
//	labelInfo.innerText = 'addr:' + addr.toString(16).toUpperCase() + "/" + startAddress.toString(16).toUpperCase() + " off:"
//			+ offset.toString(16).toUpperCase() + ' act:' + curAnimAct
//			+ ' ' + curAnim + '/' + curAnimAct + "/" + (bf.getShort(addr)/2-1);
}

function loopDrawAnimationPlayer() {
	animTimer = null;
	
	var bf = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	for(let player = 0;player < 4;player++) {
		let type = bf.getInt(player * 4 + playerSpriteAddress[curPlayerType]);
		let offset = bf.getShort(type + curPlayerFrame * 2);
//		let s = bf.getShort(type + offset);
//		
//		let frame = romFrames[s/4];
//		
//		drawRomFrameBase(frame, ctxBack, player * 100 + 100)

//		drawAnimationFrame(type + offset, ctxBack, player * 100 + 100, undefined, playerCB[player])

//		nFrame.value=curRomFrame
//		hexFrame.value=curRomFrame.toString(16).toUpperCase();
		
		bf.position(animPlayerAddr[player]);
		let fr = bf.getShort();

		if(fr < 0) {
			if(fr == -offset)
				return;	// stop loop & timer
//			animPlayerAddr[player] += fr;	// end with go back offset = fr, so loop
			let type = bf.getInt(player * 4 + playerSpriteAddress[curPlayerType]);	// get begin address to loop
			animPlayerAddr[player] = bf.getShort(type + curPlayerFrame * 2) + type;
		} else {
			drawAnimationFrame(animPlayerAddr[player], ctxBack, player * 100 + 100, undefined, playerCB[player]);
			animPlayerAddr[player] += 0xC;
		}
	}

	
	animTimer = setTimeout("loopDrawAnimationPlayer()", 200);
}


