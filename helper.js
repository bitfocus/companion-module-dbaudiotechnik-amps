export function initAmpEQStateArray(type) {
	switch (type) {
		case '5D':
			return [{ eq1: false }, { eq1: false }, { eq1: false }, { eq1: false }]
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
		{ id: 5, label: 'Asymetric' },
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
			return [{ id: 0, label: 'EQ1' }]
		default:
			return [
				{ id: 0, label: 'EQ1' },
				{ id: 1, label: 'EQ2' },
			]
	}
}

export function eqChoiceByPass(type) {
	switch (type) {
		case '5D':
			return [{ id: 'eq1', label: 'EQ1' }]
		default:
			return [
				{ id: 'eq1', label: 'EQ1' },
				{ id: 'eq2', label: 'EQ2' },
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
				{ id: 8, label: '8' },
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
		case '5D': {
			return `band_${numToBand5D(chId)}`
		}
		default: {
			return `band_${numToBand(chId)}`
		}
	}
}

export function numToBand5D(num) {
	if (!Number.isInteger(num) || num < 1 || num > 32) return null

	const n = num - 1
	return (n % 8) * 4 + Math.floor(n / 8) + 1
}

export function bandToNum5D(band) {
	if (!Number.isInteger(band) || band < 1 || band > 32) return null

	const b = band - 1
	return (b % 4) * 8 + Math.floor(b / 4) + 1
}

export function numToBand(num) {
	if (!Number.isInteger(num) || num < 1 || num > 128) return null

	const n = num - 1

	const ch = Math.floor(n / 32) + 1 //1..4
	const inCh = n % 32
	const eq = Math.floor(inCh / 16) + 1 //1..2
	const bandInEq = (inCh % 16) + 1 //1..16
	return ch + (bandInEq - 1) * 4 + (eq - 1) * 64
}

export function bandToNum(band) {
	if (!Number.isInteger(band) || band < 1 || band > 128) return null

	const b = band - 1

	const ch = (b % 4) + 1 //1..4
	const group = Math.floor(b / 4) //0..31
	const eq = Math.floor(group / 16) + 1 //1..2
	const bandInEq = (group % 16) + 1 //1..16
	return (ch - 1) * 32 + (eq - 1) * 16 + bandInEq
}

export function bandToChEqBand(bandValue, type) {
	if (!Number.isInteger(bandValue)) return null

	if (type === '5D') {
		if (bandValue < 1 || bandValue > 32) return null

		const b = bandValue - 1
		const ch = (b % 4) + 1 //1..4
		const eq = 1 // nur EQ1
		const bandEq = Math.floor(b / 4) + 1 //1..8
		return { ch, eq, bandEq }
	}

	// Default:1..128 (4 Ch,2 EQ,16 BandEq)
	if (bandValue < 1 || bandValue > 128) return null

	const b = bandValue - 1
	const ch = (b % 4) + 1 //1..4
	const eq = Math.floor(b / 64) + 1 //1..2
	const bandEq = Math.floor((b % 64) / 4) + 1 //1..16
	return { ch, eq, bandEq }
}

export function numberToFloat32Hex(number) {
	const float32Array = new Float32Array(1)
	float32Array[0] = number
	const uint32Array = new Uint32Array(float32Array.buffer)
	return uint32Array[0].toString(16).padStart(8, '0')
}

export function isJSON(str) {
	try {
		return JSON.parse(str) && !!str
	} catch (e) {
		return false
	}
}

export function filterEQData(self, data) {
	return data.filter((item, index) => {
		if (item.band === undefined || item.band < 1 || item.band > 16) {
			self.log('warn', 'Invalid band number at Object ' + index)
			return false
		}
		if (item.type === undefined || item.type < 1 || item.type > 5) {
			self.log('warn', 'Invalid EQ type at Object ' + index)
			return false
		}
		if (item.bypass === undefined || typeof item.bypass !== 'boolean') {
			self.log('warn', 'Invalid bypass at Object ' + index)
			return false
		}
		switch (item.type) {
			case 1:
				if (item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000) {
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if (item.q === undefined || item.q < 0.5 || item.q > 25) {
					self.log('warn', 'Invalid Q at Object ' + index)
					return false
				}
				if (item.gain === undefined || item.gain < -18 || item.gain > 12) {
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 2:
				if (item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000) {
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if (item.q === undefined || item.q < 0.5 || item.q > 25) {
					self.log('warn', 'Invalid Q at Object ' + index)
					return false
				}
				break
			case 3:
				if (item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000) {
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if (item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4) {
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if (item.gain === undefined || item.gain < -18 || item.gain > 12) {
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 4:
				if (item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000) {
					self.log('warn', 'Invalid frequency at Object ' + index)
					return false
				}
				if (item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4) {
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if (item.gain === undefined || item.gain < -18 || item.gain > 12) {
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
			case 5:
				if (item.freq1 === undefined || item.freq1 < 20 || item.freq1 > 20000) {
					self.log('warn', 'Invalid frequency 1 at Object ' + index)
					return false
				}
				if (item.freq2 === undefined || item.freq2 < 20 || item.freq2 > 20000) {
					self.log('warn', 'Invalid frequency 2 at Object ' + index)
					return false
				}
				if (item.slope1 === undefined || item.slope1 < 1 || item.slope1 > 4) {
					self.log('warn', 'Invalid slope 1 at Object ' + index)
					return false
				}
				if (item.slope2 === undefined || item.slope2 < 1 || item.slope2 > 4) {
					self.log('warn', 'Invalid slope 2 at Object ' + index)
					return false
				}
				if (item.gain === undefined || item.gain < -18 || item.gain > 12) {
					self.log('warn', 'Invalid gain at Object ' + index)
					return false
				}
				break
		}
		return true
	})
}

export function roundToTwo(value) {
	const num = Number(value)

	if (!isNaN(num)) {
		return Math.round(num * 100) / 100
	}

	return value
}

export function getEqBandArray(ampEQValues, ch, eq, type) {
	const result = []

	if (type === '5D') {
		const startIndex = ch - 1
		const stride = 4
		const bandCount = 8

		for (let i = 0; i < bandCount; i++) {
			const bandIndex = startIndex + i * stride
			const bandMap = ampEQValues[bandIndex]

			if (bandMap && bandMap.size > 0) {
				const bandObj = Object.fromEntries(bandMap)
				const roundedObj = {}

				for (const [key, value] of Object.entries(bandObj)) {
					roundedObj[key] = roundToTwo(value)
				}

				result.push(roundedObj)
			}
		}
	} else {
		// Standard-Amps: Stride = 4, 2 EQs, 16 Bänder pro EQ
		const startIndex = ch - 1 + (eq - 1) * 64
		const stride = 4
		const bandCount = 16

		for (let i = 0; i < bandCount; i++) {
			const bandIndex = startIndex + i * stride
			const bandMap = ampEQValues[bandIndex]

			if (bandMap && bandMap.size > 0) {
				const bandObj = Object.fromEntries(bandMap)
				const roundedObj = {}

				for (const [key, value] of Object.entries(bandObj)) {
					roundedObj[key] = roundToTwo(value)
				}

				result.push(roundedObj)
			}
		}
	}

	return result
}

export function uint8ArrayToNumber(uint8Array, format = 'uint8') {
	if (!uint8Array || uint8Array.length === 0) return null

	switch (format) {
		case 'uint8':
			return uint8Array[0]

		case 'int8':
			return new Int8Array(uint8Array.buffer, uint8Array.byteOffset, 1)[0]

		case 'uint16':
			if (uint8Array.length < 2) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getUint16(0, false)

		case 'uint16le':
			if (uint8Array.length < 2) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getUint16(0, true)

		case 'uint32':
			if (uint8Array.length < 4) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getUint32(0, false)

		case 'uint32le':
			if (uint8Array.length < 4) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getUint32(0, true)

		case 'float32':
			if (uint8Array.length < 4) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getFloat32(0, false)

		case 'float32le':
			if (uint8Array.length < 4) return null
			return new DataView(uint8Array.buffer, uint8Array.byteOffset).getFloat32(0, true)

		case 'boolean':
			return uint8Array[0] !== 0

		default:
			return uint8Array[0]
	}
}

export function parseEqPropertyChange(bandNum, value, type) {
	const arr = Array.from(value)

	if (arr.length < 3) return null

	const propertyID = arr[0]
	const dataView = arr[1]
	const changeType = arr[2]

	const uint8Array = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength)

	const bandJson = bandToChEqBand(bandNum + 1, type)

	if (eqPropertyIndexToNameType(propertyID.PropertyIndex) === undefined) {
		return null
	}

	const eqPropertyInfo = eqPropertyIndexToNameType(propertyID.PropertyIndex)

	const numValue = uint8ArrayToNumber(uint8Array, eqPropertyInfo.type)

	return {
		ch: bandJson.ch,
		eq: bandJson.eq,
		bandEq: bandJson.bandEq,
		propertyIndex: propertyID.PropertyIndex,
		propertyName: eqPropertyInfo.name,
		propertyType: eqPropertyInfo.type,
		defLevel: propertyID.DefLevel,
		data: uint8Array,
		value: numValue,
		changeType: changeType.value,
		hex: Array.from(uint8Array)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join(' '),
	}
}

export function eqPropertyIndexToNameType(propertyIndex) {
	switch (propertyIndex) {
		case 1:
			return { name: 'PreFrequency', type: 'float32' }
		case 2:
			return { name: 'Shape', type: 'uint8' }
		case 3:
			return { name: 'WidthParameter', type: 'float32' }
		case 4:
			return { name: 'InbandGain', type: 'float32' }
		case 5:
			return { name: 'PreSlope', type: 'uint8' }
		case 6:
			return { name: 'SecFrequency', type: 'float32' }
		case 9:
			return { name: 'SecSlope', type: 'uint8' }
		case 10:
			return { name: 'Bypass', type: 'boolean' }
		default:
			return undefined
	}
}

const speakerarray = [
	'Q1',
	'Q7',
	'Q-SUB',
	'C7-TOP',
	'C7-SUB',
	'Linear',
	'E0',
	'E3',
	'E9',
	'Not available',
	'C3',
	'C4-TOP',
	'C4-SUB',
	'C6',
	'E12-SUB',
	'E18-SUB',
	'Ci45',
	'Ci60',
	'Ci80',
	'Ci90',
	'M2',
	'F1222',
	'E1',
	'B2-SUB',
	'B1-SUB',
	'MAX act.',
	'F1220',
	'F2',
	'Q10',
	'M1220',
	'J8 Arc',
	'J8 Line',
	'J12 Arc',
	'J-SUB',
	'MAX',
	'M4',
	'M4 act.',
	'Q1 Line',
	'E8',
	'E12',
	'E15-SUB',
	'E12-X',
	'E3-X',
	'E12-D',
	'E12-DX',
	'J12 Line',
	'J-INFRA',
	'T10 PS',
	'T10 Arc',
	'T10 Line',
	'T-SUB',
	'B4-SUB',
	'E8-X',
	'M6',
	'M6 act.',
	'E6',
	'4S',
	'5S',
	'8S',
	'10S/A',
	'10S/A-D',
	'10ADArc',
	'10ADLin',
	'12S',
	'12S-D',
	'18S-SUB',
	'27S-SUB',
	'12S-SUB',
	'10A Arc',
	'10A Lin',
	'E4',
	'E5',
	'V8 Arc',
	'V8 Line',
	'V-SUB',
	'V12 Arc',
	'V12 Line',
	'16C',
	'24C',
	'24C-E',
	'Y7P',
	'Y10P',
	'B6-SUB',
	'Y8 Arc',
	'Y8 Line',
	'Y12 Arc',
	'Y12 Line',
	'Y-SUB',
	'MAX2',
	'V7P',
	'V10P',
	'J8 AP',
	'J12 AP',
	'J-SUB AP',
	'V8 AP',
	'V12 AP',
	'V-SUB AP',
	'Y8 AP',
	'Y12 AP',
	'Y-SUB AP',
	'B22-SUB',
	'B6-INF',
	'T10 AP',
	'T-SUB AP',
	'24S',
	'24S-D',
	'21S-SUB',
	'GSL8 Arc',
	'GSL8 Line',
	'GSL8 AP',
	'GSL12 Arc',
	'GSL12 Line',
	'GSL12 AP',
	'SL-SUB',
	'SL-SUB AP',
	'KSL8 Arc',
	'KSL8 Line',
	'KSL8 AP',
	'KSL12 Arc',
	'KSL12 Line',
	'KSL12 AP',
	'B8-SUB',
	'AL60 PS',
	'AL60 Out',
	'AL60 In',
	'AL60 AP',
	'AL90 PS',
	'AL90 Out',
	'AL90 In',
	'AL90 AP',
	'KSL-SUB',
	'KSL-SUB Fln',
	'KSL-SUB AP',
	'44S',
	'XSL8 Arc',
	'XSL8 Line',
	'XSL8 AP',
	'XSL12 Arc',
	'XSL12 Line',
	'XSL12 AP',
	'XSL-SUB',
	'XSL-SUB Fln',
	'XSL-SUB AP',
	'Not available',
	'U3N',
	'U5N',
	'U7N',
	'B10N-SUB',
	'U3',
	'U5',
	'U7',
	'B10-SUB',
	'CCL8 Arc',
	'CCL8 Line',
	'CCL8 AP',
	'CCL12 Arc',
	'CCL12 Line',
	'CCL12 AP',
	'CCL-SUB',
	'CCL-SUB Fln',
	'CCL-SUB AP',
	'42S',
	'B12-SUB',
]
export default speakerarray
