"use strict"
// seems only for kof
function loadRomPalNeo(bf, to) {
	for(let c = 0;c < 16;c++) {
		let color = bf.getShort();
		
		palData[c + to] = neo2rgb(color);
	}
}

function neo2rgb(color) {
	let lightbit = ((color>>15) ^ 1);	// not dark bit
	let blue = ((color>>8) & 0xf) << 2 | ((color>>14) & 0x1) << 1 | lightbit;
	let green = ((color>>4) & 0xf) << 2 | ((color>>13) & 0x1) << 1 | lightbit;
	let red = ((color>>0) & 0xf) << 2 | ((color>>12) & 0x1) << 1 | lightbit;

	let r = 4.063;
	blue = Math.floor(blue * r);
	green = Math.floor(green * r);
	red = Math.floor(red * r);
	
	return blue | green << 8 | red << 16 | 0xFF000000;
}


/*  from mame
	int dark = data >> 15;	// how to use this bit?
	int r = ((data >> 14) & 0x1) | ((data >> 7) & 0x1e);
	int g = ((data >> 13) & 0x1) | ((data >> 3) & 0x1e);
	int b = ((data >> 12) & 0x1) | ((data << 1) & 0x1e);
*/


function cps2rgb(color) {
	let blue = ((color>>8) & 0xf) * 0x11;
	let green = ((color>>4) & 0xf) * 0x11;
	let red = ((color>>0) & 0xf) * 0x11;
	
	return blue | green << 8 | red << 16 | 0xFF000000;
}

var autoAnim = 0;

// mslug draw background
function drawbgbasemslug(addr, w, h) {
	var bf2 = getrdbuf();
	bf2.position(addr);
	bf2.skip(4 * h * bgAddressSkip);
	var animated = false;

	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	let imax = Math.min(w - bgAddressSkip, 34);
	for(let i = 0;i < imax;i++) {
		for(let j = 0;j < h;j++) {
			let tile = bf2.getuShort();
			let pal = bf2.get();
			let flag = bf2.get();
			tile += (flag & 0xF0) << 12;
			let a8 = flag & 0b1000;	// 8 frame auto animation
			let a4 = flag & 0b0100;	// 4 frame auto animation
			if(a8) {
				tile += (autoAnim & 0x7);
				animated = true;
			} else if(a4) {
				tile += (autoAnim & 0x3);
				animated = true;
			}
			drawTilesBase(imageData, tile, 1, 1, pal, 16, false, (flag & 0x2), (flag & 0x1), false);

			ctxBack.putImageData(imageData, i * gridHeight, j * gridWidth - bgAddressSkipY * 32);
		}
	}

	autoAnim++;
	if(animated) {
		animTimer = setTimeout("drawbgbasemslug("+ addr +"," + w+"," + h+")", 200);
	}
}