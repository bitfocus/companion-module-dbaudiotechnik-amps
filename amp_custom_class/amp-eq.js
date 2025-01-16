import { RemoteControlClasses } from 'aes70'
import { define_custom_class } from 'aes70/src/controller/define_custom_class.js'
import { OcaInt8 } from 'aes70/src/OCP1/OcaInt8.js'
import { OcaFloat32 } from 'aes70/src/OCP1/OcaFloat32.js'
import { OcaParametricEQShape } from 'aes70/src/OCP1/OcaParametricEQShape.js'
import { OcaActuator } from 'aes70/src/controller/ControlClasses/OcaActuator.js';
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

export let Eq_Fg = define_custom_class(
	'Eq_Fg',
	4,
	'1.1.1',
	2,
	OcaActuator,
	[
		['SetBypass', 4, 20, [OcaInt8], [OcaInt8]]
	],
	[],
	[],
)
