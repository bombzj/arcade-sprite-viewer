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



var bgAddress = 0x18A86;
var bg2Address = 0x1923A;	// layer 2 background

var bgAddressSkip = 0;
let bgWidth = 32;
let bgHeight;	// default 8
let bgGrid = 2;		// each map tile contains 4 raw tiles?

// draw a background with tilemap
function drawbg() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	// ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = 0xA4000 + curbg * 0x2000;
	let tileaddr = bf.getInt(0x85CCA + curbg * 4);
	let bigindex = bf.getInt(bg2Address + curbg * 16);
	
	//labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
	//		+ ' 2x2tile address:' + mapTileAddress[curbg].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);
	
	var height = 2;
	bf3.position(bigindex);
	
	let startscr=0;
	for(let scr=0;scr<6;scr++) {
	//	if(scr%2==0)bf3.skip(4)
		let scrTile = 0;//bf3.getShort();
		
	
		let scry =  (scr & 0x3) * 256;//Math.floor(startscr / height) * 256;
		let scrx = 256 - (scr >> 2) * 256;//(height - startscr % height - 1) * 256;
	
		bf.position(tileindex+scrTile * 16 * 2+0x80 * ((scr&3)+0+(bgAddressSkip + (scr>>2))*8));
		if(scr == 0)
			labelInfo.innerHTML += ' start:' + bf.position().toString(16).toUpperCase();
	
		for(let i=0;i<8;i++) {
			for(let j=0;j<8;j++) {
				let maptile=bf.getShort();
				bf2.position((maptile << 4) + tileaddr);
				for(let gi=0;gi<bgGrid;gi++)
					for(let gj=0;gj<bgGrid;gj++) {
						
						let tile = bf2.getShort() + 0x1800;
						let flag = bf2.get();
						let pal = bf2.get();
						if(hideBackground) {	// hide background based on flag and color, 0x10 maybe the switch
							let hide = flag & 0xF;
							if((pal & 0x80) == 0)
								hide = 16;
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x40, 16, false, (pal & 0x40), (pal & 0x20), hide);
						} else 
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x40, 16, false, (pal & 0x40), (pal & 0x20));
						ctxBack.putImageData(imageData, scrx + ((7-i)*bgGrid+(1-gi)) * gridHeight, scry + (j*bgGrid+gj) * gridWidth);
					}
			}
		}
		startscr++;
	}
}

var map2Data = [
	0x88564
];
let bg2Width = 16;
let bg2Height = 8;
function drawbg2() {
	var bf = new bytebuffer(romFrameData);
	// ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = 0xD8000 + curbg * 0x2000;
	let tileaddr = bf.getInt(0x85CCA + curbg * 4);
	let bigindex = bf.getInt(bg2Address + curbg * 16);
	
	//labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
	//		+ ' 2x2tile address:' + mapTileAddress[curbg].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth*2, gridHeight*2);
	
	var height = 2;
	
	for(let scr=0;scr<8;scr++) {
	
		let scry =  (scr & 0x3) * 256;//Math.floor(startscr / height) * 256;
		let scrx = 256-(scr >> 2) * 256;//(height - startscr % height - 1) * 256;
	
		bf.position(tileindex + 0x100 * ((scr&3)+3+(bgAddressSkip + (scr>>2))*8));
		if(scr == 0)
			labelInfo.innerHTML += ' start:' + bf.position().toString(16).toUpperCase();
		
		for(let i=0;i<8;i++) {
			for(let j=0;j<8;j++) {
				
				let tile = bf.getShort() + 0xC00;
				let flag = bf.get();
				let pal = bf.get();
				if(hideBackground) {	// hide background based on flag and color, 0x10 maybe the switch
					let hide = flag & 0xF;
					if((pal & 0x80) == 0)
						hide = 16;
					drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20), hide);
				} else 
					drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20));
				ctxBack.putImageData(imageData, scrx + i * gridHeight*2, scry + j * gridWidth*2);

			}
		}
	}

}

function setMapTileStart(bgstart) {
	bgScene = bgstart;
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
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	if(curRomFrame2 >= 0) {
		let offset = bf.getShort(addr + curRomFrame2 * 2);
		
		bf.position(addr + offset);
	} else {
		bf.position(addr);
	}



	
	let frame = {
			sprites : []
	};
	let func = bf.get();	// function to draw
	
	frame.info = '0x'+addr.toString(16).toUpperCase() + ' function 0x' + func.toString(16).toUpperCase();
	
	if(func == 0x8 || func == 0xC || func == 0xA || func == 0xE || func == 0x4 || 
			func == 0x0 || func == 0x2 || func == 0x10 || func == 0x6) {
		let cnt = bf.get();
		if(func == 0x4 || func == 0x0 || func == 0x2 || func == 0x6)
			cnt = 1;
		bf.skip(4)
		let nxy = bf.get();
		let nx = nxy % 16;
		let ny = nxy >> 4;
		let palette = bf.get();
		
		let t1 = bf.get();	// t1 / t2 point to position data
		let t2 = bf.get();
		
		let addr2 = bf2.getInt(0x8A870 + t1);
		bf2.position(addr2 + bf2.getShort(addr2 + t2));
		for(let i = 0;i < cnt;i++) {
			let y = bf2.getShort();
			let x = bf2.getShort();
			if(func == 0xA || func == 0xE)
				y = -y;
			if(func == 0xC || func == 0xE)
				x = -x;

			let tile = bf.getShort();
			let sprite = {
					x : x,
					y : y,
					tile : tile,
					nx : nx + 1,
					ny : ny + 1,
					vflip : palette & 0x40,	// this tile need flip
					hflip : palette & 0x20,	// this tile need flip
					pal : palette & 0x1F,
				};
			
			frame.sprites.push(sprite);
		}
	
		
	} else {
		labelInfo.innerHTML = 'unsupported 0x' + func.toString(16).toUpperCase();
		return;
	}
	console.log('function 0x' + func.toString(16).toUpperCase());
	return frame;
}




