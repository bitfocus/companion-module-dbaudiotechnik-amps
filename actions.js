import { Types, RemoteControlClasses } from 'aes70'
import { AmpPresets } from './amp_custom_class/amp-presets.js'
import { OcaFilterDB } from './amp_custom_class/eq/OcaFilterDB.js'
import { OcaSwitch } from 'aes70/src/controller/ControlClasses/OcaSwitch.js'
import { eqBandChoice, eqBandToObjKey, eqChoice, eqChoiceByPass } from './helper.js'
import { OcaDBEQShape } from './amp_custom_class/eq/types/OcaDBEQShape.js'
import { OcaDBEQSlope } from './amp_custom_class/eq/types/OcaDBEQSlope.js'

export function updateA(self) {
	self.setActionDefinitions({
		power_action: {
			name: 'Change Power State',
			options: [
				{
					id: 'power',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 1, label: 'On' },
						{ id: 0, label: 'Off' },
						{ id: -1, label: 'Toggle' },
					],
					default: -1,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					switch (event.options.power) {
						case 0:
							self.powerObj
								.SetPosition(0)
								.then(() => {
									self.log('info', 'Amp Power Off!')
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
						case 1:
							self.powerObj
								.SetPosition(1)
								.then(() => {
									self.log('info', 'Amp Power On!')
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
						case -1:
							self.powerObj
								.GetPosition()
								.then((v) => {
									switch (v.item(0)) {
										case 0:
											self.powerObj
												.SetPosition(1)
												.then(() => {
													self.log('info', 'Amp Power On!')
												})
												.catch((err) => {
													self.log('error', err.toString())
												})
											break
										case 1:
											self.powerObj
												.SetPosition(0)
												.then(() => {
													self.log('info', 'Amp Power Off!')
												})
												.catch((err) => {
													self.log('error', err.toString())
												})
											break
									}
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
					}
				}
			},
		},
		mute_action: {
			name: 'Mute Amp Channel',
			options: [
				{
					id: 'mute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: -1,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.mute === -1) {
						self.muteObj.forEach((obj) => {
							obj
								.SetState(Types.OcaMuteState.Muted)
								.then(() => {
									self.log('info', 'Mute Ch: ' + numberToChar(event.options.mute))
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.mute]
							.SetState(Types.OcaMuteState.Muted)
							.then(() => {
								self.log('info', 'Mute Ch: ' + numberToChar(event.options.mute))
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
		unmute_action: {
			name: 'Unmute Amp Channel',
			options: [
				{
					id: 'unmute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: -1,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.unmute === -1) {
						self.muteObj.forEach((obj) => {
							obj
								.SetState(Types.OcaMuteState.Unmuted)
								.then(() => {
									self.log('info', 'Unmute Ch: ' + numberToChar(event.options.unmute))
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.unmute]
							.SetState(Types.OcaMuteState.Unmuted)
							.then(() => {
								self.log('info', 'Unmute Ch: ' + numberToChar(event.options.unmute))
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
		bypass_eq: {
			name: 'EQ Off/On',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 1, label: 'A' },
						{ id: 2, label: 'B' },
						{ id: 3, label: 'C' },
						{ id: 4, label: 'D' },
					],
					default: 1,
				},
				{
					id: 'eq',
					type: 'dropdown',
					label: 'EQ Number',
					choices: eqChoiceByPass(self.type),
					default: 'eq1',
				},
				{
					id: 'bypass_eq',
					type: 'checkbox',
					label: 'ON/OFF',
					default: false,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (self.ampEQs.has(event.options.channel)) {
						self.ampEQs.get(event.options.channel)[event.options.eq].SetPosition(event.options.bypass_eq)
					}
				}
			}
		},
		bypass_eq_band: {
			name: 'EQ Band Off/On',
			options: [
				{
					id: 'channel',
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
					label: 'EQ Number',
					choices: eqChoice(self.type),
					default: 0,
				},
				{
					id: 'eqband',
					type: 'dropdown',
					label: 'Channel',
					choices: eqBandChoice(self.type),
					default: 1,
				},
				{
					id: 'bypass_band',
					type: 'checkbox',
						label: 'ON/OFF',
					default: false,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					const bandCount = self.config.type === '5D' ? 8 : 16;
					const channelOffset = bandCount *2;
					const bandID = event.options.eqband + (event.options.eq*bandCount) + (event.options.channel* channelOffset);
					self.log("debug",event.options.eqband + " : "+ event.options.eq + " : " + event.options.channel + " : " + bandCount);
					let key = eqBandToObjKey(bandID, self.type);
					self.log("debug",key);
					if (self.ampEqAgents.get(key.toString()) !== undefined) {
							self.ampEqAgents.get(key.toString()).SetBypass(event.options.bypass_band);
					}
				}
			},
		},
		clear_eq_band: {
			name: 'EQ Clear Band',
			options: [
				{
					id: 'channel',
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
					label: 'EQ Number',
					choices: eqChoice(self.type),
					default: 0,
				},
				{
					id: 'eqband',
					type: 'dropdown',
					label: 'Channel',
					choices: eqBandChoice(self.type),
					default: 1,
				},
			],
			callback: async (event) => {
				if (self.ready) {
						self.log("debug","yes")
						const bandCount = self.config.type === '5D' ? 8 : 16;
						const channelOffset = bandCount *2;
						const bandID = event.options.eqband + (event.options.eq*bandCount) + (event.options.channel* channelOffset);
						self.log("debug",event.options.eqband + " : "+ event.options.eq + " : " + event.options.channel + " : " + bandCount);
						self.log("debug",event.options.eqband + (event.options.eq*bandCount) + (event.options.channel* channelOffset));

						let key = eqBandToObjKey(bandID, self.type);
						self.log("debug",key);
						const eq = self.ampEqAgents.get(key.toString());
						if (eq instanceof OcaFilterDB) {
							eq.SetBypass(false);
							eq.SetShape(OcaDBEQShape.PEQ);
							eq.SetPreFrequency(1000)
							eq.SetInbandGain(0)
							eq.SetWidthParameter(0.70)
							eq.SetPreSlope(OcaDBEQSlope.SIX_dB);
							eq.SetSecFrequency(2000);
							eq.SetSecSlope(OcaDBEQSlope.SIX_dB);
						}else {
							self.log("warn", "EQ band not found");
						}
				}
			}
		},
		toggelmute_action: {
			name: 'Toggle Amp Channel',
			options: [
				{
					id: 'togglemute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: -1,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.togglemute === -1) {
						self.muteObj.forEach((obj, index) => {
							obj
								.GetState()
								.then((v) => {
									if (v === Types.OcaMuteState.Muted) {
										obj
											.SetState(Types.OcaMuteState.Unmuted)
											.then(() => {
												self.log('info', 'Unmute Ch: ' + numberToChar(index))
											})
											.catch((err) => {
												self.log('error', err.toString())
											})
									} else {
										obj
											.SetState(Types.OcaMuteState.Muted)
											.then(() => {
												self.log('info', 'Mute Ch: ' + numberToChar(index))
											})
											.catch((err) => {
												self.log('error', err.toString())
											})
									}
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.togglemute]
							.GetState()
							.then((v) => {
								if (v === Types.OcaMuteState.Muted) {
									self.muteObj[event.options.togglemute]
										.SetState(Types.OcaMuteState.Unmuted)
										.then(() => {
											self.log('info', 'Unmute Ch: ' + numberToChar(event.options.togglemute))
										})
										.catch((err) => {
											self.log('error', err.toString())
										})
								} else {
									self.muteObj[event.options.togglemute]
										.SetState(Types.OcaMuteState.Muted)
										.then(() => {
											self.log('info', 'Mute Ch: ' + numberToChar(event.options.togglemute))
										})
										.catch((err) => {
											self.log('error', err.toString())
										})
								}
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
		reCallAmpPreset_action: {
			name: 'Recall Amp Preset',
			options: [
				{
					id: 'amp_preset',
					type: 'dropdown',
					label: 'AmpPreset Number',
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
			callback: async (event) => {
				if (self.presetStates[event.options.amp_preset - 1]) {
					if (self.ampPresetAgent instanceof AmpPresets) {
						self.ampPresetAgent
							.SetPreset(event.options.amp_preset)
							.then(() => {
								self.log('info', 'Amp Preset ' + event.options.amp_preset + ' recalled successfully!')
							})
							.catch((err) => {
								self.log('error', 'Error recall Amp Preset:', error)
							})
					}
				} else {
					self.log(
						'info',
						'Selected preset cannot be recalled! \n No preset saved on slot: ' + event.options.amp_preset,
					)
				}
			},
		},
		loadAPpreset_action: {
			name: 'Load Array Processing Preset (D20)',
			options: [
				{
					id: 'APspeaker',
					type: 'dropdown',
					label: 'Speaker',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: -1,
				},
				{
					id: 'APpreset',
					type: 'dropdown',
					label: 'Preset Number',
					choices: [
						{ id: 0, label: '1 (bypass)' },
						{ id: 1, label: '2' },
						{ id: 2, label: '3' },
						{ id: 3, label: '4' },
						{ id: 4, label: '5' },
						{ id: 5, label: '6' },
						{ id: 6, label: '7' },
						{ id: 7, label: '8' },
						{ id: 8, label: '9' },
						{ id: 9, label: '10' },
					],
					default: 0,
				},
			],
			callback: async (event) => {
				// ideally, one would not use the aes70 object numbers, but the roles ArrayProcessing/ArrayProcessing_Enable1 to 40 to be compatible with other amps, where Enable1 is speaker a preset 1, Enable5 speaker a preset 2 etc.
				const startONo = 269521410
				const channelOffset = 32768
				const presetOffset = 1048576
				try {
					if (event.options.APspeaker === -1) {
						// All speakers selected
						for (let i = 0; i < 4; i++) {
							const switchID = startONo + event.options.APpreset * presetOffset + i * channelOffset
							const fanSwitch = new RemoteControlClasses.OcaSwitch(switchID.toString(), self.remoteDevice)
							await fanSwitch.SetPosition(1)
							self.log('info', 'Switch ' + switchID + ' set to ON')
						}
					} else {
						// Individual speaker selected
						const switchID = startONo + event.options.APpreset * presetOffset + event.options.APspeaker * channelOffset
						const fanSwitch = new RemoteControlClasses.OcaSwitch(switchID.toString(), self.remoteDevice)
						await fanSwitch.SetPosition(1)
						self.log('info', 'Switch ' + switchID + ' set to ON')
					}
				} catch (error) {
					self.log('error', 'Error setting switch position:', error)
				}
				// }
			},
		},
	})
}

function numberToChar(num) {
	switch (num) {
		case 0:
			return 'A'
		case 1:
			return 'B'
		case 2:
			return 'C'
		case 3:
			return 'D'
		case -1:
			return 'All'
	}
}
