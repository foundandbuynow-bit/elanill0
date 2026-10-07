<?php
/**
 * Elanill0 · tema de bloques. El diseño vive en archivos (style.css, theme.json, plantillas);
 * el contenido, en páginas y productos editables desde el escritorio de WordPress.
 */
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('responsive-embeds');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    remove_theme_support('core-block-patterns');
    add_editor_style(array('style.css', 'assets/editor.css'));
});

/* Versión de los recursos = versión del tema + fecha del archivo: cualquier cambio rompe la caché del navegador */
function elanill0_ver($file) {
    $p = get_theme_file_path($file);
    return wp_get_theme()->get('Version') . '.' . (file_exists($p) ? filemtime($p) : '0');
}
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('elanill0-style', get_stylesheet_uri(), array(), elanill0_ver('style.css'));
    wp_enqueue_script('elanill0-app', get_theme_file_uri('assets/app.js'), array(), elanill0_ver('assets/app.js'), array('in_footer' => true, 'strategy' => 'defer'));
});

/* Enlace de accesibilidad y precarga de las tipografías propias */
add_action('wp_body_open', function () {
    echo '<a class="skip" href="#contenido">Saltar al contenido</a>';
});
add_action('wp_head', function () {
    foreach (array('jost-latin', 'playfair-display-latin') as $f) {
        echo '<link rel="preload" href="' . esc_url(get_theme_file_uri("assets/fonts/$f.woff2")) . '" as="font" type="font/woff2" crossorigin>' . "\n";
    }
}, 2);

/* Carga solo el CSS de los bloques que se usan en cada página */
add_filter('should_load_separate_core_block_assets', '__return_true');

/* El panel de cuenta, los comentarios y los feeds de comentarios no se usan en un escaparate */
add_filter('comments_open', '__return_false', 20, 2);
add_filter('pings_open', '__return_false', 20, 2);
add_action('wp_head', function () { remove_action('wp_head', 'feed_links_extra', 3); }, 0);

/* Productos relacionados: misma categoría y sin repetir el producto actual */
add_filter('query_loop_block_query_vars', function ($query, $block) {
    $cls = isset($block->parsed_block['attrs']['className']) ? $block->parsed_block['attrs']['className'] : '';
    if (strpos($cls, 'related-products') !== false && is_singular('producto')) {
        $query['post__not_in'] = array(get_the_ID());
        $terms = get_the_terms(get_the_ID(), 'categoria-producto');
        if ($terms && !is_wp_error($terms)) {
            $query['tax_query'] = array(array('taxonomy' => 'categoria-producto', 'field' => 'term_id', 'terms' => wp_list_pluck($terms, 'term_id')));
        }
    }
    return $query;
}, 10, 2);
