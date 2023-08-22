/**
 * External dependencies
*/
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);
import css from 'highlight.js/lib/languages/css';
hljs.registerLanguage('css', css);
import php from 'highlight.js/lib/languages/php';
hljs.registerLanguage('php', php);


/**
 * Internal dependencies
*/
import CopyButtonPlugin from './copytoclipboard';

export default function OpenAIResponse ( props ) {

    const { attributes, setAttributes, isLoading, setConversation } = props;
    const { openairesponse, htmlcontent, csscontent, scriptcontent, phpcontent, isFinished } = attributes;

    const markdDownWrapper = useRef(null);

    function updateButtonText(button, text){
        setTimeout(() => {
            if(text){
                button.innerHTML = text;
            }else{
                button.innerHTML = "<i class='rhicon rhi-clone'></i> Copy to code area";
            }
            button.dataset.copied = false;             
          }, 2000);
    }

    function copyToClipboard(text) {
        const textarea = ownerDocument.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        ownerDocument.body.appendChild(textarea);
        textarea.select();
        ownerDocument.execCommand('copy');
        ownerDocument.body.removeChild(textarea);
    }

    useEffect(() => {
        const currentRef = markdDownWrapper?.current;
        if(currentRef && isFinished){
            const { ownerDocument } = currentRef;
    
            currentRef.querySelectorAll('pre').forEach(el => {

                const codeEle = el.getElementsByTagName('code')[0];

                if(codeEle && ! codeEle.classList.contains('hljs')){
                    hljs.highlightElement(codeEle);  
                }
            });
                
            hljs.addPlugin( new CopyButtonPlugin({ callback: (text, el, button) => {
                const language = el?.dataset?.language;
                let prevtext = button.innerHTML;
                switch ( language ) {
                    case "html":
                    case "xml":
                        if(button.dataset.type === "add" && htmlcontent){
                            setAttributes({ htmlcontent: htmlcontent + text });
                            button.innerHTML = "Copied to html code area!";
                            updateButtonText( button,prevtext);
                        }else{
                            setAttributes({ htmlcontent: text }) 
                            button.innerHTML = "Placed in html code area!";
                            updateButtonText( button,prevtext);
                        }
                        break;
                    case "css":
                        if(button.dataset.type === "add" && csscontent){
                            text = text.replace('<style>', "");
                            text = text.replace('</style>', "");
                            setAttributes({ csscontent: csscontent + text })
                            button.innerHTML = "Copied to css code area!";
                            updateButtonText( button,prevtext);
                        }else{
                            text = text.replace('<style>', "");
                            text = text.replace('</style>', "");
                            setAttributes({ csscontent: text })
                            button.innerHTML = "Placed in css code area!";
                            updateButtonText( button,prevtext);
                        }
                        break;
                    case "javascript":
                    case "js":
                        if(button.dataset.type === "add" && scriptcontent){
                            text = text.replace('<script>', "");
                            text = text.replace('</script>', "");
                            setAttributes({ scriptcontent: scriptcontent + text }) ;
                            button.innerHTML = "Copied to script code area!";
                            updateButtonText( button,prevtext);
                        }else{
                            text = text.replace('<script>', "");
                            text = text.replace('</script>', "");
                            setAttributes({ scriptcontent: text }) 
                            button.innerHTML = "Placed in script code area!";
                            updateButtonText( button,prevtext);
                        }
                        break;
                    case "php":
                        if(button.dataset.type === "add" && phpcontent){
                            setAttributes({ phpcontent: phpcontent + text }) 
                            button.innerHTML = "Copied to php code area!";
                            updateButtonText( button,prevtext);
                        }else{
                            setAttributes({ phpcontent: text }) 
                            button.innerHTML = "Placed in php code area!";
                            updateButtonText( button,prevtext);
                        }
                    default:
                    break;
                }},
                })
            );

        }
    });

    useEffect(() => {
		if (markdDownWrapper?.current) {
            // get last child awalys.
             const lastResponseDiv = markdDownWrapper.current?.lastChild;
             if(lastResponseDiv){
                markdDownWrapper.current.scrollTop = lastResponseDiv.offsetTop - 40;
             }
		}
	}, [ openairesponse ]);

    return(
        <>
            <div className="chat-container" ref={ markdDownWrapper }>
                { openairesponse?.map((item, id) => {
                    return (
                        <div key={ id } style={{ 'marginBottom': '20px' }} >
                            <p className='ai_input'><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg> {__('You:', 'greenshift-smart-code-ai')} { item?.userInput }</p>
                            <ReactMarkdown className='ai_response' children={item?.aiResponse ?? ''}
                                components={{
                                    code({ className, children }) {
                                        return ( 
                                            <code data-copy="true" className={`gspb_code_ai ${className ? className : ''}`}>
                                                { children }
                                            </code>
                                        )
                                    }
                                }}
                            />
                        </div>
                    )})
                }            
            </div>
        </>
    )
}