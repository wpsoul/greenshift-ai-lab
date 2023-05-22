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

add_action('enqueue_block_editor_assets', 'greenShiftAi_editor_assets');

if(!function_exists('gspb_gutenbergAI_is_parent_active')){
	function gspb_gutenbergAI_is_parent_active()
	{
		$active_plugins = get_option('active_plugins', array());

		if (is_multisite()) {
			$network_active_plugins = get_site_option('active_sitewide_plugins', array());
			$active_plugins         = array_merge($active_plugins, array_keys($network_active_plugins));
		}

		foreach ($active_plugins as $basename) {
			if (
				0 === strpos($basename, 'greenshift-animation-and-page-builder-blocks/')
			) {
				return true;
			}
		}

		return false;
	}
}

function greenshift_lab_ai_settings_callback(){

	if (isset($_POST['gspb_save_settings'])) { // Delay script saving
		if (!wp_verify_nonce($_POST['gspb_settings_field'], 'gspb_settings_page_action')) {
			esc_html_e("Sorry, your nonce did not verify.", 'greenshift-animation-and-page-builder-blocks');
			return;
		}
		
		if (isset($_POST['gspb_ailab_openaiapikey'])) {
			$gspb_ailab_openaiapikey = sanitize_text_field($_POST['gspb_ailab_openaiapikey']);
			update_option('gspb_ailab_openaiapikey', $gspb_ailab_openaiapikey);
		}
	}

	$gspb_ailab_openaiapikey = get_option('gspb_ailab_openaiapikey');
	$gspb_ailab_openaiapikey = !empty($gspb_ailab_openaiapikey) ? $gspb_ailab_openaiapikey : '';
	?>
	<style>
		.gspb_ai_lab_settings_form{
			max-width: 1024px;
		}
	</style>
	<div class="gspb_ai_lab_settings_form">
		<form method="POST">
			<h2><?php esc_html_e("Greenshift AI Lab", 'greenshift-animation-and-page-builder-blocks'); ?></h2>
			<div class="greenshift_form">
				<?php wp_nonce_field('gspb_settings_page_action', 'gspb_settings_field'); ?>
				<table class="form-table">
					<tr class="openaiapikey">
						<th>
							<label for="openaiapi"><?php esc_html_e("Open AI API Key", 'greenshift-animation-and-page-builder-blocks'); ?></label>
						</th>
						<td>
							<textarea style="width:100%; min-height:50px;border-color:#ddd" id="gspb_ailab_openaiapikey" name="gspb_ailab_openaiapikey"><?php echo esc_html($gspb_ailab_openaiapikey); ?></textarea>
							<div style="margin-bottom:15px"><a target="_blank" href="https://platform.openai.com/account/api-keys"><?php esc_html_e("Get an API Key", 'greenshift-animation-and-page-builder-blocks'); ?></a></div>
						</td>
					</tr>
				</table>

				<input type="submit" name="gspb_save_settings" value="<?php esc_html_e("Save settings"); ?>" class="button button-primary button-large">
			</div>
		</form>
	</div> <?php
}

if(!function_exists('greenshift_ai_settings')){
	function greenshift_ai_settings(){
		add_submenu_page(
			'options-general.php',
			__( 'Greenshift Lab AI', 'greenshift-animation-and-page-builder-blocks' ),
		   __( 'Greenshift Lab AI','greenshift-animation-and-page-builder-blocks' ),
		   'manage_options',
		   'greenshift-lab-ai',
		   'greenshift_lab_ai_settings_callback',
		   null
	   );
	}
}


if ( ! gspb_gutenbergAI_is_parent_active()) {
	add_action('admin_menu', 'greenshift_ai_settings');
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


add_action('rest_api_init', 'gspb_ai_lab_register_route');

function gspb_ai_lab_register_route()
{

	register_rest_route(
		'greenshift/v1',
		'/gspb_open_ai/',
		array(
			array(
				'methods'             => 'POST',
				'callback'            => 'gspb_get_openai_data',
				'permission_callback' => function () {
					return current_user_can('edit_posts');
				},
				'args'                => array(),
			),
		)
	);

}

function gspb_get_openai_data($request)
{
	$openaiapikey = '';
	if (gspb_gutenbergAI_is_parent_active()) {
		$sitesettings = get_option('gspb_global_settings');
		$openaiapikey = (!empty($sitesettings['openaiapi'])) ? esc_attr($sitesettings['openaiapi']) : '';
	} else {
		$openaiapikey = get_option('gspb_ailab_openaiapikey');
	}

	if(empty( $openaiapikey )){
		return json_encode(array(
			'success' => false,
			'message' => 'You must need to add API key in plugin settings.' ,
		));
	}

	try {

		$openapiendpoint = 'https://api.openai.com/v1/chat/completions';

		$data = $request->get_json_params();
		$messages = isset( $data[ 'messages' ]) ? $data[ 'messages' ] : '';

		$payload = array(
			'model' => "gpt-3.5-turbo",
			"temperature" => 0.7,
			'messages' => $messages
		);
		
		if ($messages) {
			$curl = curl_init();

				curl_setopt_array($curl, array(
					CURLOPT_URL => $openapiendpoint,
					CURLOPT_RETURNTRANSFER => true,
					CURLOPT_ENCODING => '',
					CURLOPT_MAXREDIRS => 10,
					CURLOPT_TIMEOUT => 0,
					CURLOPT_FOLLOWLOCATION => true,
					CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
					CURLOPT_CUSTOMREQUEST => 'POST',
					CURLOPT_POSTFIELDS => json_encode($payload),
					CURLOPT_HTTPHEADER => array(
						'Content-Type: application/json',
						'Authorization: Bearer '.$openaiapikey.''
					),
				));

				$response = curl_exec($curl);

				return json_encode(array(
					'success' => true,
					'response' => $response ,
				));
		}
		
	} catch (Exception $e) {
		return json_encode(array(
			'success' => false,
			'message' => $e->getMessage(),
		));
	}
}