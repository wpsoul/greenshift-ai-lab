<?php

namespace Greenshift\Blocks;
defined('ABSPATH') OR exit;

class CustomHtml{

	public function __construct(){
		add_action('init', array( $this, 'init_handler' ));
	}

	public function init_handler(){
		register_block_type(__DIR__, array(
                'render_callback' => array( $this, 'render_block' ),
                'attributes'      => $this->attributes
            )
		);
	}

	public $attributes = array(
		'htmlcontent' => array(
			'type'    => 'string',
			'default' => "",
		),
		'csscontent' => array(
			'type'    => 'string',
			'default' => "",
		),
		'scriptcontent' => array(
			'type'    => 'string',
			'default' => "",
		),
	);


	public function render_block($settings = array(), $inner_content=''){

		extract($settings);

		$blockClassName = 'gspb-customhtml '.(!empty($className) ? $className : '').'';

		$out = '<div class="'.$blockClassName.'">';

		$out .= $htmlcontent;

        $out .='</div>';

		if ( ! empty( $csscontent ) ) {

			$cssContent = wp_strip_all_tags( $csscontent );

			wp_register_style( 'customhtml', false );
			wp_enqueue_style( 'customhtml' );
			wp_add_inline_style( 'customhtml', $cssContent );

		}

		if ( ! empty( $csscontent ) ) {
			
			$scriptcontent = wp_strip_all_tags( $scriptcontent );

			wp_register_script( 'customhtml', '', array(), '', true );
			wp_enqueue_script( 'customhtml' );
			wp_add_inline_script( 'customhtml', $scriptcontent );
			
		}
	

		return $out;
	}
}

new CustomHtml;