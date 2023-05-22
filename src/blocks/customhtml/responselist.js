/**
 * External dependencies
*/
import { useEffect, useRef, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';

/**
 * Internal dependencies
*/
import CopyButtonPlugin from './copytoclipboard';

export default function OpenAIResponse ( props ) {

    const { attributes, setAttributes, isLoading, setConversation } = props;
    const { openairesponse, htmlcontent, csscontent, scriptcontent } = attributes;

    const [pluginLoaded, setPluginLoaded ] = useState(false);

    const markdDownWrapper = useRef(null);

    useEffect(() => {
        const currentRef = markdDownWrapper?.current;
        if(currentRef){
            const { ownerDocument } = currentRef;
    
            ownerDocument.querySelectorAll('pre').forEach(el => {

                const codeEle = el.getElementsByTagName('code')[0];

                if(codeEle && ! codeEle.classList.contains('hljs')){
                    hljs.highlightElement(codeEle);  
                }
            });

            if(!pluginLoaded){ 

            function updateButtonText(button){
                setTimeout(() => {
                    button.innerHTML = "<i class='rhicon rhi-clone'></i> Copy to code area";
                    button.dataset.copied = false;             
                  }, 2000);
            }
                
            hljs.addPlugin( new CopyButtonPlugin({ callback: (text, el, button) => {
                const language = el?.dataset?.language;
                switch ( language ) {
                    case "html":
                        setAttributes({ htmlcontent: htmlcontent + text }) 
                        button.innerHTML = "Copied to html code area!";
                        updateButtonText( button );
                        break;
                    case "css":
                        setAttributes({ csscontent: csscontent + text })
                        button.innerHTML = "Copied to css code area!";
                        updateButtonText( button );
                        break;
                    case "javascript":
                        setAttributes({ scriptcontent: scriptcontent + text }) 
                        button.innerHTML = "Copied to script code area!";
                        updateButtonText( button );
                        break;
                    case "js":
                        setAttributes({ scriptcontent: scriptcontent + text }) 
                        button.innerHTML = "Copied to script code area!";
                        updateButtonText( button );
                        break;
                    default:
                    break;
                }},
                })
            );
            setPluginLoaded(true);
            }
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
                            <p className='ai_input'>{ item?.userInput }</p>
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
            { openairesponse.length > 0 && 
                <div className='gsbp_ai_btn' >
                    <Button
                        variant='primary'
                        disabled={ isLoading }
                        onClick={() => {setAttributes({ openairesponse: [] }); setConversation([]); }}
                    >
                        New Chat
                    </Button>
                </div>
            }
        </>
    )
}