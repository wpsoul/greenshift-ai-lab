import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

function save(props) {
    const {
        attributes: {
            src, id,
            title,
            minHeight,
            disablelazy,
        },
    } = props;

    const blockId = `gspb_id-${id || 'gsframe_no_parent_gs'}`;
    const frameId = `greenshift-ai-frame-${id || 'current'}`;

    const blockProps = useBlockProps.save({
        className: `gs-frameloader ${blockId}`
    });


    return (
        <div {...blockProps}>
            {src &&
                <iframe loading={disablelazy ? "eager" : "lazy"} class={frameId} src={src} width='100%' height={minHeight} title={title} />
            }
        </div>
    );
}

export default save;