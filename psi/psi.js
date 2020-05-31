"use strict"

// load psi format palette
function loadRomPalPsi(entry, head, addrbase = 0, addradd = 0) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	
	
	var paletteIndex = bf.getInt(entry + palset * 4);	// palset = level
	
	labelInfo2.innerText = 'palset:' + palset + ' addr:' + paletteIndex.toString(16).toUpperCase();
	
	// load sprite palette
	bf.position(paletteIndex);
	
	// limit pages to 50, usually <=20
	for(let xx = 0;xx < 50;xx++) {
		let flag = bf.getShort();
		if(flag == -1)
			continue;
		if(flag != head)
			break;
		let to = bf.getShort();
		let addr = bf.getInt() - addrbase | addradd;
		
		bf2.position(addr);

		for(let i = 0;i < 16;i++) {	// copy a page with 16 palettes, each palette contains 16 colors
			let p = bf2.getInt() - addrbase | addradd;
			bf3.position(p);
			for(let c = 0;c < 16;c++) {
				let dp = ((i << 4) + c) + (to << 4);
				palData[dp] = bf3.get() | bf3.get() << 8 | bf3.get() << 16 | 0xFF000000;
				bf3.skip();	// alpha
			}
			
		}

	}
}