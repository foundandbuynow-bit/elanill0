<?php
// Purga las tres cachés que se superponen: página (LiteSpeed), objeto y cabeceras de tema.
wp_clean_themes_cache(true);
if (class_exists('WP_Theme_JSON_Resolver')) WP_Theme_JSON_Resolver::clean_cached_data();
wp_cache_flush();
do_action('litespeed_purge_all');
flush_rewrite_rules(false);
return ['tema' => get_stylesheet(), 'version_css' => wp_get_theme()->get('Version') . '.' . filemtime(get_theme_file_path('style.css')), 'purgado' => true];
