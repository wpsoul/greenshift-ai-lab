/**
 * Set the block attributes
 * @type {Object}
 */

const { collectionsObjects } = gspblib.helpers;
export default {
	src: {
		type: 'string',
		default: ''
	},
	minHeight: {
		type: 'string',
		default: '500px'
	},
	title: {
		type: 'string',
		default: 'Iframe'
	},
	disablelazy: {
		type: 'boolean',
	},
	background: {
		type: 'object',
		default: collectionsObjects.background,
	},
	border: {
		type: 'object',
		default: collectionsObjects.border,
	},
	id: {
		type: 'string',
		default: null,
	},
	inlineCssStyles: {
		type: 'string',
	},
	spacing: {
		type: 'object',
		default: collectionsObjects.spacing,
	},
	responsive: {
		type: 'object',
		default: collectionsObjects.responsive
	},
	position: {
		type: 'object',
		default: collectionsObjects.position,
	},
	csstransform: {
		type: 'object',
		default: collectionsObjects.csstransform,
	},
	blockWidth: {
		type: 'object',
		default: collectionsObjects.blockWidth,
	},
	Halign: {
		type: 'string',
		default: 'flex-start',
	},
};