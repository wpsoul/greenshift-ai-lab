import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button} from '@wordpress/components';
import { useState } from '@wordpress/element';

function edit(props) {

	const { attributes, className } = props;
	const {
		id
	} = attributes;

	let blockClassName = `gspb-dynamic-selector ${blockId} ${(typeof className !== 'undefined' && className != 'undefined') ? className : ''}`;
	

    const [ cssStyle, setCssStyle ] = useState('');

	return (
		<>
			<InspectorControls>

			</InspectorControls>
			
			<div className={blockClassName}>Css Selector Builder</div>
		</>
	);
}

export default edit;