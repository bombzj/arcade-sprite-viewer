"use strict"
// seems only for kof
function loadRomPalNeo(bf, to) {
	for(let c = 0;c < 16;c++) {
		let color = bf.getShort();

		let blue = ((color>>8) & 0xf) * 0x11;
		let green = ((color>>4) & 0xf) * 0x11;
		let red = ((color>>0) & 0xf) * 0x11;
		
		palData[c + to] = blue | green << 8 | red << 16 | 0xFF000000;
	}
}


/*  from mame
	int dark = data >> 15;
	int r = ((data >> 14) & 0x1) | ((data >> 7) & 0x1e);
	int g = ((data >> 13) & 0x1) | ((data >> 3) & 0x1e);
	int b = ((data >> 12) & 0x1) | ((data << 1) & 0x1e);
*/