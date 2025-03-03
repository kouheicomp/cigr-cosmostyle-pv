<?php

add_action("init", "create_post_type");
function create_post_type()
{
  // TOP eBook
  register_post_type("article", array(
    "labels" => array(
      "name" => __("記事"),
      "singular_name" => __("article"),
    ),
    'public' => false,
    'show_ui' => true,
    "has_archive" => false,
    'supports' => array('title'),
  ));


}
