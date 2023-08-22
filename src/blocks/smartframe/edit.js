/**
 * Lottie
 */


// Import wp dependencies
const { __ } = wp.i18n;
import { useEffect, useRef, useState } from '@wordpress/element';
import isEqual from 'lodash/isEqual';
import attributesDefault from './attributes';

import {
    InspectorControls,
    BlockControls,
    AlignmentToolbar,
    useBlockProps
} from '@wordpress/block-editor';

import {
    PanelBody,
    ToggleControl,
    TextControl,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';


const {
    Spacing,
    Responsive,
    CssTransform,
    Position,
    Background,
    Border,
    BlockWidth
} = gspblib.collections;
const {
    gspb_spacing_cssGen,
    gspb_position_cssGen,
    gspb_border_cssGen,
    gspb_csstransform_cssGen,
    gspb_responsive_cssGen,
    gspb_width_cssGen,
    gspb_background_cssGen,
    gspb_Css_Final
} = gspblib.utilities;

// Import gspb depenedencies
const { gspb_setBlockId } = gspblib.utilities;
const { InspectorTabs, InspectorTab, BlockToolBar } = gspblib.components;
const { gspb_cssGen } = gspblib.helpers;

function edit(props) {
    const {
        attributes: {
            src, id,
            title,
            spacing,
            Halign,
            minHeight,
            responsive,
            position,
            csstransform,
            blockWidth,
            disablelazy,
            background, border,
        },
        setAttributes,
        clientId
    } = props;

    // Set Unique Block ID
    gspb_setBlockId(props);
	//Render Animation Properties


    const blockId = `gspb_id-${id || 'gsframe_no_parent_gs'}`;
    const frameId = `greenshift-ai-frame-${id || 'current'}`;
    let css_selector_by_user = `.${blockId}`;
    let css_selector_frame = `.${blockId} iframe.${frameId}`;
    const frameRef = useRef(null);
    const blockProps = useBlockProps({
        className: `gs-frameloader ${blockId}`,
        ref: frameRef
    });
    // Get The Stored CSS
    let final_css = `${css_selector_by_user} iframe{min-height:${minHeight}; border:none; max-width:100%}`;


    const ALIGNMENT_CONTROLS = [
        {
            icon: 'editor-alignleft',
            title: __('Align Left', 'greenshift-smart-code-ai'),
            align: 'flex-start',
        },
        {
            icon: 'editor-aligncenter',
            title: __('Align Center', 'greenshift-smart-code-ai'),
            align: 'center',
        },
        {
            icon: 'editor-alignright',
            title: __('Align Right', 'greenshift-smart-code-ai'),
            align: 'flex-end',
        },
    ];


    final_css = gspb_cssGen(
        css_selector_by_user,
        ['display', "justify-content"],
        ["flex", Halign],
        final_css,
        false
    );

    // Responsive classes
    final_css = gspb_responsive_cssGen(
        responsive,
        css_selector_by_user,
        final_css,
    );

    // Position
    final_css = gspb_position_cssGen(
        position,
        'body.gspb-bodyfront ' + css_selector_by_user,
        final_css,
    );

    // Spacing
    final_css = gspb_spacing_cssGen(
        spacing,
        css_selector_frame,
        final_css
    );
    final_css = gspb_background_cssGen(
        background,
        css_selector_frame,
        final_css
    );
    // Border
    final_css = gspb_border_cssGen(
        border,
        css_selector_frame,
        final_css
    );
    // blockWidth
    final_css = gspb_width_cssGen(
        blockWidth,
        css_selector_frame,
        final_css,
    );

    gspb_Css_Final(id, final_css, props);
    let editor_css = final_css;

    // Position
    editor_css = gspb_position_cssGen(
        position,
        '#block-' + clientId,
        editor_css,
    );

    let csstransformchange = isEqual(attributesDefault.csstransform.default, props.attributes.csstransform) ? false : true;
    let positionchange = isEqual(attributesDefault.position.default, props.attributes.position) ? false : true;
    let responsivechange = isEqual(attributesDefault.responsive.default, props.attributes.responsive) ? false : true;

    return [

        <InspectorControls>
            <div className="gspb_inspector">
                <InspectorTabs tabs={['general', 'advance']} activeAdvance={(csstransformchange || positionchange || responsivechange) ? true : false}>
                    <InspectorTab key={'general'}>
                        <PanelBody
                            initialOpen={true}
                            title={__('Iframe Settings', 'greenshift-smart-code-ai')}
                        >

                            <TextControl
                                label={__('Iframe URL', 'greenshift-smart-code-ai')}
                                value={src}
                                onChange={(value) => {
                                    if (value.includes('streamlit.app') && !value.endsWith('?embedded=true')) {
                                        value += '?embedded=true';
                                    }
                                    setAttributes({
                                        src: value,
                                    });
                                }}
                            />
                            <TextControl
                                label={__('Iframe Title', 'greenshift-smart-code-ai')}
                                value={title}
                                onChange={(value) => {
                                    setAttributes({
                                        title: value,
                                    });
                                }}
                            />
                            <ToggleControl
                                label={__('Disable Lazy loading', 'greenshift-smart-code-ai')}
                                checked={disablelazy}
                                onChange={(disablelazy) => {
                                    setAttributes({ disablelazy: !disablelazy });
                                }}
                            />
                            <UnitControl
                                label={__('Minimum Height', 'greenshift-smart-code-ai')}
                                value={minHeight}
                                onChange={(value) => {
                                    setAttributes({
                                        minHeight: value,
                                    });
                                }}
                            />

                        </PanelBody>

                        { /* Width Settings */}
                        <PanelBody
                            title={__("Sizing", 'greenshift-smart-code-ai')}
                            initialOpen={false}
                            className={`${isEqual(attributesDefault.blockWidth.default, props.attributes.blockWidth) ? '' : 'gspb_panel_changed'}`}
                        >
                            <BlockWidth
                                attributeName="blockWidth"
                                include={['height']}
                                {...props}
                            />
                        </PanelBody>

                        { /* Spacing */}
                        <PanelBody title={__("Spacing", 'greenshift-smart-code-ai')} initialOpen={false} className={`gspb_smallpadding_btn ${isEqual(attributesDefault.spacing.default, props.attributes.spacing) ? '' : 'gspb_panel_changed'}`}>
                            <Spacing attributeName="spacing" overflow={false} {...props} />
                        </PanelBody>

                        { /* Border Settings */}
                        <PanelBody title={__("Border", 'greenshift-smart-code-ai')} initialOpen={false} className={`${isEqual(attributesDefault.border.default, props.attributes.border) ? '' : 'gspb_panel_changed'}`}>
                            <Border attributeName="border" {...props} />
                        </PanelBody>

                        { /* Background Settings */}
                        <PanelBody
                            title={__("Background and Opacity", 'greenshift-smart-code-ai')}
                            initialOpen={false}
                            className={`gspb_smallpadding_btn ${isEqual(attributesDefault.background.default, props.attributes.background) ? '' : 'gspb_panel_changed'}`}
                        >
                            <Background
                                attributeName="background"
                                exclude={['video']}
                                {...props}
                            />
                        </PanelBody>

                    </InspectorTab>
                    <InspectorTab key={'advance'}>

                        { /* Position Tab */}
                        <PanelBody
                            title={__("Position", 'greenshift-smart-code-ai')}
                            initialOpen={true}
                            className={`${!positionchange ? '' : 'gspb_panel_changed'}`}
                        >
                            <Position attributeName="position" {...props} />
                        </PanelBody>

                        { /* Responsive */}
                        <PanelBody title={__("Responsive and Custom CSS", "greenshift-smart-code-ai")} initialOpen={false}
                            className={`${!responsivechange ? '' : 'gspb_panel_changed'}`}
                        >
                            <Responsive attributeName="responsive" {...props} />
                        </PanelBody>
                    </InspectorTab>
                </InspectorTabs>
            </div>

        </InspectorControls>,

        <BlockControls>
            <AlignmentToolbar
                value={Halign}
                onChange={(value) => {
                    setAttributes({ Halign: value })
                }}
                alignmentControls={ALIGNMENT_CONTROLS}
            />
        </BlockControls>,
        <BlockToolBar {...props} />,
        <>
                <div {...blockProps}>
                    {src &&
                        <iframe class={frameId} src={src} width='100%' height={minHeight} title={title} />
                    }
                    {!src &&
                        <div className="gspb_placeholder_iframe_ai">
                            <TextControl
                                label={__('Add Iframe URL', 'greenshift-smart-code-ai')}
                                value={src}
                                onChange={(value) => {
                                    if (value.includes('streamlit.app') && !value.endsWith('?embedded=true')) {
                                        value += '?embedded=true';
                                    }
                                    setAttributes({
                                        src: value,
                                    });
                                }}
                            />
                        </div>
                    }
                </div>
                <style
                    dangerouslySetInnerHTML={{
                        __html: editor_css,
                    }}
                />
        </>
    ];
}
export default edit;