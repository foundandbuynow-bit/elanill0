<?php
// Ajustes del sitio, página de inicio estática, logotipo, tema y purga de cachés.
$data = json_decode(file_get_contents(wp_get_upload_dir()['basedir'] . '/e0-content.json'), true);
$media = $data['media'];
$out = [];

// direcciones con https (el certificado ya está activo)
update_option('siteurl', 'https://elanill0.com');
update_option('home', 'https://elanill0.com');
update_option('blogname', 'Elanill0');
update_option('blogdescription', 'Joyas de acero inoxidable');
update_option('timezone_string', 'Europe/Madrid');
update_option('default_comment_status', 'closed');
update_option('default_ping_status', 'closed');
update_option('blog_public', '1');

// logotipo e icono del sitio (desde la mediateca)
if (!empty($media['logo']['id'])) update_option('site_logo', $media['logo']['id']);
if (!empty($media['icon']['id'])) update_option('site_icon', $media['icon']['id']);

// textos SEO de la portada de productos y de la tienda
$tienda = get_page_by_path('tienda');
if ($tienda) {
    update_option('e0_tienda_titulo', get_post_meta($tienda->ID, 'seo_titulo', true));
    update_option('e0_tienda_descripcion', get_post_meta($tienda->ID, 'seo_descripcion', true));
}

// página de inicio estática (regla 4: la portada es una página real)
$inicio = get_page_by_path('inicio');
if ($inicio) { update_option('show_on_front', 'page'); update_option('page_on_front', $inicio->ID); update_option('page_for_posts', 0); $out['inicio'] = $inicio->ID; }

// contenido de ejemplo de WordPress
foreach (get_posts(['post_type' => 'post', 'post_status' => 'any', 'posts_per_page' => 20, 'fields' => 'ids']) as $pid) { wp_delete_post($pid, true); }
$priv = get_page_by_path('privacy-policy');
if ($priv) { wp_delete_post($priv->ID, true); }
update_option('wp_page_for_privacy_policy', 0);
$pp = get_page_by_path('politica-de-privacidad');
if ($pp) update_option('wp_page_for_privacy_policy', $pp->ID);

// tema
$t = wp_get_theme('elanill0-theme');
if (!$t->exists()) return 'El tema no está instalado';
switch_theme('elanill0-theme');
$out['tema_activo'] = get_stylesheet();

// enlaces permanentes y cachés
global $wp_rewrite;
$wp_rewrite->set_permalink_structure('/%postname%/');
$wp_rewrite->flush_rules(true);
wp_clean_themes_cache(true);
if (class_exists('WP_Theme_JSON_Resolver')) WP_Theme_JSON_Resolver::clean_cached_data();
wp_cache_flush();
do_action('litespeed_purge_all');
$out['cache'] = 'purgada';
return $out;
