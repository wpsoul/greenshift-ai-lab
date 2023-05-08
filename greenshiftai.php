<?php
/**
 * Plugin Name: Greenshift AI Lab
 * Description: Smart helpers with AI for WordPress
 * Author: Wpsoul
 * Author URI: https://greenshiftwp.com
 * Version: 0.1
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
} 

// Define Dir URL
define('GREENSHIFTAI_DIR_URL', plugin_dir_url(__FILE__));
define( 'GREENSHIFTAI_DIR_PATH', plugin_dir_path( __FILE__ ) );


/**
 * GreenShift Blocks Category
 */
if(!function_exists('gspb_greenShiftAi_category')){
	function gspb_greenShiftAi_category( $categories, $post ) {
		return array_merge(
			array(
				array(
					'slug'  => 'greenShiftAi',
					'title' => __( 'GreenShift AI', 'greenshift-ai-lab'),
				),
			),
			$categories
		);
	}
}
add_filter( 'block_categories_all', 'gspb_greenShiftAi_category', 1, 2 );

//////////////////////////////////////////////////////////////////
// Register server side
//////////////////////////////////////////////////////////////////
require_once GREENSHIFTAI_DIR_PATH .'blockrender/customhtml/block.php';


//////////////////////////////////////////////////////////////////
// Functions to render conditional scripts
//////////////////////////////////////////////////////////////////

// Hook: Frontend assets.
add_action('init', 'greenShiftAi_register_init');

if(!function_exists('greenShiftAi_register_init')){
	function greenShiftAi_register_init()
	{

        wp_register_script(
           'greenshift-customhtml',
           GREENSHIFTAI_DIR_URL . 'libs/customhtml/index.js',
           array(),
           '1.0',
           true
        );
	}
}


add_filter('render_block', 'greenShiftAi_block_script_assets', 10, 2);
if(!function_exists('greenShiftAi_block_script_assets')){
	function greenShiftAi_block_script_assets($html, $block)
	{
		// phpcs:ignore
	
		//Main styles for blocks are loaded via Redux. Can be found in src/customJS/editor/store/index.js and src/gspb-library/helpers/reusable_block_css/index.js
	
		if(!is_admin()){
			if ($block['blockName'] == 'greenshift-blocks/customcode') {
				//wp_enqueue_script('gspbspline3d');
			}
		}
	
		return $html;
	}
}

//////////////////////////////////////////////////////////////////
// Enqueue Gutenberg block assets for backend editor.
//////////////////////////////////////////////////////////////////

if(!function_exists('greenShiftAi_editor_assets')){
	function greenShiftAi_editor_assets()
	{
		// phpcs:ignor
	
		$index_asset_file = include(GREENSHIFTAI_DIR_PATH . 'build/index.asset.php');
	
	
		// Blocks Assets Scripts
		wp_enqueue_script(
			'greenShiftAi-block-js', // Handle.
			GREENSHIFTAI_DIR_URL . 'build/index.js',
			array('wp-block-editor', 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-data'),
			$index_asset_file['version'],
			true
		);
		
	
		// Styles.
		wp_enqueue_style(
			'greenShiftAi-block-css', // Handle.
			GREENSHIFTAI_DIR_URL . 'build/index.css', // Block editor CSS.
			array('wp-edit-blocks'),
			$index_asset_file['version']
		);

	}
}

//////////////////////////////////////////////////////////////////
// Show if parent is not loaded
//////////////////////////////////////////////////////////////////
function greenshift_ai_admin_notice_warning() {
	?>
	<div class="notice notice-warning">
		<p><?php printf( __( 'Please, activate %s plugin to extend Greenshift AI Lab' ), '<a href="https://wordpress.org/plugins/greenshift-animation-and-page-builder-blocks" target="_blank">Greenshift</a>' ) ; ?></p>
	</div>
	<?php
}