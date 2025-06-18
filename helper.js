export function initAmpEQStateArray(type) {
		switch (type) {
			case '5D':
				return [
					{ eq1: false },
					{ eq1: false},
					{ eq1: false},
					{ eq1: false }
				]
			default:
				return [
					{ eq1: false, eq2: false },
					{ eq1: false, eq2: false },
					{ eq1: false, eq2: false },
					{ eq1: false, eq2: false },
				]
		}
}
export function eqType() {
	return [
		{ id: 1, label: 'PEQ' },
		{ id: 2, label: 'Notch' },
		{ id: 3, label: 'LowShelf' },
		{ id: 4, label: 'HighShelf' },
		{ id: 5, label: 'Asymetric' }
	]
}

export function eqSlope() {
	return [
		{ id: 1, label: '6dB/oct' },
		{ id: 2, label: '12dB/oct' },
		{ id: 3, label: '18dB/oct' },
		{ id: 4, label: '24dB/oct' },
	]
}


export function eqChoice(type) {
		switch (type) {
			case '5D':
				return [
					{ id: 0, label: 'EQ1' },
				]
			default:
				return [
					{ id: 0, label: 'EQ1' },
					{ id: 1, label: 'EQ2' }
				]
		}
}

export function eqChoiceByPass(type) {
		switch (type) {
			case '5D':
				return [
					{ id: 'eq1', label: 'EQ1' },
				]
			default:
				return [
					{ id: 'eq1', label: 'EQ1' },
					{ id: 'eq2', label: 'EQ2' }
				]
		}
}

export function eqBandChoice(type) {
	switch (type) {
		case '5D':
			return [
				{ id: 1, label: '1' },
				{ id: 2, label: '2' },
				{ id: 3, label: '3' },
				{ id: 4, label: '4' },
				{ id: 5, label: '5' },
				{ id: 6, label: '6' },
				{ id: 7, label: '7' },
				{ id: 8, label: '8' }
			]
		default:
			return [
				{ id: 1, label: '1' },
				{ id: 2, label: '2' },
				{ id: 3, label: '3' },
				{ id: 4, label: '4' },
				{ id: 5, label: '5' },
				{ id: 6, label: '6' },
				{ id: 7, label: '7' },
				{ id: 8, label: '8' },
				{ id: 9, label: '9' },
				{ id: 10, label: '10' },
				{ id: 11, label: '11' },
				{ id: 12, label: '12' },
				{ id: 13, label: '13' },
				{ id: 14, label: '14' },
				{ id: 15, label: '15' },
				{ id: 16, label: '16' },

			]
	}
}

export function eqBandToObjKey(chId, type) {
		switch (type) {
			case '5D':
				const row = Math.floor((chId - 1) / 4);
				const col = (chId - 1) % 4;
				return `band_${row + 1 + col * 4}`;
			default:
				const base = Math.floor((chId - 1) / 32) + 1;
				const offset = (chId - 1) % 32;
				const result = base + offset * 4;
				return `band_${result}`;
		}
}


export function numberToFloat32Hex(number) {
	const float32Array = new Float32Array(1);
	float32Array[0] = number;
	const uint32Array = new Uint32Array(float32Array.buffer);
	return uint32Array[0].toString(16).padStart(8, '0');
}

export function isJSON(str) {
	try {
		return JSON.parse(str) && !!str;
	} catch (e) {
		return false;
	}
}

export function filterEQData(self, data) {
	return data.filter((item, index) => {
		if (item.band === undefined || item.band < 1 || item.band > 16) {
			self.log('warn', 'Invalid band number at Object ' + index)
			return false
		}
		if(item.type === undefined || item.type < 1 || item.type > 5){
			self.log('warn', 'Invalid EQ type at Object ' + index)
			return false
		}
		if(item.bypass === undefined || typeof item.bypass !== 'boolean'){
			self.log('warn', 'Invalid bypass at Object ' + index)
			return false
		}
		switch (item.type) {
			case 1:
				if(item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000){
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if(item.q === undefined || item.q < 0.50 || item.q > 25){
					self.log('warn', 'Invalid Q at Object ' + index)
					return false
				}
				if(item.gain === undefined || item.gain < -18 || item.gain > 12){
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 2:
				if(item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000){
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if(item.q === undefined || item.q < 0.50 || item.q > 25){
					self.log('warn', 'Invalid Q at Object ' + index)
					return false
				}
				break
			case 3:
				if(item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000){
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if(item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4){
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if(item.gain === undefined || item.gain < -18 || item.gain > 12){
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 4:
				if(item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000){
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if(item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4){
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if(item.gain === undefined || item.gain < -18 || item.gain > 12){
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 5:
				if(item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000){
					self.log('warn', 'Invalid frequency 1 at Object ' + index)
					return false
				}
				if(item.freq2 === undefined || item.freq2 < 20 || item.freq2 > 20000){
					self.log('warn', 'Invalid frequency 2 at Object ' + index)
					return false
				}
				if(item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4){
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if(item.slope2 === undefined || item.slope2 < 1 || item.slope2 > 4){
					self.log('warn', 'Invalid slope 2 at Object ' + index)
					return false
				}
				if(item.gain === undefined || item.gain < -18 || item.gain > 12){
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
		}
		return true;
	})
}

const speakerarray = ["Q1","Q7","Q-SUB","C7-TOP","C7-SUB","Linear","E0","E3","E9","Not available","C3","C4-TOP","C4-SUB","C6","E12-SUB","E18-SUB","Ci45","Ci60","Ci80","Ci90","M2","F1222","E1","B2-SUB","B1-SUB","MAX act.","F1220","F2","Q10","M1220","J8 Arc","J8 Line","J12 Arc","J-SUB","MAX","M4","M4 act.","Q1 Line","E8","E12","E15-SUB","E12-X","E3-X","E12-D","E12-DX","J12 Line","J-INFRA","T10 PS","T10 Arc","T10 Line","T-SUB","B4-SUB","E8-X","M6","M6 act.","E6","4S","5S","8S","10S/A","10S/A-D","10ADArc","10ADLin","12S","12S-D","18S-SUB","27S-SUB","12S-SUB","10A Arc","10A Lin","E4","E5","V8 Arc","V8 Line","V-SUB","V12 Arc","V12 Line","16C","24C","24C-E","Y7P","Y10P","B6-SUB","Y8 Arc","Y8 Line","Y12 Arc","Y12 Line","Y-SUB","MAX2","V7P","V10P","J8 AP","J12 AP","J-SUB AP","V8 AP","V12 AP","V-SUB AP","Y8 AP","Y12 AP","Y-SUB AP","B22-SUB","B6-INF","T10 AP","T-SUB AP","24S","24S-D","21S-SUB","GSL8 Arc","GSL8 Line","GSL8 AP","GSL12 Arc","GSL12 Line","GSL12 AP","SL-SUB","SL-SUB AP","KSL8 Arc","KSL8 Line","KSL8 AP","KSL12 Arc","KSL12 Line","KSL12 AP","B8-SUB","AL60 PS","AL60 Out","AL60 In","AL60 AP","AL90 PS","AL90 Out","AL90 In","AL90 AP","KSL-SUB","KSL-SUB Fln","KSL-SUB AP","44S","XSL8 Arc","XSL8 Line","XSL8 AP","XSL12 Arc","XSL12 Line","XSL12 AP","XSL-SUB","XSL-SUB Fln","XSL-SUB AP"]
export default speakerarray