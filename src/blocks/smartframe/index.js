// Import wp dependencies
const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

import './styles.editor.scss';
// Import block dependencies
import attributes from './attributes';
import edit from './edit.js';
import blockIcon from './icon';
import save from './save';

// Register Block
registerBlockType('greenshift-blocks/smartframe', {
	title: __('Smart Iframe Embedding', 'greenshift-smart-code-ai'),
	description: __('Better iframe', 'greenshift-smart-code-ai'),
	icon: blockIcon,
	category: 'GreenShift',
	category: 'greenShiftCodeAi',
	keywords: ['embedding', 'iframe', 'greenshift'],
	supports: {
		align: ['wide', 'full']
	},
	// Define attributes
	attributes: attributes,
	edit: edit,
	save: save,
});
