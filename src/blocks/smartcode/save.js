/**
 * WordPress dependencies
 */
import { RawHTML } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

export default function save( props ) {
    const blockProps = useBlockProps.save({
		className: `${props.attributes.prettyform ? 'gspb-prettyform ' : ''}gspb-smartcode`
    });
	return <div {...blockProps}><RawHTML>{ props.attributes.htmlcontent }</RawHTML></div>;
}