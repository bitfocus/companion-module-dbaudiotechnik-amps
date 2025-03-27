import { combineRgb } from '@companion-module/base'
import { Types } from 'aes70'
import { eqChoice } from './helper.js'
export async function updateF(self) {
	self.setFeedbackDefinitions({
		ChannelState: {
			name: 'Muted Amp Channel Feedback',
			type: 'boolean',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'feedmute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
					],
					default: 0,
				},
			],
			callback: (feedback) => {
				if (self.ready) {
					return self.muteState[feedback.options.feedmute]
				}
			},
		},
		PowerState: {
			name: 'Power Amp Feedback',
			type: 'boolean',
			label: 'Power Amp',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: (feedback) => {
				if (self.ready) {
					return self.powerState
				}
			},
		},
		EQState: {
			name: 'Amp ´Channel EQ Bypass Feedback',
			type: 'boolean',
			label: 'EQ State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'ch',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
					],
					default: 0,
				},
				{
					id: 'eq',
					type: 'dropdown',
					label: 'EQ',
					choices: eqChoice(self.config.type),
					default: 1,
				},
			],
			callback: (feedback) => {
				if (self.ready) {
					const eqCount = self.config.type === '5D' ? 1 : 2;
					let index = (feedback.options.ch * eqCount) + feedback.options.eq;
					return self.ampEQState[index];
				}
			},
		},
		LastAmpPreset: {
			name: 'Last Amp Preset Recall',
			type: 'boolean',
			label: 'Last Preset',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'preset',
					type: 'dropdown',
					label: 'Amp Preset',
					choices: [
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
					],
					default: 1,
				},
			],
			callback: (feedback) => {
				if (self.ready) {
					return self.presetLast === feedback.options.preset
				}
			},
		},
	})
}
