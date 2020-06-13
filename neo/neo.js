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