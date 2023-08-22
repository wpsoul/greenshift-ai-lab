/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { transformStyles, store as blockEditorStore } from '@wordpress/block-editor';
import { SandBox } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// Default styles used to unset some of the styles
// that might be inherited from the editor style.
const DEFAULT_STYLES = `html,body,:root {
							margin: 0 !important;
							padding: 0 !important;
							overflow: visible !important;
							min-height: auto !important;
						}.gspb-prettyform input:not(.wp-element-button),.gspb-prettyform select,.gspb-prettyform textarea{border:1px solid var(--wp--preset--color--lightborder,#cecece6b);border-radius:0;width:100%;padding:9px 15px;transition:border-color .3s cubic-bezier(.165,.84,.44,1),background-color .3s cubic-bezier(.165,.84,.44,1);background-color:var(--wp--preset--color--inputbg,#fafbfd);border-radius:0;color:var(--wp--preset--color--inputtext,#444);font-size:var(--wp--preset--font-size--medium,1.2rem);font-weight:var(--wp--custom--font-weight--normal,400);line-height:var(--wp--custom--line-height--medium,1.6)}.gspb-prettyform input:not(.wp-element-button),.gspb-prettyform select{font-size:var(--wp--preset--font-size--small,1rem);line-height:var(--wp--custom--line-height--medium,)}.gspb-prettyform select{padding-right:25px;background-image:url("data:image/svg+xml,%3Csvg width='21' height='13' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.5.379L20.621 2.5 10.5 12.621.379 2.5 2.5.379l8 8z' fill='%234F5D6D' fill-rule='nonzero'/%3E%3C/svg%3E");background-repeat:no-repeat,repeat;background-size:8px auto,100%;background-position:right 10px top 50%,0 0}.gspb-prettyform textarea{padding:10px 20px}.gspb-prettyform input[type=checkbox],.gspb-prettyform input[type=radio]{width:16px;height:16px;flex-shrink:0;display:inline-block;margin:0;margin-right:8px;text-align:center;vertical-align:middle;cursor:pointer;border:0}.gspb-prettyform input[type=checkbox],.gspb-prettyform input[type=radio]{box-sizing:border-box;padding:0}.gspb-prettyform input:focus,.gspb-prettyform textarea:focus{background-color:var(--wp--preset--color--lightbg,#f9fafb)}.gspb-prettyform input[type=button]:not(.wp-element-button),.gspb-prettyform input[type=email],.gspb-prettyform input[type=search],.gspb-prettyform input[type=submit]:not(.wp-element-button),.gspb-prettyform input[type=text],.gspb-prettyform select,.gspb-prettyform textarea{-webkit-appearance:none;appearance:none}.gspb-prettyform ::placeholder{color:var(--wp--preset--color--black,#000);font-size:var(--wp--preset--font-size--small,1rem);opacity:.6}`; 


export default function HTMLEditPreview({ content, isSelected, blockStyle, blockScript }) {

	const settingStyles = useSelect((select) => {
		return select(blockEditorStore).getSettings()?.styles;
	}, []);

	const styles = useMemo(
		() => [DEFAULT_STYLES, ...blockStyle, ...transformStyles(settingStyles)],
		[settingStyles]
	);

	const blob = new Blob([blockScript], { type: 'application/javascript' });

	const scriptsUrl = [URL.createObjectURL(blob)];

	return (
		<>
			<SandBox html={content} scripts={scriptsUrl} styles={styles} type="embed" />
			{!isSelected && (
				<div className="block-library-html__preview-overlay"></div>
			)}
		</>
	);
}