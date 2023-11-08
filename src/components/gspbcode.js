/**
 * External dependencies
*/
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { escapeHTML } from '@wordpress/escape-html';
import { Button, TextControl, ToggleControl } from '@wordpress/components';
import { useState, useRef, useEffect, RawHTML} from '@wordpress/element';

import { PlainText } from '@wordpress/block-editor';
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
hljs.configure({ignoreUnescapedHTML:true});

/**
 * Internal dependencies
*/
import './styles.editor.scss';

export default function Gspbcode(props) {

    const { code, language, onchange, setAttributes } = props;
    const { onlyphp, snippetID, executeSnippet, phpcontent, phpcontentregistered } = props.attributes;

    const codeHanler = (content) => {
        onchange(content);
    };

    const [ height, setHeight ] =  useState('auto');
    const textAreaRef = useRef( null );
    const markdDownWrapper = useRef(null);
    useEffect(() => {
        setHeight(textAreaRef?.current?.scrollHeight ? (textAreaRef.current.scrollHeight + 'px') : 'auto');
    }, [code]);
    useEffect(() => {
        const currentRef = markdDownWrapper?.current;
        if(currentRef){
            currentRef.querySelectorAll('pre').forEach(el => {
                const codeEle = el.getElementsByTagName('code')[0];
                    hljs.highlightElement(codeEle);  
            });           
        }
    });

    const [isExecuting, setIsExecuting] = useState(false);

    const createGSCodeSnippet = () => {

        setIsExecuting(true);

        // Define the post content for gscodesnippet custom post type
        const postContent = {
            title: __("Code Snippet - ", "greenshift-smart-code-ai") + wp.data.select('core/editor').getEditedPostAttribute('title'),
            content: '<!-- wp:code --><pre class="wp-block-code"><code>' + escapeHTML(phpcontent) + '</code></pre>',
            status: 'publish',
            post_type: 'gscodesnippet' // Set the post type to gscodesnippet
        };

        // Send the API request to create the code snippet post
        apiFetch({
            path: '/wp/v2/gscodesnippet',
            method: 'POST',
            data: postContent
        }).then(response => {
            // Set the post ID in state
            if (response.id) {
                setAttributes({ snippetID: response.id, phpcontentregistered: phpcontent });
                setIsExecuting(false);
                wp.data.dispatch("core/notices").createErrorNotice(
					__("Snippet is registered", "greenshift-smart-code-ai"),
					{ type: "snackbar" }
				);
            }
        });

    }


    const updateGSCodeSnippet = async () => {

        setIsExecuting(true);

        // Define the post content for gscodesnippet custom post type
        const postContent = {
            content: '<!-- wp:code --><pre class="wp-block-code"><code>' + escapeHTML(phpcontent) + '</code></pre><!-- /wp:code -->',
            status: 'publish',
            post_type: 'gscodesnippet' // Set the post type to gscodesnippet
        };

        // Send the API request to create the code snippet post
        apiFetch({
            path: '/wp/v2/gscodesnippet/' + snippetID,
            method: 'POST',
            data: postContent
        }).then(response => {
            // Set the post ID in state
            if (response.id) {
                setAttributes({ snippetID: response.id, phpcontentregistered: phpcontent });
                setIsExecuting(false);
                wp.data.dispatch("core/notices").createErrorNotice(
					__("Snippet is updated", "greenshift-smart-code-ai"),
					{ type: "snackbar" }
				);
            }
        }, error => {
            if (error.message == 'Invalid post ID.') {
                setIsExecuting(false);
                createGSCodeSnippet();
            } else {
                alert("Error: " + error.message);
                setIsExecuting(false);
            }
        }
        );

    }
    

    return (
        <div className="gspb_syntext_heighlighter">
            <div 
                className="gspb_code_viewer"
                role="button"
                tabIndex={0}
                onKeyDown={() => textAreaRef.current?.focus()}
                onClick={() => textAreaRef.current?.focus()}
                ref={ markdDownWrapper }
            >
                <div style={{ height: height, minHeight:70 }}>
                    <pre>
                        <code className={`language-${language ? language : ''}`}>
                            {code}  
                        </code>
                    </pre>
                </div>
                <div className="code_input">
                    <PlainText  
                        onChange={ codeHanler }
                        value={ code }
                        className="gspb_code_textarea"
                        placeholder={ __( 'Write Here…', 'greenshift-smart-code-ai' ) }
                        aria-label={ __( language ) }
                        ref = { textAreaRef }
                    />
                </div>
            </div>
            {(!onlyphp && language == 'php' && phpcontent) &&
                <div className={`gspb_code_snippet ${snippetID > 0 ? "" : " gspb_code_snippet_create_new"}`}>
                    <div className={`gspb_code_snippet_create`} >
                        {snippetID > 0
                            ?
                            <>
                                {
                                    (phpcontentregistered != phpcontent) &&
                                    <>

                                        <Button
                                            variant='primary'
                                            isBusy={isExecuting}
                                            onClick={
                                                () => {
                                                    if (!isExecuting) {
                                                        updateGSCodeSnippet();
                                                    }
                                                }
                                            }
                                        >
                                            {__('Update Snippet', 'greenshift-smart-code-ai')}
                                        </Button>
                                        <Button
                                            variant='secondary'
                                            onClick={
                                                () => {
                                                    if (!isExecuting) {
                                                        createGSCodeSnippet();
                                                    }
                                                }
                                            }
                                            isBusy={isExecuting}
                                        >
                                            {__('Register as NEW', 'greenshift-smart-code-ai')}
                                        </Button>
                                    </>
                                }
                            </>
                            :
                            <>
                                <Button
                                    variant='primary'
                                    isBusy={isExecuting}
                                    onClick={
                                        () => {
                                            if (!isExecuting) {
                                                createGSCodeSnippet();
                                            }
                                        }
                                    }
                                >
                                    {__('Register code as Executable Snippet', 'greenshift-smart-code-ai')}
                                </Button>
                            </>

                        }

                    </div>
                    {snippetID > 0 &&
                        <div className="gspb_code_snippet_shortcode">
                            <TextControl
                                value={`[gspb_codesnippet id="${snippetID}"]`}
                                onChange={() => { }}    // This is a dummy function to avoid the error
                            />
                            <Button
                                variant={`${executeSnippet ? 'primary' : 'secondary'}`}
                                onClick={() => {
                                    setAttributes({ executeSnippet: !executeSnippet })
                                }
                                }
                            >   {!executeSnippet
                                ? __('Execute on page', 'greenshift-smart-code-ai')
                                : __('Disable on page', 'greenshift-smart-code-ai')
                                }
                            </Button>
                        </div>
                    }

                </div>
            }

        </div>
    )
}