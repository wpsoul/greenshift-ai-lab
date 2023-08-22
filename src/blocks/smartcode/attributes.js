/**
 * Set the block attributes
 * @type {Object}
 */

export default {
	codeMode:{
		type: "string",
		default: "html"
	},
	collapseMode:{
		type: "boolean",
		default: false
	},
	prettyform:{
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
	phpcontent: {
		type: "string",
		default: "",
	},
	phpcontentregistered: {
		type: "string",
		default: "",
	},
	scriptcontent: {
		type: "string",
		default: ""
	},
	openairesponse: {
		type: "array",
		default: []
	},
	onlyphp: {
		type: "boolean",
	},
	snippetID: {
		type: "number",
	},
	executeSnippet: {
		type: "boolean",
		default: false
	},
	isFinished: {
		type: "boolean",
	},
};