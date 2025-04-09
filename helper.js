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
export function eqType(type) {
	return [
		{ id: 1, label: 'PEQ' },
		{ id: 2, label: 'Notch' },
		{ id: 3, label: 'LowShelv' },
		{ id: 4, label: 'HighShelv' },
		{ id: 5, label: 'Asymetric' }
	]
}

export function eqSlope(type) {
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