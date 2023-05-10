import { __ } from '@wordpress/i18n';
import { useContext, useState, useRef, useEffect } from '@wordpress/element';
import { BlockControls, PlainText, useBlockProps } from '@wordpress/block-editor';
import { ToolbarButton, Disabled, ToolbarGroup } from '@wordpress/components';
import Preview from './preview';
import Gspbcode from '../../components/gspbcode';


function edit(props) {

	const { attributes, setAttributes, className, isSelected  } = props;
	const { htmlcontent, csscontent, scriptcontent } = attributes; 

	const [ codeMode, setCodeMode ] = useState( 'html' );
	const [ collapseMode, setCollapseMode ] = useState( false );

	let DefaultStyle = {
		maxHeight: 40,
		overflow: 'auto'
	};

	const [ collapseStyle, setCollapseStyle ] = useState( DefaultStyle );

	const targetCoderef = useRef();

	let blockClassName = `gspb-customhtml ${(typeof className !== 'undefined' && className != 'undefined') ? className : ''}`;

	const codeValueHandler = ( code ) => {
		if( codeMode === 'html' ){
			setAttributes( { htmlcontent: code } );
		}
		if( codeMode === 'css' ){
			setAttributes( { csscontent: code } );
		}
		if( codeMode === 'script' ){
			setAttributes( { scriptcontent: code } );
		}
	}

	useEffect( () => {
		if( targetCoderef?.current ){
			let newHeight = targetCoderef?.current?.scrollHeight ?  targetCoderef.current.scrollHeight : '100%';
			newHeight = codeMode === "preview" ? '100%' : newHeight;
			const newStyles = {
				maxHeight: collapseMode ? newHeight : 40,
				overflow: 'auto'
			};	
			setCollapseStyle( newStyles );
		} 
	},[ codeMode, collapseMode, htmlcontent, csscontent, scriptcontent ]);

	let codeContent = htmlcontent;
	let langauge = 'html';

	if( codeMode === 'html' ){
		codeContent = htmlcontent;
		langauge = 'html';

	} else if( codeMode === 'css' ){
		codeContent =  csscontent;
		langauge = 'css';

	} else if( codeMode === 'script'){
		codeContent = scriptcontent;
		langauge = 'javascript';
	}

	return (
		<div className={ blockClassName } >
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						className="components-tab-button"
						isPressed={ codeMode === 'html' ? true : false }
						onClick={ () =>  setCodeMode( 'html' ) }
					>
						HTML
					</ToolbarButton>
					<ToolbarButton
						className="components-tab-button"
						isPressed={ codeMode === 'css' ? true : false }
						onClick={ () =>  setCodeMode( 'css' ) }
					>
						CSS
					</ToolbarButton>
					<ToolbarButton
						className="components-tab-button"
						isPressed={ codeMode === 'script' ? true : false }
						onClick={ () =>  setCodeMode( 'script' ) }
					>
						SCRIPT
					</ToolbarButton>
					<ToolbarButton
						className="components-tab-button"
						isPressed={ codeMode === 'preview' ? true : false }
						onClick={ () => { setCodeMode( 'preview' ); setCollapseMode( true )} }
					>
						{ __( 'Preview' ) }
					</ToolbarButton>
				</ToolbarGroup>
				<ToolbarGroup>
					<ToolbarButton
						className="components-tab-button"
						isPressed={ collapseMode }
						onClick={ () => setCollapseMode( !collapseMode ) }
					>
						Collapse
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<div className='gspb_codeinner' ref={ targetCoderef } style={ collapseStyle }  >
				{ codeMode === 'preview' ?  (
					<Preview
						content={ htmlcontent }
						blockStyle={ [ csscontent ] }
						blockScript={ scriptcontent }
						isSelected = { isSelected }
					/>
				) : (
					<Gspbcode 
						code = { codeContent } // code content
						langauge = { langauge } // language
						onchange = { codeValueHandler }  // setter function
					/>
				)}
			</div>
		</div>
	);
}

export default edit;