/**
 * Returns the status of the Directly service
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         One of the statuses from state/help/directly/constants.js
 */
export default function getDirectlyStatus( state ) {
	return state.help.directly.status;
}
