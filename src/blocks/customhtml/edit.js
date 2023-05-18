/**
 * Wordpress dependencies
*/
import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, Spinner, TextControl, ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
*/
import Preview from './preview';
import Gspbcode from '../../components/gspbcode';
import OpenAIResponse from './responselist';

function edit(props) {

	const { attributes, setAttributes, className, isSelected  } = props;
	const { codeMode, collapseMode, htmlcontent, csscontent, scriptcontent, openairesponse } = attributes; 

	const [ isLoading, setIsLoading ] = useState( false );
	const [ userInput, setUserInput ] = useState('');
	const [ conversation, setConversation ] = useState([]);
	
	const targetCoderef = useRef( null );
	const isFirstLoadRef = useRef( true );
	let blockClassName = `gspb-customhtml ${(typeof className !== 'undefined' && className != 'undefined') ? className : ''}`;

	const onchangeCodemode = ( codelangauge ) => {
		setAttributes({ codeMode: codelangauge });
	};

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
	};

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

	// call api on form submit, disable input till response is received.

	function onSubmitHandler(e){
		e.preventDefault();
		if( userInput === ''){ return ; }
		setIsLoading(true);
	
		const modifiedInput = `Please reply below question in markdown format.\n ${userInput}`;
		const inputPayload  = {
			role: 'user',
			content: modifiedInput
		};
		const apiPayload = [ ...conversation, inputPayload ];

		wp.apiFetch({
			path: `/greenshift/v1/gspb_open_ai`,
			method: 'POST',
			data: { "messages" : apiPayload }
		}).then(response => {
			const data = JSON.parse(response);
			if(data?.response){
				const responseData = JSON.parse( data.response );
				const responseString = responseData?.choices[0]?.message?.content;

				if( responseString !== '' ){
					const newResponse = {
						userInput: userInput,
						aiResponse : responseString
					}
					setConversation([ ...conversation, { role: 'assistant', content: responseString }]);
					const newResponseData = [ newResponse, ...openairesponse ];
					setAttributes( { openairesponse : newResponseData } );
				}
			}
			setUserInput('');
			setIsLoading(false);
		}).catch(error => {
			setIsLoading(false);
		});
	};

	// collapse Effect
	useEffect(() => {
		const targetEle = targetCoderef?.current;
		if ( targetEle === undefined ) return;

		if( collapseMode ){
			targetEle.style.maxHeight = targetEle.scrollHeight + 'px';
			targetEle.style.overflow = 'auto';
			setTimeout(() => {
				targetEle.style.maxHeight = '55px';
			}, 100 );
		} else {
			targetEle.style.maxHeight = targetEle.scrollHeight + 'px';
			targetEle.addEventListener('transitionend', function() {
				if (targetEle.scrollHeight === targetEle.clientHeight) {
					targetEle.style.maxHeight = '';
					targetEle.style.overflow = '';
				}
			});
			if ( isFirstLoadRef.current ) {
				targetEle.style.maxHeight = '';
				targetEle.style.overflow = '';
				isFirstLoadRef.current = false;
			}
		}
	}, [ collapseMode ])


	return (
			<div className={ blockClassName } >
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ codeMode === 'html' ? true : false }
							onClick={ () => onchangeCodemode( 'html' ) }
						>
							HTML
						</ToolbarButton>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ codeMode === 'css' ? true : false }
							onClick={ () => onchangeCodemode( 'css' ) }
						>
							CSS
						</ToolbarButton>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ codeMode === 'script' ? true : false }
							onClick={ () => onchangeCodemode( 'script' ) }
						>
							SCRIPT
						</ToolbarButton>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ codeMode === 'preview' ? true : false }
							onClick={ () => { onchangeCodemode( 'preview' ) } }
						>
							{ __( 'Preview' ) }
						</ToolbarButton>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ codeMode === 'ai' ? true : false }
							onClick={ () => { onchangeCodemode( 'ai' ) } }
						>
							AI Helper Chat
						</ToolbarButton>
					</ToolbarGroup>
					<ToolbarGroup>
						<ToolbarButton
							className="components-tab-button"
							isPressed={ collapseMode }
							onClick={ () => setAttributes({ collapseMode : !collapseMode } )}
						>
							Collapse
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>

				<div className='gspb_codeinner' ref={ targetCoderef } >
					{ codeMode === 'preview' && 
						<Preview
							content={ htmlcontent }
							blockStyle={ [ csscontent ] }
							blockScript={ scriptcontent }
							isSelected = { isSelected }
						/>
					 }
					{ ( codeMode === 'css' || codeMode === 'script' || codeMode === 'html' ) && 
						<Gspbcode 
							code = { codeContent } // code content
							langauge = { langauge } // language
							onchange = { codeValueHandler }  // setter function
						/>
					}
					{ codeMode === 'ai' &&
						<div className='openai_wrapper'>
							<div className='openai_form_wrapper'>
								<form method="post" onSubmit={ onSubmitHandler } >
									<TextControl
										className='openai_textfield'
										placeholder='Enter something & hit enter...'
										value={ userInput }
										onChange={( value ) => setUserInput( value )}
										disabled={ isLoading }
									/>
								</form>
								{ isLoading &&
									<div className='loader'>
										<Spinner />
									</div>
								}
							</div>
							<div className='openai_response_wrapper'>
								<OpenAIResponse isLoading={ isLoading } { ...props } setConversation ={ setConversation } />
							</div>
						</div>
					}
				</div>
			</div>
		);
}

export default edit;