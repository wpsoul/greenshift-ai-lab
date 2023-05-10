/**
 * Set the block attributes
 * @type {Object}
 */
const { collectionsObjects } = gspblib.helpers;
export default {
	htmlcontent: {
		type: "string",
		default: ""
	},
	csscontent: {
		type: "string",
		default: ""
	},
	scriptcontent: {
		type: "string",
		default: ""
	},
};