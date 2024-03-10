/**
 * External dependencies
*/
import { __ } from '@wordpress/i18n';
import AceEditor from 'react-ace';
import { escapeHTML } from '@wordpress/escape-html';
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
import "ace-builds/src-noconflict/theme-github";

/**
 * Internal dependencies
*/
import './styles.editor.scss';

export default function GspbcodeFluent(props) {

    const { code, language, onChange, theme = 'monokai', minLines = 3, fontSize = 15, showGutter = true, tabSize = 4 } = props;

    let editorACE = useRef();

    useEffect(() => {
        let editorACEcurrent = editorACE.current;
        editorACEcurrent.editor.renderer.attachToShadowRoot();
    }, []);
            

    const codeHanler = (content) => {
        onChange(content);
    };

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
                        theme={theme}
                        onChange={codeHanler}
                        fontSize={fontSize}
                        showPrintMargin={false}
                        showGutter={showGutter}
                        highlightActiveLine={false}
                        value={code}
                        maxLines={Infinity}
                        minLines={minLines}
                        height={"auto"}
                        width="100%"
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: tabSize,
                            useWorker: false,
                            fontFamily: "MonoSpace",
                        }} />

                </div>
            </div>
        </div>
    )
}