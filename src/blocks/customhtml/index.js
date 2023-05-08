/**
 * Icon box Block
 */

// Import Styles
import './editor.scss';

// Import wp dependencies
const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

// Import block dependencies
import attributes from './components/attributes';
import edit from './edit.js';
import blockIcon from './components/icon';


// Register Block
registerBlockType('greenshift-blocks/spline3d', {
	title: __('Custom code builder with AI'),
	description: __('Smart code maker'),
	icon: blockIcon,
	category: 'greenShiftAi',
	keywords: [__('code'), __('AI'), __('scripts')],

	// Define attributes
	attributes: attributes,

	edit,

	save(props) {
		// Save container
		return null;
	},
});
