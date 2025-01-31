<?php
/**
 * Plugin Name: Greenshift Smart Code AI
 * Description: Smart code blocks with AI for core editor
 * Author: Wpsoul
 * Author URI: https://greenshiftwp.com
 * Version: 0.3
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
} 

// Define Dir URL
define('GREENSHIFTCODEAI_DIR_URL', plugin_dir_url(__FILE__));
define( 'GREENSHIFTCODEAI_DIR_PATH', plugin_dir_path( __FILE__ ) );


/**
 * GreenShift Blocks Category
 */
if(!function_exists('gspb_greenShiftCodeAi_category')){
	function gspb_greenShiftCodeAi_category( $categories, $post ) {
		return array_merge(
			array(
				array(
					'slug'  => 'greenShiftCodeAi',
					'title' => esc_html__( 'GreenShift Code AI', 'greenshift-smart-code-ai'),
				),
			),
			$categories
		);
	}
}
add_filter( 'block_categories_all', 'gspb_greenShiftCodeAi_category', 1, 2 );

//////////////////////////////////////////////////////////////////
// Register server side
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// Functions to render conditional scripts
//////////////////////////////////////////////////////////////////

// Hook: Frontend assets.
add_action('init', 'greenShiftAi_register_init');

if(!function_exists('greenShiftAi_register_init')){
	function greenShiftAi_register_init()
	{

        wp_register_script(
           'gs-smartcode-ai-code',
           GREENSHIFTCODEAI_DIR_URL . 'libs/smartcode/index.js',
           array(),
           '1.0',
           true
        );

		wp_register_style(
			'gs-smartcode-ai-code',
			GREENSHIFTCODEAI_DIR_URL . 'libs/smartcode/index.css',
			array(),
			'1.0'
		 );

		wp_register_style(
			'gs-smartcode-ai-prettyform',
			GREENSHIFTCODEAI_DIR_URL . 'libs/smartcode/prettyform.css',
			array(),
			'1.1'
		 );

		register_block_type(__DIR__ . '/blockrender/smartcode');
		if(gspb_gutenbergAI_is_parent_active()){
			register_block_type(__DIR__ . '/blockrender/smartframe');
		}

		// Set labels for the post type
		$labels = array(
			'name'               => esc_html__( 'Code Snippets', 'greenshift-smart-code-ai' ),
			'singular_name'      => esc_html__( 'Code Snippet', 'greenshift-smart-code-ai' ),
			'add_new_item'       => esc_html__( 'Add New Code Snippet', 'greenshift-smart-code-ai' ),
			'edit_item'          => esc_html__( 'Edit Code Snippet', 'greenshift-smart-code-ai' ),
			'new_item'           => esc_html__( 'New Code Snippet', 'greenshift-smart-code-ai' ),
			'view_item'          => esc_html__( 'View Code Snippet', 'greenshift-smart-code-ai' ),
			'search_items'       => esc_html__( 'Search Code Snippets', 'greenshift-smart-code-ai' ),
			'not_found'          => esc_html__( 'No code snippets found', 'greenshift-smart-code-ai' ),
			'not_found_in_trash' => esc_html__( 'No code snippets found in Trash', 'greenshift-smart-code-ai' )
		);
			
		// Set other options for the post type
		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'rewrite'            => array( 'slug' => 'gs-code-snippets' ),
			'has_archive'        => false,
			'hierarchical'        => false,
			'menu_position'      => 20,
			'supports'           => array( 'title', 'editor','custom-fields' ),
			'show_in_rest'       => true,
			'capabilities'     => array(
				'delete_posts'           => 'edit_theme_options',
				'delete_post'            => 'edit_theme_options',
				'delete_published_posts' => 'edit_theme_options',
				'delete_private_posts'   => 'edit_theme_options',
				'delete_others_posts'    => 'edit_theme_options',
				'edit_post'              => 'edit_theme_options',
				'edit_posts'             => 'edit_theme_options',
				'edit_others_posts'      => 'edit_theme_options',
				'edit_published_posts'   => 'edit_theme_options',
				'read_post'              => 'edit_theme_options',
				'read_private_posts'     => 'edit_theme_options',
				'publish_posts'          => 'edit_theme_options',
			),
			'template' => array(
				array(
				  'core/code'
				),
			),
			'template_lock' => 'insert',
		);
			
		// Register the post type
		register_post_type( 'gscodesnippet', $args );
	}
}


add_filter('render_block', 'greenShiftAi_block_script_assets', 10, 2);
if(!function_exists('greenShiftAi_block_script_assets')){
	function greenShiftAi_block_script_assets($html, $block)
	{
		// phpcs:ignore
	
		if(!is_admin()){
			if ($block['blockName'] == 'greenshift-blocks/smartcode') {
				if(!empty($block['attrs']['scriptcontent'])){
					wp_enqueue_script('gs-smartcode-ai-code');
					$scriptcontent = wp_strip_all_tags( $block['attrs']['scriptcontent']);
					wp_add_inline_script( 'gs-smartcode-ai-code', $scriptcontent );
				}
				if(!empty($block['attrs']['csscontent'])){
					wp_enqueue_style('gs-smartcode-ai-code');
					$csscontent = wp_strip_all_tags( $block['attrs']['csscontent']);
					wp_add_inline_style( 'gs-smartcode-ai-code', $csscontent );
				}
				if(!empty($block['attrs']['prettyform'])){
					wp_enqueue_style('gs-smartcode-ai-prettyform');
				}
				if(!empty($block['attrs']['phpcontent']) && !empty($block['attrs']['executeSnippet']) && !empty($block['attrs']['snippetID'])){
					$html = str_replace('gspb-smartcode">', 'gspb-smartcode">'.greenshift_smartcodeai_render_snippet_shortcode(array('id'=>$block['attrs']['snippetID'])), $html);
				}
			}
		}
	
		return $html;
	}
}

//////////////////////////////////////////////////////////////////
// Enqueue Gutenberg block assets for backend editor.
//////////////////////////////////////////////////////////////////
add_action('admin_init', 'greenShiftAi_editor_assets');
if(!function_exists('greenShiftAi_editor_assets')){
	function greenShiftAi_editor_assets()
	{
		// phpcs:ignore
	
		$index_asset_file = include(GREENSHIFTCODEAI_DIR_PATH . 'build/index.asset.php');
		$indexgs_asset_file = include(GREENSHIFTCODEAI_DIR_PATH . 'build/indexgs.asset.php');
	
		
		// Blocks Assets Scripts
		wp_register_script(
			'greenShiftAi-block-js', // Handle.
			GREENSHIFTCODEAI_DIR_URL . 'build/index.js',
			array('wp-block-editor', 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-data'),
			$index_asset_file['version'],
			true
		);
		
		// Styles.
		wp_register_style(
			'greenShiftAi-block-css', // Handle.
			GREENSHIFTCODEAI_DIR_URL . 'build/index.css', // Block editor CSS.
			array('wp-edit-blocks'),
			$index_asset_file['version']
		);

		if(gspb_gutenbergAI_is_parent_active()){
			// Blocks Assets Scripts
			wp_register_script(
				'greenShiftAiGS-block-js', // Handle.
				GREENSHIFTCODEAI_DIR_URL . 'build/indexgs.js',
				array('wp-block-editor', 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-data'),
				$indexgs_asset_file['version'],
				true
			);
			
			// Styles.
			wp_register_style(
				'greenShiftAiGS-block-css', // Handle.
				GREENSHIFTCODEAI_DIR_URL . 'build/indexgs.css', // Block editor CSS.
				array('wp-edit-blocks'),
				$indexgs_asset_file['version']
			);
		}


	}
}

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

function greenshift_smart_code_ai_settings_callback(){

	if (isset($_POST['gspb_save_settings'])) { // save settings
		if (!wp_verify_nonce(sanitize_text_field( wp_unslash($_POST['gspb_settings_field'])), 'gspb_settings_page_action')) {
			esc_html_e("Sorry, your nonce did not verify.", 'greenshift-smart-code-ai');
			return;
		}
		
		if (isset($_POST['greenshift_smartcode_openaiapikey'])) {
			$greenshift_smartcode_openaiapikey = sanitize_text_field($_POST['greenshift_smartcode_openaiapikey']);
			update_option('greenshift_smartcode_openaiapikey', $greenshift_smartcode_openaiapikey);
		}

		if (isset($_POST['greenshift_smartcode_claudeapikey'])) {
			$greenshift_smartcode_claudeapikey = sanitize_text_field($_POST['greenshift_smartcode_claudeapikey']);
			update_option('greenshift_smartcode_claudeapikey', $greenshift_smartcode_claudeapikey);
		}

		if (isset($_POST['greenshift_smartcode_deepseekapikey'])) {
			$greenshift_smartcode_deepseekapikey = sanitize_text_field($_POST['greenshift_smartcode_deepseekapikey']);
			update_option('greenshift_smartcode_deepseekapikey', $greenshift_smartcode_deepseekapikey);
		}



		if (isset($_POST['greenshift_smartcode_openaiapimodel'])) {
			$greenshift_smartcode_openaiapimodel = sanitize_text_field($_POST['greenshift_smartcode_openaiapimodel']);
			update_option('greenshift_smartcode_openaiapimodel', $greenshift_smartcode_openaiapimodel);
		}
	}

	$greenshift_smartcode_openaiapikey = get_option('greenshift_smartcode_openaiapikey');
	$greenshift_smartcode_openaiapikey = !empty($greenshift_smartcode_openaiapikey) ? $greenshift_smartcode_openaiapikey : '';

	$greenshift_smartcode_claudeapikey = get_option('greenshift_smartcode_claudeapikey');
	$greenshift_smartcode_claudeapikey = !empty($greenshift_smartcode_claudeapikey) ? $greenshift_smartcode_claudeapikey : '';

	$greenshift_smartcode_deepseekapikey = get_option('greenshift_smartcode_deepseekapikey');
	$greenshift_smartcode_deepseekapikey = !empty($greenshift_smartcode_deepseekapikey) ? $greenshift_smartcode_deepseekapikey : '';

	$greenshift_smartcode_openaiapimodel = get_option('greenshift_smartcode_openaiapimodel');
	$greenshift_smartcode_openaiapimodel = !empty($greenshift_smartcode_openaiapimodel) ? $greenshift_smartcode_openaiapimodel : 'gpt-3.5-turbo';
	?>
	<style>
		.gspb_ai_lab_settings_form{
			max-width: 1024px;
		}
	</style>
	<div class="gspb_ai_lab_settings_form">
		<form method="POST">
			<h2><?php esc_html_e("Greenshift Code AI Lab", 'greenshift-smart-code-ai'); ?></h2>
			<div class="greenshift_form">
				<?php wp_nonce_field('gspb_settings_page_action', 'gspb_settings_field'); ?>
				<table class="form-table">
					<tr class="openaiapikey">
						<th>
							<label for="openaiapi"><?php esc_html_e("Open AI API Key", 'greenshift-smart-code-ai'); ?></label>
						</th>
						<td>
							<textarea style="width:100%; min-height:50px;border-color:#ddd" id="greenshift_smartcode_openaiapikey" name="greenshift_smartcode_openaiapikey"><?php echo esc_html($greenshift_smartcode_openaiapikey); ?></textarea>
							<div style="margin-bottom:15px"><a target="_blank" href="https://platform.openai.com/account/api-keys"><?php esc_html_e("Get an API Key", 'greenshift-smart-code-ai'); ?></a></div>
						</td>
					</tr>
					<tr class="claudeapikey">
						<th>
							<label for="greenshift_smartcode_claudeapikey"><?php esc_html_e("Claude API Key", 'greenshift-smart-code-ai'); ?></label>
						</th>
						<td>
							<textarea style="width:100%; min-height:50px;border-color:#ddd" id="greenshift_smartcode_claudeapikey" name="greenshift_smartcode_claudeapikey"><?php echo esc_html($greenshift_smartcode_claudeapikey); ?></textarea>
						</td>
					</tr>
					<tr class="deepseekapikey">
						<th>
							<label for="greenshift_smartcode_deepseekapikey"><?php esc_html_e("DeepSeek API Key", 'greenshift-smart-code-ai'); ?></label>
						</th>
						<td>
							<textarea style="width:100%; min-height:50px;border-color:#ddd" id="greenshift_smartcode_deepseekapikey" name="greenshift_smartcode_deepseekapikey"><?php echo esc_html($greenshift_smartcode_deepseekapikey); ?></textarea>
						</td>
					</tr>
					<tr class="openaiapimodel">
						<th>
							<label for="greenshift_smartcode_openaiapimodel"><?php esc_html_e("Open AI Model", 'greenshift-smart-code-ai'); ?></label>
						</th>
						<td>
							<select name="greenshift_smartcode_openaiapimodel">
								<option value="gpt-3.5-turbo" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-3.5-turbo'); ?>> gpt-3.5-turbo </option>
								<option value="gpt-4" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-4'); ?>> gpt-4 </option>
								<option value="gpt-4-turbo" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-4-turbo'); ?>> gpt-4-turbo </option>
								<option value="gpt-4-32k" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-4-32k'); ?>> gpt-4-32k </option>
								<option value="gpt-4o" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-4o'); ?>> gpt-4o </option>
								<option value="gpt-4o-mini" <?php selected($greenshift_smartcode_openaiapimodel, 'gpt-4o-mini'); ?>> gpt-4o-mini </option>
								<option value="o1" <?php selected($greenshift_smartcode_openaiapimodel, 'o1'); ?>> o1 </option>
								<option value="o1-mini" <?php selected($greenshift_smartcode_openaiapimodel, 'o1-mini'); ?>> o1-mini </option>
								<option value="o1-preview" <?php selected($greenshift_smartcode_openaiapimodel, 'o1-preview'); ?>> o1-preview </option>
								<option value="claude-3-5-sonnet-20241022" <?php selected($greenshift_smartcode_openaiapimodel, 'claude-3-5-sonnet-20241022'); ?>> claude-3-5-sonnet-20241022 </option>
								<option value="claude-3-5-haiku-20241022" <?php selected($greenshift_smartcode_openaiapimodel, 'claude-3-5-haiku-20241022'); ?>> claude-3-5-haiku-20241022 </option>
								<option value="deepseek-chat" <?php selected($greenshift_smartcode_openaiapimodel, 'deepseek-chat'); ?>> deepseek-chat </option>
							</select>
						</td>
					</tr>
				</table>

				<input type="submit" name="gspb_save_settings" value="<?php esc_html_e("Save settings"); ?>" class="button button-primary button-large">
			</div>
		</form>
	</div> <?php
}

if(!function_exists('greenshift_smartcodeai_settings')){
	function greenshift_smartcodeai_settings(){
		add_submenu_page(
			'options-general.php',
			esc_html__( 'Smart Code AI', 'greenshift-smart-code-ai' ),
		   esc_html__( 'Smart Code AI','greenshift-smart-code-ai' ),
		   'manage_options',
		   'greenshift-smart-code-ai',
		   'greenshift_smart_code_ai_settings_callback',
		   null
	   );
	}
}


if ( ! gspb_gutenbergAI_is_parent_active()) {
	add_action('admin_menu', 'greenshift_smartcodeai_settings');
} 

//////////////////////////////////////////////////////////////////
// Show if parent is not loaded
//////////////////////////////////////////////////////////////////
function greenshift_smartcodeai_admin_notice_warning() {
	?>
	<div class="notice notice-warning">
		<p><?php printf( esc_html__( 'Please, activate %s plugin to extend Greenshift Smart Code AI Lab' ), '<a href="https://wordpress.org/plugins/greenshift-smart-code-ai" target="_blank">Greenshift</a>' ) ; ?></p>
	</div>
	<?php
}


add_action('rest_api_init', 'gspb_ai_lab_register_route');

function gspb_ai_lab_register_route()
{

	register_rest_route(
		'greenshift/v1',
		'/model_ai/',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'gspb_get_ai_data',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				},
				'args' => array(),
			),
		)
	);

	register_rest_route(
		'greenshift/v1',
		'/get-php-preview/',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'gspb_get_php_preview_data',
				'permission_callback' => function () {
					return current_user_can('manage_options');
				},
				'args' => array(
					'id' => array(
						'type' => 'string',
						'required' => true,
					)
				),
			),
		)
	);
}

function gspb_get_php_preview_data(WP_REST_Request $request)
{
	$id = intval($request->get_param('id'));
	$result = '';

	if($id){
		$result = greenshift_smartcodeai_render_snippet_shortcode(array('id'=>$id));
	}
	return json_encode($result);
}

function gspb_get_ai_data(WP_REST_Request $request)
{
	$openaiapikey = $openaiapimodel = '';
	if (gspb_gutenbergAI_is_parent_active()) {
		$sitesettings = get_option('gspb_global_settings');
		$openaiapikey = (!empty($sitesettings['openaiapi'])) ? esc_attr($sitesettings['openaiapi']) : '';
		$claudeapikey = (!empty($sitesettings['claudeapi'])) ? esc_attr($sitesettings['claudeapi']) : '';
		$deepseekapikey = (!empty($sitesettings['deepseekapi'])) ? esc_attr($sitesettings['deepseekapi']) : '';
		$openaiapimodel = (!empty($sitesettings['openaiapimodel'])) ? esc_attr($sitesettings['openaiapimodel']) : 'gpt-3.5-turbo';
	} else {
		$openaiapikey = get_option('greenshift_smartcode_openaiapikey');
		$claudeapikey = get_option('greenshift_smartcode_claudeapikey');
		$deepseekapikey = get_option('greenshift_smartcode_deepseekapikey');
		$openaiapimodel = !empty(get_option('greenshift_smartcode_openaiapimodel')) ? get_option('greenshift_smartcode_openaiapimodel') : 'gpt-3.5-turbo';

	}

	if(empty( $openaiapikey ) && empty( $claudeapikey ) && empty( $deepseekapikey )){
		return json_encode(array(
			'success' => false,
			'message' => 'You must need to add API key in plugin settings or in Greenshift - Settings - API keys.' ,
		));
	}else{
		if (($openaiapimodel == 'gpt-3.5-turbo' || $openaiapimodel == 'gpt-4' || $openaiapimodel == 'gpt-4-turbo' || $openaiapimodel == 'gpt-4-32k' || $openaiapimodel == 'gpt-4o' || $openaiapimodel == 'gpt-4o-mini' || $openaiapimodel == 'o1' || $openaiapimodel == 'o1-mini' || $openaiapimodel == 'o1-preview' ) && empty( $openaiapikey )) {
			return json_encode(array(
				'success' => false,
				'message' => 'You must need to add Open AI API key in plugin settings or in Greenshift - Settings - API keys.' ,
			));
		} elseif (($openaiapimodel == 'claude-3-5-sonnet-20241022' || $openaiapimodel == 'claude-3-5-haiku-20241022') && empty( $claudeapikey )) {
			return json_encode(array(
				'success' => false,
				'message' => 'You must need to add Claude API key in plugin settings or in Greenshift - Settings - API keys.' ,
			));
		} elseif (($openaiapimodel == 'deepseek-chat' || $openaiapimodel == 'deepseek-reasoner') && empty( $deepseekapikey )) {
			return json_encode(array(
				'success' => false,
				'message' => 'You must need to add DeepSeek API key in plugin settings or in Greenshift - Settings - API keys.' ,
			));
		} else {
			return json_encode(array(
				'success' => true,
				'key' => ($openaiapimodel == 'deepseek-chat' || $openaiapimodel == 'deepseek-reasoner') ? $deepseekapikey : (($openaiapimodel == 'claude-3-5-sonnet-20241022' || $openaiapimodel == 'claude-3-5-haiku-20241022') ? $claudeapikey : $openaiapikey),
				'model' => $openaiapimodel,
			));
		}
	}
}

add_action( 'rest_api_init', 'register_block_core_site_logo_setting', 10 );

/**
 * Register a core site setting for a site logo
 */
add_action( 'rest_api_init', 'greenshift_register_ai_setting' );
function greenshift_register_ai_setting() {

	$args = array(
		'sanitize_callback' => 'sanitize_text_field',
		'default'      => '',
		'type'         => 'string',
		'show_in_rest' => true,
	);

	register_setting( 'greenshift_smartcode', 'greenshift_smartcode_openaiapimodel', $args ); 
}

function greenshift_smartcodeai_render_snippet_shortcode($atts) {
	// extract shortcode attributes
	$atts = shortcode_atts(
	  	array(
			'id' => '',
	  	),
	  	$atts,
	  	'gspb_codesnippet'
	);

	$content = '';
  
	// get post or page by ID
	$post_id = intval($atts['id']);
	if(!$post_id){
		return $content;
	}
	$post = get_post($post_id);
  
	// if post exists, return title
	if (is_object($post) && $post->post_status == 'publish' && $post->post_type == 'gscodesnippet') {
	  	$content = $post->post_content;
		  if($content){
			preg_match('/<code(?:\s+[a-z]+="[^"]*")*>(.*?)<\/code>/ims', $content, $matches);
			if(empty($matches[1])){
				return $content;
			}
			$content = htmlspecialchars_decode($matches[1]);
			if($content){
				if (preg_match("#<\?php(.*)\?>#s", $content, $matches)) {
		
					ob_start();
		
					try {
						eval('?>' . $content. '<?php');
		
					} catch (Exception $e) {
						if (is_user_logged_in()) {
							echo esc_html($e->getMessage());
						}
						else {
							esc_html_e("An error occurred!", 'greenshift_smart-code-ai');
						}
					}
		
					$content = ob_get_clean();
				}
			}
		}
	} 
	return '<div class="gs-executed">'.$content.'</div>';
}
  
// register shortcode
add_shortcode('gspb_codesnippet', 'greenshift_smartcodeai_render_snippet_shortcode');