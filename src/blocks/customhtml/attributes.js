/**
 * Set the block attributes
 * @type {Object}
 */
const { collectionsObjects } = gspblib.helpers;
export default {
	codeMode:{
		type: "string",
		default: "html"
	},
	collapseMode:{
		type: "boolean",
		default: false
	},
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
	openairesponse: {
		type: "array",
		default: []
	},
};