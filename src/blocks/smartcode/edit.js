/**
 * Wordpress dependencies
*/
import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { BlockControls, useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { ToolbarButton, Spinner, TextareaControl, ToolbarGroup, DropdownMenu, ToggleControl, PanelBody, Button } from '@wordpress/components';
import { select } from '@wordpress/data';
import { RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
*/
import Preview from './preview';
import Gspbcode from '../../components/gspbcodewithAce';
import OpenAIResponse from './responselist';

function edit(props) {

	const { attributes, setAttributes, className, isSelected } = props;
	const { codeMode, collapseMode, htmlcontent, csscontent, scriptcontent, openairesponse, prettyform, phpcontent, onlyphp, snippetID } = attributes;

	const isAdmin = select('core').canUser('create', 'users');

	const [isLoading, setIsLoading] = useState(false);
	const [userInput, setUserInput] = useState('');
	const [phpPreview, setPhpPreview] = useState('');
	const [conversation, setConversation] = useState([]);

	const targetCoderef = useRef(null);

	const blockProps = useBlockProps({
		className: `gspb-smartcode${prettyform ? ' gspb-prettyform' : ''}`
	});

	const onchangeCodemode = (codelanguage) => {
		setAttributes({ codeMode: codelanguage });
		setTimeout(() => {
			if (targetCoderef.current.querySelector('.gspb_code_viewer') !== null) {
				targetCoderef.current.querySelector('.gspb_code_viewer').focus();
			}
		}, 200);
	};

	const codeValueHandler = (code) => {
		if (typeof isAdmin !== 'undefined' && !isAdmin) {
			wp.data.dispatch("core/notices").createErrorNotice(
				__("You need to be admin to update block", "greenshift-smart-code-ai"),
				{ type: "snackbar" }
			);
			return;
		} else {
			if (codeMode === 'html') {
				setAttributes({ htmlcontent: code });
			}
			if (codeMode === 'css') {
				setAttributes({ csscontent: code });
			}
			if (codeMode === 'script') {
				setAttributes({ scriptcontent: code });
			}
			if (codeMode === 'php') {
				setAttributes({ phpcontent: code });
			}
		}
	};

	let codeContent = htmlcontent;
	let language = 'html';
	let languageTag = 'html';

	if (codeMode === 'html') {
		codeContent = htmlcontent;
		language = 'html';
		languageTag = 'html';
	} else if (codeMode === 'css') {
		codeContent = csscontent;
		language = 'css';
		languageTag = 'style';
	} else if (codeMode === 'script') {
		codeContent = scriptcontent;
		language = 'javascript';
		languageTag = 'script';
	} else if (codeMode === 'php') {
		codeContent = phpcontent;
		language = 'php';
		languageTag = 'php';
	}


	// call api on form submit, disable input till response is received.

	let controller = null;

	const generateResponse = async () => {

		if (typeof isAdmin !== 'undefined' && !isAdmin) {
			wp.data.dispatch("core/notices").createErrorNotice(
				__("You need to be admin to use block", "greenshift-smart-code-ai"),
				{ type: "snackbar" }
			);
			return;
		}

		if (userInput === '') { return; }
		setIsLoading(true);
		setAttributes({isFinished: false});

		// Create a new AbortController instance
		controller = new AbortController();
		const signal = controller.signal;

		let resultText = "";

		const keydata = await wp.apiFetch({
			path: `/greenshift/v1/model_ai`,
			method: 'GET',
		}).then(response => {
			const data = JSON.parse(response);
			if (data.success) {
				if (data?.key) {
					return {
						key: data.key,
						model: data.model
					}
				}
				setUserInput('');
			} else {
				wp.data.dispatch("core/notices").createErrorNotice(
					data.message,
					{ type: "snackbar" }
				);
			}
			setIsLoading(false);
		}).catch(error => {
			setIsLoading(false);
		});

		try {
			if(!keydata?.key || !keydata?.model) return;
			let response;
			// Fetch the response from the OpenAI API with the signal from AbortController
			if(keydata.model == 'deepseek-chat' || keydata.model == 'deepseek-reasoner') {
				response = await fetch('https://api.deepseek.com/chat/completions', {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${keydata.key}`
					},
					body: JSON.stringify({
						model: keydata.model,
						messages: [{ role: "system", content: "You are a helpful code builder assistant for php, html, css, javascript. Do not use any  other code languages." },{ role: "user", content: userInput }],
						stream: true // For streaming responses
					}),
					signal, // Pass the signal to the fetch request
				});
			} else if (keydata.model == 'claude-3-5-sonnet-20241022' || keydata.model == 'claude-3-5-haiku-20241022') {
				response = await fetch('https://api.anthropic.com/v1/messages', {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": keydata.key,
						"anthropic-version": "2023-06-01",
						"anthropic-dangerous-direct-browser-access": "true"
					},
					body: JSON.stringify({
						model: keydata.model,
						messages: [{ role: "user", content: userInput }],
						stream: true, // For streaming responses
						"max_tokens": 4096,
						"system": "You are a helpful code builder assistant for php, html, css, javascript. Do not use any other code languages."
					}),
					signal, // Pass the signal to the fetch request
				});
			} else {
				response = await fetch('https://api.openai.com/v1/chat/completions', {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					Authorization: `Bearer ${keydata.key}`,
				},
				body: JSON.stringify({
					model: keydata.model,
					messages: [{ role: "user", content: userInput }],
					stream: true, // For streaming responses
					}),
					signal, // Pass the signal to the fetch request
				});
			}

			if(keydata.model == 'claude-3-5-sonnet-20241022' || keydata.model == 'claude-3-5-haiku-20241022') {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = '';
				
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					
					// Append new chunks to buffer and split by double newlines
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');
					buffer = lines.pop() || ''; // Keep last incomplete chunk in buffer
					
					for (const line of lines) {
						if (!line.trim() || line.indexOf('data: ') !== 0) continue;
						
						const data = line.slice(6); // Remove 'data: ' prefix
						if (data === '[DONE]') continue;
						
						try {
							const parsed = JSON.parse(data);
							if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
								resultText += parsed.delta.text;
								const newResponse = {
									userInput: userInput,
									aiResponse: resultText
								};
								setConversation([...conversation, { role: 'assistant', content: resultText }]);
								setAttributes({ openairesponse: [...openairesponse, newResponse] });
							}
						} catch (e) {
							console.error('Error parsing Claude message:', e);
						}
					}
				}
				
				// Process any remaining buffer content
				if (buffer) {
					try {
						const parsed = JSON.parse(buffer.replace('data: ', ''));
						if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
							resultText += parsed.delta.text;
							const newResponse = {
								userInput: userInput,
								aiResponse: resultText
							};
							setConversation([...conversation, { role: 'assistant', content: resultText }]);
							setAttributes({ openairesponse: [...openairesponse, newResponse] });
						}
					} catch (e) {
						console.error('Error parsing final Claude message:', e);
					}
				}
				
				setIsLoading(false);
				setUserInput('');
				setAttributes({isFinished: true});
			} else{
				// Read the response as a stream of data
				const reader = response.body.getReader();
				const decoder = new TextDecoder("utf-8");
	
				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						setIsLoading(false);
						setUserInput('');
						setAttributes({isFinished: true});
						break;
					}
					// Massage and parse the chunk of data
					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");
					const parsedLines = lines
						.map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
						.filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
						.map((line) => JSON.parse(line)); // Parse the JSON string
	
					for (const parsedLine of parsedLines) {
						const { choices } = parsedLine;
						const { delta } = choices[0];
						const { content } = delta;
						// Update the UI with the new content
						if (content) {
							resultText += content;
							const newResponse = {
								userInput: userInput,
								aiResponse: resultText
							}
							setConversation([...conversation, { role: 'assistant', content: resultText }]);
							const newResponseData = [...openairesponse, newResponse];
							setAttributes({ openairesponse: newResponseData });
						}
					}
				}
			}

		} catch (error) {
			// Handle fetch request errors
			if (signal.aborted) {
				console.log("Request aborted.");
				setIsLoading(false);
			} else {
				console.error("Error:", error);
				wp.data.dispatch("core/notices").createErrorNotice(
					__("Error occurred while generating.", "greenshift-smart-code-ai"),
					{ type: "snackbar" }
				);
				setIsLoading(false);
			}
		} finally {
			controller = null; // Reset the AbortController instance
		}
	};

	useEffect(() => {
		const currentRef = targetCoderef.current;
		if (currentRef === undefined) return;

		const { ownerDocument } = currentRef;
		const body = ownerDocument.body;
		let blockScript = body.querySelector('#gsaiblock' + props.clientId);

		if (codeMode == 'preview' && scriptcontent) {
			if (blockScript === null) {
				const codeScript = ownerDocument.createElement("script");
				codeScript.type = 'text/javascript';
				codeScript.id = 'gsaiblock' + props.clientId;
				codeScript.text = scriptcontent;
				body.appendChild(codeScript);
			} else {
				wp.data.dispatch("core/notices").createErrorNotice(
					__("You need to reload page to execute updated script", "greenshift-smart-code-ai"),
					{ type: "snackbar" }
				);
			}
		}
		if (codeMode == 'preview' && phpcontent && snippetID) {
			wp.apiFetch({
				path: `/greenshift/v1/get-php-preview?id=${snippetID}`,
				method: 'GET'
			}).then(response => {
				const data = JSON.parse(response);
				if (data) {
					setPhpPreview(data);
				} else {
					wp.data.dispatch("core/notices").createErrorNotice(
						__("Php preview is not available", "greenshift-smart-code-ai"),
						{ type: "snackbar" }
					);
				}
				setIsLoading(false);
			}).catch(error => {
				setIsLoading(false);
			});
		}
	}, [codeMode, scriptcontent]);

	const IsCollapseCodeMode = () => {
		return (
			<>
				<div className='collapse_code_wrapper'>
					<div className='code_laungauge'>&lt;{languageTag}&gt;</div>
					{codeContent.substring(0, 60) + '...'}
					<div className='code_laungauge'>&lt;/{languageTag}&gt;</div>
				</div>
			</>
		)
	};

	console.log(csscontent);

	const PRETTY_STYLES = `.gspb-prettyform input:not(.wp-element-button),.gspb-prettyform select,.gspb-prettyform textarea{border:1px solid var(--wp--preset--color--lightborder,#cecece6b);border-radius:0;width:100%;padding:9px 15px;transition:border-color .3s cubic-bezier(.165,.84,.44,1),background-color .3s cubic-bezier(.165,.84,.44,1);background-color:var(--wp--preset--color--inputbg,#fafbfd);border-radius:0;color:var(--wp--preset--color--inputtext,#444);font-size:var(--wp--preset--font-size--medium,1.2rem);font-weight:var(--wp--custom--font-weight--normal,400);line-height:var(--wp--custom--line-height--medium,1.6)}.gspb-prettyform input:not(.wp-element-button),.gspb-prettyform select{font-size:var(--wp--preset--font-size--small,1rem);line-height:var(--wp--custom--line-height--medium,)}.gspb-prettyform select{padding-right:25px;background-image:url("data:image/svg+xml,%3Csvg width='21' height='13' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.5.379L20.621 2.5 10.5 12.621.379 2.5 2.5.379l8 8z' fill='%234F5D6D' fill-rule='nonzero'/%3E%3C/svg%3E");background-repeat:no-repeat,repeat;background-size:8px auto,100%;background-position:right 10px top 50%,0 0}.gspb-prettyform textarea{padding:10px 20px}.gspb-prettyform input[type=checkbox],.gspb-prettyform input[type=radio]{width:16px;height:16px;flex-shrink:0;display:inline-block;margin:0;margin-right:8px;text-align:center;vertical-align:middle;cursor:pointer;border:0}.gspb-prettyform input[type=checkbox],.gspb-prettyform input[type=radio]{box-sizing:border-box;padding:0}.gspb-prettyform input:focus,.gspb-prettyform textarea:focus{background-color:var(--wp--preset--color--lightbg,#f9fafb)}.gspb-prettyform input[type=button]:not(.wp-element-button),.gspb-prettyform input[type=email],.gspb-prettyform input[type=search],.gspb-prettyform input[type=submit]:not(.wp-element-button),.gspb-prettyform input[type=text],.gspb-prettyform select,.gspb-prettyform textarea{-webkit-appearance:none;appearance:none}.gspb-prettyform ::placeholder{color:var(--wp--preset--color--black,#000);font-size:var(--wp--preset--font-size--small,1rem);opacity:.6}`;

	return (
		<div {...blockProps}>
			{!onlyphp &&
				<>
					<BlockControls>
						<ToolbarGroup>
							<ToolbarButton
								className={`components-tab-button ${htmlcontent ? 'gspb_codecontent_changed' : ''}`}
								isPressed={codeMode === 'html' ? true : false}
								onClick={() => onchangeCodemode('html')}
							>
								HTML
							</ToolbarButton>
							<ToolbarButton
								className={`components-tab-button ${csscontent ? 'gspb_codecontent_changed' : ''}`}
								isPressed={codeMode === 'css' ? true : false}
								onClick={() => onchangeCodemode('css')}
							>
								CSS
							</ToolbarButton>
							<ToolbarButton
								className={`components-tab-button ${scriptcontent ? 'gspb_codecontent_changed' : ''}`}
								isPressed={codeMode === 'script' ? true : false}
								onClick={() => onchangeCodemode('script')}
							>
								SCRIPT
							</ToolbarButton>
							<ToolbarButton
								className={`components-tab-button ${phpcontent ? 'gspb_codecontent_changed' : ''}`}
								isPressed={codeMode === 'php' ? true : false}
								onClick={() => onchangeCodemode('php')}
							>
								PHP
							</ToolbarButton>
							<ToolbarButton
								className="components-tab-button"
								isPressed={codeMode === 'preview' ? true : false}
								onClick={() => { onchangeCodemode('preview') }}
							>
								{__('Preview')}
							</ToolbarButton>
							<ToolbarButton
								className="components-tab-button"
								isPressed={codeMode === 'ai' ? true : false}
								onClick={() => { onchangeCodemode('ai') }}
							>
								AI Helper Chat
							</ToolbarButton>
						</ToolbarGroup>
						<ToolbarGroup>
							<ToolbarButton
								className="components-tab-button"
								isPressed={collapseMode}
								onClick={() => setAttributes({ collapseMode: !collapseMode })}
							>
								Collapse
							</ToolbarButton>
						</ToolbarGroup>
					</BlockControls>
					<InspectorControls>
						<PanelBody title={__('Code Settings', 'greenshift-smart-code-ai')} initialOpen={true}>
							<div className="gspb_inspector">
								{codeMode === 'preview' &&
									<div className='gspb_preview_overlay'>
										<span className="onpreview"></span>
										<span>{__("Script Preview mode is enabled", "greenshift-smart-code-ai")}</span>
									</div>
								}
								{typeof greenShift_params === 'undefined' &&
									<div className="gsai_helper_block">
										<svg clip-rule="evenodd" height="50px" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="m418.018 79.909-377.104-2.318 7.075 208.767 177.267 161.642 140.55-103.477 45.932-123.671-224.766-3.11 29.961 67.964 117.18 2.218-110.113 81.877-102.504-95.157-5.087-122.354 260.399-2.775z" fill-rule="nonzero" /></svg>
										<div>{__("Please, enable", "greenshift-smart-code-ai")}<br /><a href="https://wordpress.org/plugins/greenshift-animation-and-page-builder-blocks/" target="_blank">{__("free Greenshift plugin", "greenshift-smart-code-ai")} </a><br />{__("to get more features", "greenshift-smart-code-ai")}</div>
									</div>
								}
								{typeof greenShift_params !== 'undefined' &&
									(
										<>
											{__('You can place this block inside Container Block to control design options', 'greenshift-smart-code-ai')}
											{(htmlcontent && htmlcontent.includes("form")) &&
												<div className="gsai_helper_block">
													<svg clip-rule="evenodd" height="50px" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="m418.018 79.909-377.104-2.318 7.075 208.767 177.267 161.642 140.55-103.477 45.932-123.671-224.766-3.11 29.961 67.964 117.18 2.218-110.113 81.877-102.504-95.157-5.087-122.354 260.399-2.775z" fill-rule="nonzero" /></svg>
													<div>{__("We found forms in your HTML content. Do you want to enable Pretty form styles?", "greenshift-smart-code-ai")}<br /><br />
														<Button
															variant={prettyform ? "primary" : "secondary"}
															onClick={() => setAttributes({ prettyform: !prettyform })}
														>
															{__("Enable", "greenshift-smart-code-ai")}
														</Button>
													</div>
												</div>
											}
											{(htmlcontent && (htmlcontent.includes("type=\"submit\"") || htmlcontent.includes("type='submit'"))) &&
												<div className="gsai_helper_block">
													<div>{__("We found Button in your code. Do you want to apply wordpress button class?", "greenshift-smart-code-ai")}<br /><br />
														<Button
															variant={htmlcontent.includes("wp-element-button") ? "primary" : "secondary"}
															onClick={() => {
																let updated;
																if (htmlcontent.includes("wp-element-button")) {
																	updated = htmlcontent.replace("wp-element-button", "");
																} else {
																	updated = htmlcontent.replace("type=\"submit\"", "type=\"submit\"  class='wp-element-button'");
																	updated = updated.replace("type='submit'", "type='submit'  class='wp-element-button'");
																}
																setAttributes({ htmlcontent: updated })
															}}
														>
															{__("Enable", "greenshift-smart-code-ai")}
														</Button>
													</div>
												</div>
											}
										</>
									)
								}
							</div>
						</PanelBody>
					</InspectorControls>
				</>
			}

			<div className='gspb_codeinner' ref={targetCoderef}>
				{!onlyphp &&
					<>
						{codeMode === 'preview' &&
							<>
								{(htmlcontent || phpPreview) &&
									<div className={`gspb-preview-smartcode${prettyform ? ' gspb-prettyform' : ''}`}>
										<RawHTML>{phpPreview}{htmlcontent}</RawHTML>
									</div>
								}
							</>
						}
						{(codeMode === 'css' || codeMode === 'script' || codeMode === 'html' || codeMode === 'php') &&
							(!collapseMode ?
								<Gspbcode
									code={codeContent} // code content
									language={language} // language
									onchange={codeValueHandler}  // setter function
									attributes={attributes} // attributes
									setAttributes={setAttributes} // setAttributes
								/>
								:
								<IsCollapseCodeMode />
							)
						}
						{codeMode === 'ai' &&
							(!collapseMode ?
								<div className='openai_wrapper'>
									<div className={`openai_form_wrapper${openairesponse.length > 0 ? " openai_form_wrapper_with_results" : ""}`}>

										<TextareaControl
											className='openai_textfield'
											placeholder={__('Enter something & click to send...', 'greenshift-smart-code-ai')}
											value={userInput}
											onChange={(value) => setUserInput(value)}
											disabled={isLoading}
										/>
										<div className='gspb_contextual_aihelper'>
											{!isLoading &&
												<span className='gspb_contextual_aihelper_icon' onClick={generateResponse}>
													<svg viewBox="0 0 122.56 122.88"><path d="M112.27,10.31l-99,38.07,30,14.37L89.21,33.18,60.44,80.53l14,29.06,37.81-99.28ZM2.42,44.49,117.16.37a3.73,3.73,0,0,1,3-.12,3.78,3.78,0,0,1,2.19,4.87L78.4,120.45a3.78,3.78,0,0,1-6.92.3l-22.67-47L2.14,51.39a3.76,3.76,0,0,1,.28-6.9Z" /></svg>
												</span>
											}
											{(!isLoading && openairesponse.length > 0) &&
												<DropdownMenu
													icon="ellipsis"
													controls={[
														{
															title: 'Start new Chat',
															icon: "plus-alt2",
															onClick: () => {
																setAttributes({ openairesponse: [] });
																setConversation([]);
															},
														},
													]}
												/>
											}
											{isLoading &&
												<div className='loader'>
													<Spinner />
												</div>
											}
										</div>

									</div>
									<div className='openai_response_wrapper'>
										<OpenAIResponse isLoading={isLoading} {...props} setConversation={setConversation} />
									</div>
								</div>
								:
								(openairesponse.length > 0 &&
									<div className='openai_response_collapse'>
										{`<prompt>${openairesponse[0].userInput}</prompt>`}
									</div>
								)
							)
						}
					</>
				}
				{onlyphp &&
					<>
						<Gspbcode
							code={phpcontent} // code content
							language={"php"} // language
							onchange={codeValueHandler}  // setter function
							attributes={attributes} // attributes
							setAttributes={setAttributes} // setAttributes
						/>
					</>
				}
			</div>

				<style
					dangerouslySetInnerHTML={{
						__html: csscontent,
					}}
				/>
				{prettyform &&
					<style
						dangerouslySetInnerHTML={{
							__html: PRETTY_STYLES,
						}}
					/>
				
				}
			
		</div>
	);
}

export default edit;