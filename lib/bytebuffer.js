"use strict"
class bytebuffer {
	constructor(arr, pos) {
		this.arr = arr;
		this.pos = pos ? pos : 0;
	}
	
	skip(n) {
		if(n>=0)
			this.pos += n;
		else
			this.pos ++;
	}
	
	position(p) {
		if(p>=0)
			this.pos = p;

		return this.pos;
	}
	move(p) {
		if(p)
			this.pos += p;

		return this.pos;
	}
	get(p) {
		if(p>=0)
			return this.arr[p];
		else
			return this.arr[this.pos++];
	}
	
	gets(p) {	// signed
		let res;
		if(p>=0)
			res = this.arr[p];
		else
			res = this.arr[this.pos++];
		if(res >= 0x80)
			res -= 0x100;
		return res;
	}
	
	getInt(p) {
		if(p>=0) {
			return (this.arr[p] << 24) + (this.arr[p+1] << 16) + (this.arr[p+2] << 8) + this.arr[p+3];
		} else {
			let res = (this.arr[this.pos] << 24) + (this.arr[this.pos+1] << 16) + (this.arr[this.pos+2] << 8) + this.arr[this.pos+3];
			this.pos += 4;
			return res;
		}
	}
	
	getShort(p) {
		let res;
		if(p>=0) {
			res = (this.arr[p] << 8) + this.arr[p+1];
		} else {
			res = (this.arr[this.pos] << 8) + this.arr[this.pos+1];
			this.pos += 2;
		}
		if(res >= 0x8000)
			res = res - 0x10000;
		return res;
	}
	
	getuShort(p) {	// unsigned
		let res;
		if(p>=0) {
			res = (this.arr[p] << 8) + this.arr[p+1];
		} else {
			res = (this.arr[this.pos] << 8) + this.arr[this.pos+1];
			this.pos += 2;
		}
		return res;
	}
	
	getr(p) {
		return this.get(p + this.pos);
	}
	getrInt(p) {
		return this.getInt(p + this.pos);
	}
	getrShort(p) {
		return this.getShort(p + this.pos);
	}
}
