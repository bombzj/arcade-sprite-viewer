"use strict"

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2;
	
	bf.position(0xA4268);
	for(let i = 0;i < 0x10;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x0)
	}

	bf.position(0xA4468 + (palset << 9));
	for(let i = 0;i < 0x10;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x10)
	}

	bf.position(0x100000 + (palset << 10));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x20)
	}

	bf.position(0x105000 + (palset << 10));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x40)
	}

	bf.position(0x10A000 + (palset << 10));
	for(let i = 0;i < 0x20;i++) {
		loadRomPalCps(bf, (i << 4) + 16 * 0x60)
	}
	// // sub_A3BC
	// bf.position(bf.getInt(0x1B032A + palset * 4));
	// for(let i = 0;i < 0x20;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x60)
	// }


	// // sub_A3FC
	// bf.position(0x1C7424);
	// for(let i = 0;i < 0x2;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x1E)
	// }
	// // sub_A426
	// bf.position(0x1D90A4);
	// for(let i = 0;i < 0x6;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0xC)
	// }

	// // sub_A438
	// bf.position(bf.getInt(0x1C737C + palset * 4));
	// for(let i = 0;i < 0x5;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x16)
	// }


	// // sub_A426
	// bf.position(0x1C79C4);
	// for(let i = 0;i < 0x4;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x12)
	// }

	// sub_A426， 4 characters?
	// bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	// for(let i = 0;i < 0x3;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x0)
	// }
	// bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	// for(let i = 0;i < 0x3;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x3)
	// }
	// bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	// for(let i = 0;i < 0x3;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x6)
	// }
	// bf.position(bf.getInt(0x1C7268 + palset2 * 4));
	// for(let i = 0;i < 0x3;i++) {
	// 	loadRomPalCps(bf, (i << 4) + 16 * 0x9)
	// }

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
	0x728DC, 0x823FA, 0x728F4
];

//get frame from addr. return a frame obj
function getRomFrame(addr){
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);

	let frame = {
		sprites : []
	};
debugger
	bf.position(addr);
	let addr2 = bf.getrInt(4);
	bf2.position(addr2);
	let cnt = bf2.getShort();
	let palette = bf2.getShort();
	let positionIndex = bf2.getShort();
	let a5_749A = bf2.getShort();
	let a5_7498 = bf2.getShort();
	let positionIndex2 = (positionIndex & 0x7F80) >> 5;
	let addr3 = bf.getInt(0x98112 + positionIndex2);

	addr3 += bf.getShort(addr3 + (positionIndex & 0x7F) * 2);
	bf3.position(addr3);	// position list

	for(let j = 0;j < cnt;j++) {
		let tile = bf2.getuShort();
		if(tile == 0) {
			j--;
			bf3.skip(4);
			continue;
		}
		let x = bf3.getShort();
		let y = bf3.getShort();

		let sprite = {
			x : x,
			y : y,
			tile : tile,
			nx : 1,
			ny : 1,
			vflip : palette & 0x40,	// this tile need flip
			hflip : palette & 0x20,	// this tile need flip
			pal : palette & 0x1F,
		};
	
		frame.sprites.push(sprite);
	}

	return frame;
}

var romFrames = [];		// frames that extracted from romFrameData
//load frames data from rom
function loadRomFrame() {

}


