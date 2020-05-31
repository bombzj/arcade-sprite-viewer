"use strict"
function loadRomPalCps1(bf, to) {
	for(let c = 0;c < 16;c++) {
		let color = bf.getShort();

		let blue = ((color>>8) & 0xf) * 0x11;
		let green = ((color>>4) & 0xf) * 0x11;
		let red = ((color>>0) & 0xf) * 0x11;
		
		palData[c + to] = blue | green << 8 | red << 16 | 0xFF000000;;
	}
}