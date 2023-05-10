
import { PlainText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';

import { Highlight } from "prism-react-renderer";

import './styles.editor.scss';

export default function Gspbcode( props ) {

    const { code, langauge, onchange  } = props;

    const textAreaRef = useRef( null );

    const codeHanler = ( content ) => {
        onchange( content );
    }

    const CodeSyntextGenerator = ( { className, style, tokens, getLineProps, getTokenProps } ) => {
        return (
            <pre style={ style } >
                {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                            )
                        )}
                    </div>
                ))}
            </pre>   
        )
    }
  
    return(
        <div 
            className="gspb_code_viewer"
            role="button"
            tabIndex={0}
            onKeyDown={() => textAreaRef.current?.focus()}
            onClick={() => textAreaRef.current?.focus()}
            >
            <Highlight
                code={ code }
                language= { langauge }
                >
                { ( className, style, tokens, getLineProps, getTokenProps ) => 
                    CodeSyntextGenerator( className, style, tokens, getLineProps, getTokenProps )
                 }   
            </Highlight>
            <PlainText  
                onChange={ codeHanler }
                value={ code }
                className="gspb_code_textarea"
                placeholder={ __( 'Write Here…' ) }
                aria-label={ __( langauge ) }
                ref = { textAreaRef }
            />
        </div>
   
    )
}