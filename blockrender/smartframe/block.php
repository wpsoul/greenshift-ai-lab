<?php

namespace Greenshift\Blocks;
defined('ABSPATH') OR exit;

class SmartCode{

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

		$blockClassName = 'gspb-smartcode '.(!empty($className) ? $className : '').'';

		$out = '<div class="'.$blockClassName.'">';

		$out .= $htmlcontent;

        $out .='</div>';

		if ( ! empty( $csscontent ) ) {

			$cssContent = wp_strip_all_tags( $csscontent );

			wp_register_style( 'smartcode', false );
			wp_enqueue_style( 'smartcode' );
			wp_add_inline_style( 'smartcode', $cssContent );

		}

		if ( ! empty( $scriptcontent ) ) {
			
			$scriptcontent = wp_strip_all_tags( $scriptcontent );

			wp_register_script( 'smartcode', '', array(), '', true );
			wp_enqueue_script( 'smartcode' );
			wp_add_inline_script( 'smartcode', $scriptcontent );
			
		}
	

		return $out;
	}
}

new SmartCode;