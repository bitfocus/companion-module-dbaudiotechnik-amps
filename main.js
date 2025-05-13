import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { updateA } from './actions.js'
import { updateF } from './feedbacks.js'
import { updateV } from './variables.js'
import { AmpPresets } from './amp_custom_class/amp-presets.js'
import { OcaFilterDB } from './amp_custom_class/eq/OcaFilterDB.js'
import { TCPConnection, RemoteDevice, RemoteControlClasses, Types } from 'aes70'
import { initAmpEQStateArray } from './helper.js'

class ModuleInstance extends InstanceBase {

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.port = this.getPortFromType(config.type)
		this.type = config.type
		this.info = {}
		this.muteObj = []
		this.muteState = [true, true, true, true]
		this.powerState = true
		this.powerHours = 0
		this.powerObj = {}
		this.presetNames = []
		this.presetStates = []
		this.channellevel = []
		this.ampPresetAgent = {}
		this.ampEqAgents = new Map();
		this.ampEQs = new Map();
		this.ampDelays = [];
		this.ampDelayStateObjs = [];
		this.ampDelayStates = [false, false, false, false]
		this.ampEQState = initAmpEQStateArray(this.type);
		this.ampInputGainStateObj = {}
		this.ampInputGainState = false
		this.ampSpeakerIDNames = [];
		this.ampChannelSpeakerID = [0,0,0,0];
		this.presetLast = undefined
		this.ready = true
		this.updateActions(InstanceStatus.Connecting)
		this.updateVariableDefinitions()
		this.log('info', 'AES70 Device Connection at port: ' + this.port)
		this.connect()
	}

	getPowerHourPath(type) {
		switch (type) {
			case '5D':
				return 'Log_Box/Log_PowerOnHours'
			default:
				return 'Log/Log_PowerOnHours'
		}
	}

	getPowerPath(type) {
		switch (type) {
			case '5D':
				return 'Settings_Box/Settings_PwrOn'
			default:
				return 'Settings/Settings_PwrOn'
		}
	}

	getConfigPath(type) {
		switch (type) {
			case '5D':
				return 'Config_Box'
			default:
				return 'Config'
		}
	}

	getSettingsPath(type) {
		switch (type) {
			case '5D':
				return 'Settings_Box'
			default:
				return 'Settings'
		}
	}

	getEqBandPath(type) {
		switch (type) {
			case '5D':
				return 'Eq_Box/Eq_Data'
			default:
				return 'Eq/Eq_Fg'
		}
	}

	getPortFromType(type) {
		switch (type) {
			case '5D':
				return 50014
			case '40D':
				return 50014
			case 'D40':
				return 50014
			case 'custom':
				return this.config.port
			default:
				return 30013
		}
	}

	setAmpPowerHours(hours) {
		this.powerHours = hours
		this.setVariableValues({ amp_power_hours: this.powerHours })
	}

	setAmpPower(power, type) {
		let powerType = false
		switch (type) {
			case '5D':
				powerType = power
				break
			default:
				powerType = !power
		}
		this.powerState = powerType
		this.checkFeedbacks('PowerState')
		this.setVariableValues({ amp_power: this.powerState })
	}

	setAmpMute(index, mute) {
		this.muteState[index] = mute
		this.checkFeedbacks('ChannelState')
		let varindex = `amp_mute_${index}`
		this.setVariableValues({ [varindex]: mute })
	}

	setAmpEqBypass(ch, eq, bypass) {
		switch (eq) {
			case 1:
				this.ampEQState[ch].eq1 = bypass
				break
			case 2:
				this.ampEQState[ch].eq2 = bypass
				break
		}
		this.checkFeedbacks('EQState')
		let varindex = `amp_ch_${ch}_eq_${eq}`
		this.setVariableValues({ [varindex]: bypass })
	}

	setAmpDelay(ch, delay) {
		this.log('debug', 'Setting Delay for ' + ch + ' to ' + delay)
		this.ampDelays[ch].SetSetting(delay).then((v) => {
			let varindex = `amp_delay_ch_${ch}`
			this.setVariableValues({ [varindex]: delay })
		});
	}

	setAmpDelayState(ch, state) {
		this.log('debug', 'Setting Delay Bypass for ' + ch + ' to ' + state)
		this.ampDelayStateObjs[ch].SetPosition(state).then((v) => {
			let varindex = `amp_delay_bypass_ch_${ch}`
			this.setVariableValues({ [varindex]: state })
		});
	}

	setAmpChannelLevel(ch, level) {
		this.log('debug', 'Setting Channel Level for ' + ch + ' to ' + level)
		this.channellevel[ch].SetGain(level).then((v) => {
			let varindex = `amp_channel_level_${ch}`
			this.setVariableValues({ [varindex]: level })
		});
	}

	setAmpInputGainEnable(state) {
		this.log('debug', 'Setting Input Gain Enable to ' + state)
		this.ampInputGainStateObj.SetPosition(state).then((v) => {
			let varindex = `amp_input_gain_enable`
			this.ampInputGainState = state;
			this.setVariableValues({ [varindex]: state })
			this.checkFeedbacks('InputGainEnable')
		}).catch((err) => {
			this.log("error", JSON.stringify(err))
		});
	}


	readAmpPresetNames(map) {
		if (this.type == '5D') {
			return
		}

		for (let i = 1; i <= 15; i++) {
			const no = map.get('Preset/Preset_PresetName' + i)
			no.GetSetting().then((v) => {
				this.presetNames[i - 1] = v
				let varindex = `amp_preset_${i}`
				this.setVariableValues({ [varindex]: v })
			})
			no.OnSettingChanged.subscribe((v) => {
				this.presetNames[i - 1] = v
				let varindex = `amp_preset_${i}`
				this.setVariableValues({ [varindex]: v })
			})
		}
	}

	readAmpPresetStates(map) {
		if (this.type == '5D') {
			return
		}

		for (let i = 1; i <= 15; i++) {
			const so = map.get('Preset/Preset_PresetState' + i)
			so.GetReading().then((v) => {
				this.presetStates[i - 1] = v
				let varindex = `amp_preset_state_${i}`
				this.setVariableValues({ [varindex]: v })
			})
			so.OnReadingChanged.subscribe((v) => {
				this.presetStates[i - 1] = v
				let varindex = `amp_preset_state_${i}`
				this.setVariableValues({ [varindex]: v })
			})
		}
	}

	readAmpPresetLastReCall(map) {
		if (this.type == '5D') {
			return
		}

		let lastcallstates = 0
		for (let i = 1; i <= 15; i++) {
			const ro = map.get('Preset/Preset_LastPreset' + i)
			ro.GetReading().then((v) => {
				if (v['values'][0] > 0) {
					lastcallstates = i
				}

				if (i === 15) {
					this.setVariableValues({ amp_preset_last: lastcallstates })
					this.presetLast = lastcallstates
					this.checkFeedbacks('LastAmpPreset')
				}
			})
		}
	}

	readAmpSpeakerIDs(map){
		const speakerID = map.get('Config/Config_SpeakerId1');
		speakerID.GetPositionNames().then((v) => {
			this.ampSpeakerIDNames = v;
			this.setVariableValues({ amp_speaker_names: JSON.stringify(v) });
		})
		for(let i = 1; i <= 4; i++) {
			const id = map.get('Config/Config_SpeakerId' + i);
			id.GetPosition().then((v) => {
				this.ampChannelSpeakerID[i-1] = v.item(0);
				let varindex = `amp_speaker_id_ch_${i-1}`;
				let varname = `amp_speaker_name_ch_${i-1}`;
				this.setVariableValues({ [varindex]: v.item(0), [varname]: this.ampSpeakerIDNames[v.item(0)-1] });
			})
			id.OnPositionChanged.subscribe((v) => {
				this.ampChannelSpeakerID[i-1] = v.item(0);
				let varindex = `amp_speaker_id_ch_${i-1}`;
				let varname = `amp_speaker_name_ch_${i-1}`;
				this.setVariableValues({ [varindex]: v.item(0), [varname]: this.ampSpeakerIDNames[v.item(0)-1] });
			})
		}
	}

	readAmpDelay(map) {
		for(let i = 1; i <= 4; i++) {
			const delay = map.get('Config/Config_Delay' + i);
			this.ampDelays.push(delay);
			delay.GetSetting().then((v) => {
				let varindex = `amp_delay_ch_${i-1}`;
				this.setVariableValues({[varindex]: v.item(0).toFixed(5)});
			})
			delay.OnSettingChanged.subscribe((v) => {
				let varindex = `amp_delay_ch_${i-1}`;
				this.log("debug", "Setting Delay for " + varindex + " to " + JSON.stringify(v));
				this.setVariableValues({[varindex]: v.toFixed(5)});
			})
		}
	}

	readAmpDelayState(map) {
		for (let i = 1; i <= 4; i++) {
			const delaystate = map.get('Config/Config_DelayOn' + i)
			this.ampDelayStateObjs.push(delaystate)
			delaystate.GetPosition().then((v) => {
				this.ampDelayStates[i-1] = v.item(0) === 1
				this.checkFeedbacks('DelayState')
				let varindex = `amp_delay_bypass_ch_${i - 1}`
				this.setVariableValues({ [varindex]: v.item(0) === 1 })
			})
			delaystate.OnPositionChanged.subscribe((v) => {
				this.ampDelayStates[i-1] = v === 1
				this.checkFeedbacks('DelayState')
				let varindex = `amp_delay_bypass_ch_${i - 1}`
				this.setVariableValues({ [varindex]: v === 1 })
			});
		}
	}

	readAmpChannelLevel(map) {
		for (let i = 1; i <= 4; i++) {
			const channel = map.get(this.getConfigPath(this.type) +'/Config_PotiLevel' + i)
			this.channellevel.push(channel);
			channel.GetGain().then((v) => {
				this.setVariableValues({ [`amp_channel_level_${i}`]: v.item(0) })
			})
			channel.OnGainChanged.subscribe((v) => {
				this.setVariableValues({ [`amp_channel_level_${i}`]: v })
			})
		}
	}

	readAmpInputGainEnable(map) {
		const inputgain = map.get(this.getSettingsPath(this.type) + '/Settings_InputGainEnable')
		this.ampInputGainStateObj = inputgain
		inputgain.GetPosition().then((v) => {
			this.setVariableValues({ amp_input_gain_enable: v.item(0) === 1 })
			this.ampInputGainState = v.item(0) === 1;
			this.checkFeedbacks('InputGainEnable')
		})
		inputgain.OnPositionChanged.subscribe((v) => {
			this.setVariableValues({ amp_input_gain_enable: v === 1 })
			this.ampInputGainState = v === 1;
			this.checkFeedbacks('InputGainEnable')
		})
	}

	setAmpAPpreset(APpreset) {
		// ap preset variables and feedback should get set here
	}

	connect() {
		TCPConnection.connect({
			host: this.config.host,
			port: this.port,
		})
			.then((con) => {
				this.log('info', 'Date: ' + new Date().toISOString() + ' | AES70 Device Connected')
				this.aescon = con
				this.remoteDevice = new RemoteDevice(con)
				this.remoteDevice.set_keepalive_interval(1)
				this.remoteDevice.on('close', (args) => {
					this.log('warn', 'Date: ' + new Date().toISOString() + ' | AES70 Device Connection closed!')
					this.ready = false
					this.log(
						'warn',
						'Date: ' + new Date().toISOString() + ' | AES70 Device Connection closed  try reconnect in 10 Seconds!',
					)
					this.updateStatus(InstanceStatus.ConnectionFailure)
					setTimeout(() => {
						this.updateStatus(InstanceStatus.Connecting)
						this.aescon.cleanup()
						this.connect()
					}, 10000)
				})

				this.remoteDevice.on('error', (args) => {
					this.log('warn', 'Date: ' + new Date().toISOString() + ' | AES70 Device Connection closed with Error!')
					this.log('error', JSON.stringify(args))
					this.ready = false
					this.log(
						'warn',
						'Date: ' + new Date().toISOString() + ' | AES70 Device Connection Error try reconnect in 10 Seconds!',
					)
					setTimeout(() => {
						this.updateStatus(InstanceStatus.UnknownError, JSON.stringify(args))
						this.destroy()
						this.connect()
					}, 10000)
				})
				if (this.ready) {

					// Add custom classes
					this.remoteDevice.add_control_classes([AmpPresets])
					this.remoteDevice.add_control_classes([OcaFilterDB])
					//===================

					this.updateActions() // export actions
					this.updateFeedbacks() // export feedbacks

					this.remoteDevice.DeviceManager.GetModelDescription().then((value) => {
						this.info['type'] = value.Name
						this.info['version'] = value.Version
						this.remoteDevice.DeviceManager.GetDeviceName()
							.then((name) => {
								this.info['name'] = name
							})
							.then(() => {
								this.setVariableValues({
									amp_type: this.info.type,
									amp_name: this.info.name,
									amp_firmware: this.info.version,
								})
							})
					})
					this.remoteDevice.get_role_map().then((map) => {

						this.readAmpSpeakerIDs(map);
						this.readAmpDelay(map);
						this.readAmpDelayState(map);
						this.readAmpChannelLevel(map);
						this.readAmpInputGainEnable(map);
						this.readAmpPresetNames(map)
						this.readAmpPresetStates(map)
						this.readAmpPresetLastReCall(map)
						if (map.get(this.getPowerHourPath(this.type))) {
							this.intervalPower = setInterval(() => {
								let powerh = map.get(this.getPowerHourPath(this.type))
								powerh.GetReading().then((v) => {
									this.setAmpPowerHours(v.values[0])
								})
							}, 10000)
						}
						if (map.get(this.getPowerPath(this.type))) {
							this.powerObj = map.get(this.getPowerPath(this.type))
							this.powerObj.GetPosition().then((v) => {
								this.setAmpPower(v.item(0) === 0)
								this.checkFeedbacks('PowerState')
							})
							this.powerObj.OnPositionChanged.subscribe((val) => {
								this.setAmpPower(val === 0)
								this.checkFeedbacks('PowerState')
							})
						}

						//Ch Count
						const channelCount = 4;
						//Eq Count
						const eqCount = 2
						//Eq Band Count

						let eqBandCount = this.config.type === '5D' ? 8 : 16;

						for(let i = 1; i <= channelCount; i++) {
							const eq1 = map.get(this.getConfigPath(this.type) + '/Config_Eq1Enable' + i);
							eq1.GetPosition().then((v) => {
								this.setAmpEqBypass(i-1,1,v.item(0) === 0)
								this.checkFeedbacks('EQState')
							})
							eq1.OnPositionChanged.subscribe((val) => {
								this.setAmpEqBypass(i-1,1,val === 0)
								this.checkFeedbacks('EQState')
							});
							if(this.config.type === '5D') {
								this.ampEQs.set(i,{eq1:eq1});
								continue;
							}
							const eq2 = map.get(this.getConfigPath(this.type) + '/Config_Eq2Enable' + i);
							eq2.GetPosition().then((v) => {
								this.setAmpEqBypass(i-1,2,v.item(0) === 0)
								this.checkFeedbacks('EQState')
							})
							eq2.OnPositionChanged.subscribe((val) => {
								this.setAmpEqBypass(i-1,2,val === 0)
								this.checkFeedbacks('EQState')
							});
							this.ampEQs.set(i,{eq1:eq1,eq2:eq2});
						}

						this.log("debug", "Found " + this.ampEQs.size + " EQs");

						let count = 1

						for(let chSplit = 0; chSplit < (channelCount * eqCount *  eqBandCount); chSplit++) {
							let key = this.getEqBandPath(this.type) + count;
							const eqAgent = map.get(key.toString())
							if (eqAgent) {
								this.ampEqAgents.set("band_"+ count,eqAgent);
							}
							count++;
						}

						this.log("debug", "Found " + this.ampEqAgents.size + " EQ Agents");

						if (this.type !== '5D') {
							this.ampPresetAgent = map.get('AmpPresets')
						}

					})
					this.remoteDevice.get_device_tree().then((tree) => {
						var i = 0
						tree.forEach((treeobj) => {
							if (Array.isArray(treeobj)) {
								treeobj.forEach((obj) => {
									obj.GetClassIdentification().then((cls) => {
										if (cls.ClassID === RemoteControlClasses.OcaMute.ClassID) {
											this.muteObj.push(obj)
											if (i === 3) {
												this.muteObj.forEach((v, index) => {
													v.GetState().then((v) => {
														this.setAmpMute(index, v === Types.OcaMuteState.Muted)
														this.checkFeedbacks('ChannelState')
													})
													v.OnStateChanged.subscribe((val) => {
														this.setAmpMute(index, val == 1)
														this.checkFeedbacks('ChannelState')
													})
												})
											}
											i++
										}
									})
								})
							}
						})
					})
				}
				this.updateStatus(InstanceStatus.Ok)
			})
			.catch((e) => {
				this.ready = false
				this.log(
					'warn',
					'Date: ' + new Date().toISOString() + ' | AES70 Device Connection Error try reconnect in 10 Seconds!',
				)
				setTimeout(() => {
					this.connect()
					this.updateStatus(InstanceStatus.UnknownError, JSON.stringify(e))
				}, 10000)
			})
	}

	// When module gets deleted
	async destroy() {
		clearInterval(this.intervalPower)
		this.muteObj.forEach((v) => {
			v.OnStateChanged.unsubscribe()
		})
		this.presetNames.forEach((pn) => {
			pn.OnSettingChanged.unsubscribe()
		})
		this.powerObj.OnPositionChanged.unsubscribe()
		this.aescon.cleanup()
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.port = this.getPortFromType(config.type)
		this.type = config.type
		if (this.aescon) {
			this.muteObj = []
			this.aescon.cleanup()
			this.updateStatus(InstanceStatus.Connecting)
			this.connect()
		}
		this.updateVariableDefinitions()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Amp IP',
				width: 8,
				regex: Regex.IP,
				default: '169.254.0.1',
			},
			{
				id: 'type',
				type: 'dropdown',
				label: 'Amp Typ',
				width: 4,
				choices: [
					{ id: '5D', label: '5D' },
					{ id: '10D', label: '10D' },
					{ id: '30D', label: '30D' },
					{ id: '40D', label: '40D' },
					{ id: 'D20', label: 'D20' },
					{ id: 'D40', label: 'D40' },
					{ id: 'D80', label: 'D80' },
					{ id: 'custom', label: 'Custom' },
				],
				default: 'D20',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				isVisible: (options) => options['type'] == 'custom',
				regex: Regex.PORT,
				default: 50014,
			},
		]
	}

	updateActions() {
		updateA(this)
	}

	updateFeedbacks() {
		updateF(this)
	}

	updateVariableDefinitions() {
		updateV(this)
	}
}

runEntrypoint(ModuleInstance, [])
