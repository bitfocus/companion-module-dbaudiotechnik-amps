
import { define_custom_class } from 'aes70/src/controller/define_custom_class.js'
import { OcaInt8 } from 'aes70/src/OCP1/OcaInt8.js'
import { OcaFloat32 } from 'aes70/src/OCP1/OcaFloat32.js'
import { OcaActuator } from 'aes70/src/controller/ControlClasses/OcaActuator.js';
import { OcaDBEQShape } from './OcaDBEQShape.js'
import { OcaDBEQSlope } from './OcaDBEQSlope.js'
/**
 * Creates a custom control class.
 *
 * @param {String} name - The name of this control class.
 * @param {number} level - The level in the class hierachy.
 * @param {String} class_id - The class ID.
 * @param {number} class_version - The class version.
 * @param {Function|String|undefined} base - Class to extend. Can be either the
 *      base class, the name of a standard class or undefined, in which case
 *      the base class will be derived using the class id.
 * @param {Array} methods - List of methods.
 * @param {Array} properties - List of properties.
 * @param {Array} events - List of events.
 */

export let OcaFilterDB = define_custom_class(
	'OcaFilterDB',
	4,
	'1.1.1',
	2,
	OcaActuator,
	[
		['GetPreFrequency', 4, 1, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
		['SetPreFrequency', 4, 2, [OcaFloat32], []],
		['GetShape', 4, 3, [], [OcaDBEQShape]],
		['SetShape', 4, 4, [OcaDBEQShape], []],
		['GetWidthParameter', 4, 5, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
		['SetWidthParameter', 4, 6, [OcaFloat32], []],
		['GetInbandGain', 4, 7, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
		['SetInbandGain', 4, 8, [OcaFloat32], []],
		['GetPreSlope', 4, 9, [], [OcaDBEQSlope]],
		['SetPreSlope', 4, 10, [OcaDBEQSlope], []],
		['GetSecFrequency', 4, 11, [], [OcaFloat32, OcaFloat32, OcaFloat32]],
		['SetSecFrequency', 4, 12, [OcaFloat32], []],
		['GetSecSlope', 4, 17, [], [OcaDBEQSlope]],
		['SetSecSlope', 4, 18, [OcaDBEQSlope], []],
		['SetBypass', 4, 20, [OcaInt8], [OcaInt8]],
	],
	[
		['PreFrequency', [OcaFloat32], 4, 1, false, false, null],
		['Shape', [OcaDBEQShape], 4, 2, false, false, null],
		['WidthParameter', [OcaFloat32], 4, 3, false, false, ['Q']],
		['InbandGain', [OcaFloat32], 4, 4, false, false, null],
		['PreSlope', [OcaDBEQSlope], 4, 5, false, false, null],
		['SeqFrequency', [OcaFloat32], 4, 6, false, false, null],
		['SecSlope', [OcaDBEQSlope], 4, 9, false, false, null],
		['Bypass', [OcaInt8], 4, 10, false, false, null],
	],
	[],
)
