"use strict"
// seems only for kof
function loadRomPalNeo(bf, to) {
	bf.skip(2);
	palData[to] = 0;
	for(let c = 0;c < 15;c++) {
		let color = bf.getShort();
		
		palData[c + to + 1] = neo2rgb(color);
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


// get frame from addr. return a frame obj
function kofgetRomFrame(addr, f, vflip = false, hflip = false) {
	var bf = getrdbuf();
	var bf2 = getrdbuf();
	let frame = {
		sprites: [],
	};
	

	if(addr < 0x100000) {
		// draw by $8544
		if(f >= 0) {	// use frameAddress and has multiple frames
			let offset = bf.getShort(addr + 2);
	
			addr += offset + 2;
		}
		frame.info = '0x'+addr.toString(16).toUpperCase();
		bf.position(addr);
		
		bf.skip(2);
		let cnt = bf.get() + 1;
		let cnt2 = bf.get() + 1;
		let offset = bf.getShort();
		if(f) {
			offset = offset * f;
		} else {
			offset = 0;
		}
	
	
		bf2.position(addr + offset + 0x6);
	
		for(let i = 0;i < cnt;i++) {
			for(let j = 0;j < cnt2;j++) {
				let tile = bf2.getuShort();
				let palette = bf2.get();
				let flag = bf2.get();
				tile += (flag & 0xF0) << 12;	// more bits for tile number
				let sprite = {
					x: i * 0x10,
					y: j * 0x10,
					tile: tile,
					nx: 1,
					ny: 1,
					vflip: flag & 0x2,	// this tile need flip
					hflip: flag & 0x1,	// this tile need flip
					pal: palette,
				};
				frame.sprites.push(sprite);
			}
		}


	} else {

		// draw by 6022
		if(f >= 0) {	// use frameAddress and has multiple frames
			addr = bf.getInt(addr + f * 4) + sprbank;
		}
		// frame.info = 
		bf.position(addr);
		
		let palette = bf.get();
		let func = bf.get();
		if(!(func >= 0)) {	// wrong addrress
			debugger;
			return;
		}
		frame.info = '0x'+addr.toString(16).toUpperCase() + ',func:' + func.toString(16).toUpperCase() + 
					',pal:' + palette.toString(16).toUpperCase();

		if(func == 0x1 || func == 0x0) {
			// only provide first tile, all tiles are in order, 1 2 3 4 5
			let flag = 0;
			let nx = bf.get();
			let ny = bf.get();
			
			let tile = bf.getInt();
	
		
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x1) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x1) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;
					// let tile = bf2.getuShort();
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: hflip ? (nx-i-1) << 4 : i << 4,
						y: vflip ? -j << 4 : j << 4,
						tile: tile++,
						nx: 1,
						ny: 1,
						vflip: vflip,	// this tile need flip
						hflip: hflip,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}
		} else if(func == 0x8 || func == 0x7) {
			// word per tile, upper bits from header
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			let tmp = bf.get();	// not used?
			let flag = bf.get();
			let tileadd = (flag & 0xF0) << 12;
			if(func == 0x8) {
				bf2.position(bf.position() + nx);
				if(bf2.position() & 1) {	// sometimes extra 0 is there, why? even alignment!
					bf2.skip();
				}
			} else {
				bf2.position(bf.position() + nx * 2);
			}
			
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x8) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x8) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;

					let tile = bf2.getuShort() + tileadd;
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: hflip ? (nx-i-1) << 4 : i << 4,
						y: vflip ? -j << 4 : j << 4,
						tile: tile,
						nx: 1,
						ny: 1,
						vflip: vflip,	// this tile need flip
						hflip: hflip,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}
		} else if(func == 0xA || func == 0x9) {
			// byte per tile, more upper bits from header
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			// let palette = bf.get();
			let flag = bf.getuShort();
			let tileadd = ((flag & 0xF0) << 12) + (flag & 0xFF00);

			if(func == 0xA) {
				bf2.position(bf.position() + nx);
			} else {
				bf2.position(bf.position() + nx * 2);
			}
		
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0xA) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0xA) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;
						
					let tile = bf2.get() + tileadd;
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: hflip ? (nx-i-1) << 4 : i << 4,
						y: vflip ? -j << 4 : j << 4,
						tile: tile,
						nx: 1,
						ny: 1,
						vflip: vflip,	// this tile need flip
						hflip: hflip,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}
		} else if(func == 0x6 || func == 0x5) {
	// word per tile, upper bits from header, with different flags
			let nx = bf.get();
			let ny = bf.get();
			
			// let tile = bf.getInt();
			// let palette = bf.get();
			// let flag = bf.get();
			// let tileadd = (flag & 0xF0) << 12;

			if(func == 0x6) {
				bf2.position(bf.position() + nx);
				if(bf2.position() & 1) {	// sometimes extra 0 is there, why? even alignment!
					bf2.skip();
				}
			} else {
				bf2.position(bf.position() + nx * 2);
			}
		
			let cnt = 0;
			for(let i = 0;i < nx;i++) {
				let fill;			// in this column, which row need fill (per bit), which means max 8
				if(func == 0x6) {
					fill = bf.get();
				} else {
					fill = bf.getuShort();
				}

				for(let j = 0;j < ny;j++) {
					let mask;
					if(func == 0x6) {
						mask = 0x80 >>> j;
					} else {
						mask = 0x8000 >>> j;
					}

					if((fill & mask) == 0)		
						continue;

					let flag, tile;
					if(cnt++ & 0x1) {
						flag = bf2.get();
						tile = bf2.getuShort();
					} else {
						tile = bf2.getuShort();
						flag = bf2.get();
					}


					let tileadd = (flag & 0xF0) << 12;
					tile += tileadd;
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: hflip ? (nx-i-1) << 4 : i << 4,
						y: vflip ? -j << 4 : j << 4,
						tile: tile,
						nx: 1,
						ny: 1,
						vflip: vflip,	// this tile need flip
						hflip: hflip,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}
		} else if(func == 0x2 || func == 0x3) {
			// word per tile without fill mask
			let nx = bf.get();
			let ny = bf.get();
			
			let flag;
			let tileadd;
				
			if(func == 0x3) {
				let tmp  = bf.get();		// unused?
				flag = bf.get();
				tileadd = (flag & 0xF0) << 12;
			}

			let cnt = 0;
			for(let i = 0;i < nx;i++) {

				for(let j = 0;j < ny;j++) {
					let tile;
					if(func == 0x2) {
						if(cnt++ & 0x1) {
							flag = bf.get();
							tile = bf.getuShort();
						} else {
							tile = bf.getuShort();
							flag = bf.get();
						}

						tileadd = (flag & 0xF0) << 12;
					} else {
						tile = bf.getuShort();
					}

					
					tile += tileadd;
					
					// let flag = bf2.get();
					// tile += (flag & 0xF0) << 12;	// more bits for tile number
					let sprite = {
						x: hflip ? (nx-i-1) << 4 : i << 4,
						y: vflip ? -j << 4 : j << 4,
						tile: tile,
						nx: 1,
						ny: 1,
						vflip: vflip,	// this tile need flip
						hflip: hflip,	// this tile need flip
						pal: palette,
					};
					frame.sprites.push(sprite);
				}
			}

		}		

	}

	return frame;
}

var listbank = 0, sprbank = 0;

function kofdrawAnimation(addr) {
	animVars = {
		offx	:	200,
		offy	:	160,
		cbs		:	[],
		exobjs	:	[],
		base	:	addr,
		addr	:	0,
	};
	kofloopDrawAnimation();
}

var animVars = {};
var typecolor = ['red',	// attack
		 'green',	// head
		 'orange',	// body	
		  'blue'
		];

function kofloopDrawAnimation() {
	animTimer = null;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let lapse = kofDrawAnimationBase(animVars);
	for(let obj of animVars.exobjs) {debugger
		kofDrawAnimationBase(obj);
	}
	if(lapse == -1) {
		return;
	}
	animTimer = setTimeout("kofloopDrawAnimation()", 20 * lapse);
}

function kofDrawAnimationBase(param) {
	var bf = getrdbuf();
	let cbs = param.cbs;
	if(cbs) {
		delete cbs[0];
	}
	labelInfo.innerText = 'anim:' + (param.base + param.addr).toString(16).toUpperCase();
	for(let i = 0;i < 10;i++) {
		let flag = bfr.gets(param.base + param.addr);
		if(flag >= 0) {
			break;
		}
		flag = -flag - 1;
		if(flag == 0) {
			param.addr = 0;
			continue;
		} else if(flag == 1) {
			return -1;	// stop animation
		} else if(flag == 2) {	// hitbox & effect
			bf.position(param.base + param.addr + 1);
			let effect = bf.get();
			let type = effect & 0x3;
			effect >>= 2;
			let x = bf.gets();
			let y = bf.gets();
			let x2 = bf.gets();
			let y2 = bf.gets();
			if(cbs) {
				cbs[type] = {
					x	:	x,
					y	:	y,
					x2	:	x2,
					y2	:	y2,
					type : type,
					effect : effect
				};
			}
		} else if(flag == 3) {

		} else if(flag == 4) {	// move delta x y
			param.offx += bf.getShort(param.base + param.addr + 2);
			// animVars.offy += bf.getShort(base + addr + 4);		
		} else if(flag == 5) {	// new object
			if(param === animVars) {
				newobject(param.base + param.addr);
			}
		} else {

		}
		param.addr += 6;
	}
	
	let lapse = bf.gets(param.base + param.addr) + 1;
	if(bfr.get(param.base + param.addr + 6) == 0xFE) {
		lapse = -1;
	}
	let stepframe = bf.getuShort(param.base + param.addr + 2);

	let paddr = bf.getInt(0x200002 + curAnim * 4 + listbank) + listbank;	// position info & pointer to image
	bf.position(paddr + stepframe * 6);

	let x = bf.getShort();
	let y = bf.getShort();
	let af = bf.getuShort();		// sprite offset
	let vflip = af & 0x4000;
	let hflip = af & 0x8000;
	let two = af & 0x2000;	// this frame has more than one sprite.

	let addr2 = bf.getInt(animAddress + curAnim * 4) + sprbank;

	labelInfo.innerText += ' spr:' + (param.base + param.addr).toString(16).toUpperCase() + ' f:' + af.toString(16).toUpperCase();

	let frame = kofgetRomFrame(addr2, af & 0x3FF, vflip, hflip);
	if(!frame) {
		return;
	}
	
	let offx = param.offx;
	let offy = param.offy;
	ctxoff.clearRect(0, 0, canvasoff.width, canvasoff.height);
	drawRomFrameBase(frame, ctxoff, offx, offy, x, y);
	ctx.drawImage(canvasoff, 0, 0);

	while(two) {
		let x = bf.getShort();
		let y = bf.getShort();
		let af = bf.getuShort();		// sprite offset
		let vflip = af & 0x4000;
		let hflip = af & 0x8000;
		two = af & 0x2000;
	
		let addr2 = bf.getInt(animAddress + curAnim * 4) + sprbank;
		labelInfo.innerText += ' f:' + af.toString(16).toUpperCase();
	
		let frame = kofgetRomFrame(addr2, af & 0x3FF, vflip, hflip);		// ROM:0000613E   andi.w  #$3FF,d6
		if(frame) {
			ctxoff.clearRect(0, 0, canvasoff.width, canvasoff.height);
			drawRomFrameBase(frame, ctxoff, offx, offy, x, y);
			ctx.drawImage(canvasoff, 0, 0);
		}
	}

	if(showCB && cbs) {
		// draw collision box
		for(let c of cbs) {
			if(c) {
				ctx.strokeStyle = typecolor[c.type];
				ctx.strokeRect(c.x + offx - c.x2, c.y + offy - c.y2, c.x2 * 2, c.y2 * 2);
			}
		}
	}

	param.addr += 6;
	return lapse;
}

function newobject(addr) {
	if(animVars.exobjs.length >= 10) {
		debugger;		// impossible
		return;
	}
	var bf = getrdbuf(addr);

	let objid = bf.getuShort() & 0xff;
	let newx = bf.getShort();
	let newy = bf.getShort();
	switch(objid) {
		case 0:;
		case 0x81:
			objid = 0xfc;
			break;
		case 0x45:
			objid = 0xf9;
			break;
		case 0x46:
			objid = 0xfa;
			break;
		case 0x47:
			objid = 0xfb;
			break;
		case 0x48:
			objid = 0xfc;
			break;
		default:
			return;
	}

	let aaddr = bfr.getInt(0x300002 + curAnim * 4) + 0x100000;	// animation address
	aaddr = bfr.getInt(aaddr + objid * 4);

	animVars.exobjs.push({
		offx:	newx + animVars.offx,
		offy:	newy + animVars.offy,
		base:	aaddr + 0x100000,
		addr:	0
	});		// extra object created by animation
}