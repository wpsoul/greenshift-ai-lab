/**
 * External dependencies
*/
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import AceEditor from 'react-ace';
import { escapeHTML } from '@wordpress/escape-html';
import { Button, TextControl, ToggleControl } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';

import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/snippets/php";
import "ace-builds/src-noconflict/snippets/html";
import "ace-builds/src-noconflict/snippets/css";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/theme-monokai";

/**
 * Internal dependencies
*/
import './styles.editor.scss';

export default function Gspbcode(props) {

    const { code, language, onchange, setAttributes } = props;
    const { onlyphp, snippetID, executeSnippet, phpcontent, phpcontentregistered } = props.attributes;

    let editorACE = useRef();

    useEffect(() => {
        let editorACEcurrent = editorACE.current;
        editorACEcurrent.editor.renderer.attachToShadowRoot();
    }, []);
            

    const codeHanler = (content) => {
        onchange(content);
    };

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
            >
                <div>

                    <AceEditor
                        placeholder={__('Write Here your code…', 'greenshift-smart-code-ai')}
                        mode={`${language ? language : ''}`}
                        ref={editorACE}
                        theme="monokai"
                        onChange={codeHanler}
                        fontSize={15}
                        showPrintMargin={false}
                        showGutter={true}
                        highlightActiveLine={false}
                        value={code}
                        maxLines={Infinity}
                        minLines={3}
                        height={"auto"}
                        width="100%"
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 4,
                            useWorker: false
                        }} />

                </div>
            </div>
            {(!onlyphp && language == 'php') &&
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
                                value={`[gs_codesnippet id="${snippetID}"]`}
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