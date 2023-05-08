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
		'id' => array(
			'type'    => 'string',
			'default' => null,
		),
	);


	public function render_block($settings = array(), $inner_content=''){
		extract($settings);

		$blockId = 'gspb-id-'.$id;
		$blockClassName = 'gspb-customhtml '.$blockId.' '.(!empty($className) ? $className : '').' ';

		$out = '<div id="'.$blockId.'" class="'.$blockClassName.'">';

        $out .='</div>';
		return $out;
	}
}

new CustomHtml;