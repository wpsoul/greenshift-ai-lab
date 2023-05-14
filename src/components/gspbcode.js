
import { PlainText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useRef, useEffect, useState } from '@wordpress/element';
import hljs from 'highlight.js';
import './styles.editor.scss';

export default function Gspbcode( props ) {

    const { code, langauge, onchange  } = props;

    const textAreaRef = useRef( null );
    const markdDownWrapper = useRef(null);
    const [ height, setHeight ] =  useState('auto');

    const codeHanler = ( content ) => {
        onchange( content );
    }

    useEffect(() => {
        const currentRef = markdDownWrapper?.current;
        if(currentRef){
            const { ownerDocument } = currentRef;
    
            ownerDocument.querySelectorAll('pre').forEach(el => {

                const codeEle = el.getElementsByTagName('code')[0];
                    hljs.highlightElement(codeEle);  
            });

           
        }
    });


    useEffect(() => {
        setHeight(textAreaRef?.current?.scrollHeight ? (textAreaRef.current.scrollHeight + 'px') : 'auto');
    }, [code]);
  
    return(
        <div className="gspb_syntext_heighlighter">
            <div 
                className="gspb_code_viewer"
                role="button"
                tabIndex={0}
                onKeyDown={() => textAreaRef.current?.focus()}
                onClick={() => textAreaRef.current?.focus()}
                ref={ markdDownWrapper }
                >
                <div style={{ height: height }}>
                    <pre>
                        <code className={`language-${langauge ? langauge : ''}`}>
                            {code}
                        </code>
                    </pre>
                </div>
                <div className="code_input">
                    <PlainText  
                        onChange={ codeHanler }
                        value={ code }
                        className="gspb_code_textarea"
                        placeholder={ __( 'Write Here…' ) }
                        aria-label={ __( langauge ) }
                        ref = { textAreaRef }
                    />
                </div>
            </div>
        </div>
    )
}