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