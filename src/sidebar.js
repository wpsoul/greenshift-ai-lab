import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';


const MetaFieldsInputs = () => {

    return (
        <>
            <TextControl
                label={__('Shortcode', 'greenshiftquery')}
                help={__('Copy and paste this shortcode into your post or page content to execute it', 'greenshift-smart-code-ai')}
                value={`[gspb_codesnippet id="${wp.data.select("core/editor").getCurrentPostId()}"]`}
            />
        </>
    );
};

registerPlugin('gs-ai-sidebar-meta', {
    render: () => {
        const postType = useSelect(
            (select) => select('core/editor').getCurrentPostType(),
            []
        );

        if (postType !== 'gscodesnippet') return null;
        return (
            <PluginDocumentSettingPanel
                opened={true}
                name="gspb-meta-field-snippet"
                title={__('Execution shortcode', 'greenshift-smart-code-ai')}
            >
                <MetaFieldsInputs />
            </PluginDocumentSettingPanel>
        );
    },
});