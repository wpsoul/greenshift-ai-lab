/**
 * Icon box Block
 */

// Import Styles
import './styles.editor.scss';

// Import wp dependencies
const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

// Import block dependencies
import attributes from './attributes';
import edit from './edit.js';
import blockIcon from './icon';
import save from './save';


// Register Block
registerBlockType('greenshift-blocks/smartcode', {
	title: __('Smart Code Block'),
	description: __('Smart code maker with AI'),
	icon: blockIcon,
	category: 'greenShiftCodeAi',
	keywords: ['code', 'AI', 'scripts', 'html', 'css', 'javascript'],

	// Define attributes
	attributes: attributes,
	edit,
	save
});
