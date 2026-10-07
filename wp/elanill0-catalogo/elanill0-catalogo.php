<?php
/**
 * Plugin Name: Elanill0 · Catálogo y SEO
 * Description: Catálogo de joyas (productos, categorías, precios, compra por WhatsApp) y SEO técnico del sitio (títulos, descripciones, canónicas, Open Graph y datos estructurados).
 * Version: 1.0.0
 * Author: Elanill0
 * Text Domain: elanill0
 */
if (!defined('ABSPATH')) exit;

define('E0_VERSION', '1.0.0');
define('E0_WA', '34605505120');
define('E0_WA_PRETTY', '+34 605 505 120');
define('E0_EMAIL', 'elanillospain@gmail.com');
define('E0_FB', 'https://www.facebook.com/elanill0');
define('E0_BRAND', 'Elanill0');

/* ==========================================================
 * 1. Contenido: productos, categorías, destacados y metadatos
 * ========================================================== */
add_action('init', function () {
    register_post_type('producto', array(
        'labels' => array(
            'name' => 'Productos', 'singular_name' => 'Producto', 'menu_name' => 'Productos',
            'add_new' => 'Añadir producto', 'add_new_item' => 'Añadir nuevo producto', 'edit_item' => 'Editar producto',
            'all_items' => 'Todos los productos', 'search_items' => 'Buscar productos', 'not_found' => 'No hay productos',
            'view_item' => 'Ver producto',
        ),
        'public' => true, 'show_in_rest' => true, 'has_archive' => false, 'menu_icon' => 'dashicons-products', 'menu_position' => 5,
        'rewrite' => array('slug' => 'producto', 'with_front' => false),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'page-attributes', 'revisions', 'custom-fields'),
    ));
    register_taxonomy('categoria-producto', 'producto', array(
        'labels' => array('name' => 'Categorías de producto', 'singular_name' => 'Categoría de producto', 'menu_name' => 'Categorías'),
        'public' => true, 'hierarchical' => true, 'show_in_rest' => true, 'show_admin_column' => true,
        'rewrite' => array('slug' => 'categoria-producto', 'with_front' => false),
    ));
    register_taxonomy('destacado', 'producto', array(
        'labels' => array('name' => 'Destacados', 'singular_name' => 'Destacado', 'menu_name' => 'Destacados'),
        'public' => false, 'show_ui' => true, 'show_in_rest' => true, 'show_admin_column' => true, 'hierarchical' => false, 'rewrite' => false,
        'description' => 'Grupos que aparecen en la portada (por ejemplo: «mas-vendidos»).',
    ));

    $auth = function () { return current_user_can('edit_posts'); };
    $num = array('type' => 'number', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'e0_num', 'auth_callback' => $auth);
    $str = array('type' => 'string', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'sanitize_text_field', 'auth_callback' => $auth);
    register_post_meta('producto', 'precio', $num);
    register_post_meta('producto', 'precio_antes', $num);
    foreach (array('opcion_etiqueta', 'opcion_valores', 'galeria') as $k) register_post_meta('producto', $k, $str);
    foreach (array('page', 'producto') as $pt) {
        foreach (array('seo_titulo', 'seo_descripcion') as $k) register_post_meta($pt, $k, $str);
    }
    register_post_meta('page', 'categoria_producto', $str);
});

function e0_num($v) {
    if ($v === '' || $v === null) return '';
    return (float) str_replace(',', '.', (string) $v);
}
function e0_price($v) { return number_format((float) $v, 2, ',', '.') . ' €'; }
function e0_wa_url($text) { return 'https://wa.me/' . E0_WA . '?text=' . rawurlencode($text); }
function e0_title($post) { return html_entity_decode(wp_strip_all_tags(get_the_title($post)), ENT_QUOTES, 'UTF-8'); }

function e0_product($post) {
    $id = is_object($post) ? $post->ID : (int) $post;
    $p = get_post_meta($id, 'precio', true);
    $o = get_post_meta($id, 'precio_antes', true);
    $price = ($p === '' || $p === false) ? null : (float) $p;
    $old = ($o === '' || $o === false) ? null : (float) $o;
    $off = ($price !== null && $old) ? (int) round((1 - $price / $old) * 100) : 0;
    $label = get_post_meta($id, 'opcion_etiqueta', true);
    $values = array_values(array_filter(array_map('trim', explode(',', (string) get_post_meta($id, 'opcion_valores', true)))));
    $gallery = array_values(array_filter(array_map('absint', explode(',', (string) get_post_meta($id, 'galeria', true)))));
    return compact('id', 'price', 'old', 'off', 'label', 'values', 'gallery');
}
function e0_wa_text($post) {
    $d = e0_product($post);
    $name = e0_title($post);
    return $d['price'] === null
        ? 'Hola, quiero saber el precio y la disponibilidad de: ' . $name
        : 'Hola, quiero comprar: ' . $name . ' - ' . e0_price($d['price']);
}
function e0_collection_url($slug) {
    $pg = get_page_by_path('colecciones/' . $slug);
    return $pg ? get_permalink($pg) : home_url('/colecciones/');
}

/* ==========================================================
 * 2. Cajas de edición (precio, opciones, SEO)
 * ========================================================== */
add_action('add_meta_boxes', function () {
    add_meta_box('e0_producto', 'Datos del producto', 'e0_box_producto', 'producto', 'normal', 'high');
    foreach (array('page', 'producto') as $pt) add_meta_box('e0_seo', 'SEO (Google)', 'e0_box_seo', $pt, 'normal', 'default');
});
function e0_field($label, $name, $value, $hint = '', $type = 'text') {
    echo '<p><label style="display:block;font-weight:600;margin-bottom:4px" for="' . esc_attr($name) . '">' . esc_html($label) . '</label>';
    echo '<input type="' . esc_attr($type) . '" step="0.01" class="widefat" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '">';
    if ($hint) echo '<span class="description">' . esc_html($hint) . '</span>';
    echo '</p>';
}
function e0_box_producto($post) {
    wp_nonce_field('e0_save', 'e0_nonce');
    e0_field('Precio actual (€)', 'e0_precio', get_post_meta($post->ID, 'precio', true), 'Déjalo vacío para mostrar «Consultar precio».', 'number');
    e0_field('Precio antes (€)', 'e0_precio_antes', get_post_meta($post->ID, 'precio_antes', true), 'Precio tachado y cálculo del descuento. Opcional.', 'number');
    e0_field('Opción: nombre (talla, longitud…)', 'e0_opcion_etiqueta', get_post_meta($post->ID, 'opcion_etiqueta', true));
    e0_field('Opción: valores separados por comas', 'e0_opcion_valores', get_post_meta($post->ID, 'opcion_valores', true), 'Ejemplo: 50 cm, 60 cm, 70 cm');
    e0_field('Imágenes extra (IDs de la mediateca, separados por comas)', 'e0_galeria', get_post_meta($post->ID, 'galeria', true), 'La imagen destacada es la principal.');
    echo '<p class="description">El texto corto del producto es el «Extracto». Los destacados de la portada se asignan en «Destacados».</p>';
}
function e0_box_seo($post) {
    wp_nonce_field('e0_save', 'e0_nonce');
    e0_field('Título SEO (máx. 60 caracteres)', 'e0_seo_titulo', get_post_meta($post->ID, 'seo_titulo', true), 'Si lo dejas vacío se usa el título de la página.');
    e0_field('Descripción SEO (120–155 caracteres)', 'e0_seo_descripcion', get_post_meta($post->ID, 'seo_descripcion', true), 'Es el texto que aparece bajo el título en Google.');
}
add_action('save_post', function ($id) {
    if (!isset($_POST['e0_nonce']) || !wp_verify_nonce($_POST['e0_nonce'], 'e0_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $id)) return;
    $map = array('e0_precio' => 'precio', 'e0_precio_antes' => 'precio_antes', 'e0_opcion_etiqueta' => 'opcion_etiqueta', 'e0_opcion_valores' => 'opcion_valores',
        'e0_galeria' => 'galeria', 'e0_seo_titulo' => 'seo_titulo', 'e0_seo_descripcion' => 'seo_descripcion');
    foreach ($map as $field => $key) {
        if (!isset($_POST[$field])) continue;
        $v = wp_unslash($_POST[$field]);
        if ($v === '') delete_post_meta($id, $key); else update_post_meta($id, $key, $v);
    }
});

/* ==========================================================
 * 3. Enlaces de bloque (precio, descuento, WhatsApp)
 * ========================================================== */
add_action('init', function () {
    if (!function_exists('register_block_bindings_source')) return;
    register_block_bindings_source('elanill0/producto', array(
        'label' => 'Producto Elanill0',
        'uses_context' => array('postId'),
        'get_value_callback' => function ($args, $block) {
            $id = isset($block->context['postId']) ? (int) $block->context['postId'] : get_the_ID();
            $d = e0_product($id);
            switch (isset($args['key']) ? $args['key'] : '') {
                case 'precio': return $d['price'] === null ? 'Consultar precio' : e0_price($d['price']);
                case 'precio_antes': return ($d['old'] && $d['price'] !== null) ? e0_price($d['old']) : '';
                case 'descuento': return $d['off'] ? '-' . $d['off'] . '%' : '';
                case 'whatsapp_url': return e0_wa_url(e0_wa_text($id));
                case 'whatsapp_texto': return $d['price'] === null ? 'CONSULTAR POR WHATSAPP' : 'COMPRAR POR WHATSAPP';
            }
            return null;
        },
    ));
});

/* ==========================================================
 * 4. Códigos cortos: migas de pan y panel de compra
 * ========================================================== */
add_shortcode('elanill0_migas', function () {
    $items = array(array(home_url('/'), 'Inicio'));
    if (is_singular('producto')) {
        $items[] = array(home_url('/tienda/'), 'Tienda');
        $terms = get_the_terms(get_the_ID(), 'categoria-producto');
        if ($terms && !is_wp_error($terms)) $items[] = array(e0_collection_url($terms[0]->slug), $terms[0]->name);
        $items[] = array(null, e0_title(get_the_ID()));
    } elseif (is_singular('page')) {
        $anc = array_reverse(get_post_ancestors(get_the_ID()));
        foreach ($anc as $a) $items[] = array(get_permalink($a), e0_title($a));
        $items[] = array(null, e0_title(get_the_ID()));
    } elseif (is_post_type_archive('producto')) {
        $items[] = array(null, 'Tienda');
    } elseif (is_search()) {
        $items[] = array(null, 'Resultados de búsqueda');
    } else {
        $items[] = array(null, 'Página no encontrada');
    }
    $out = '<nav class="crumbs" aria-label="Migas de pan">';
    foreach ($items as $i => $it) {
        $out .= $it[0] ? '<a href="' . esc_url($it[0]) . '">' . esc_html($it[1]) . '</a>' : '<span class="here" aria-current="page">' . esc_html($it[1]) . '</span>';
        if ($i < count($items) - 1) $out .= '<span class="sep">/</span>';
    }
    return $out . '</nav>';
});

add_shortcode('elanill0_comprar', function () {
    $id = get_the_ID();
    $d = e0_product($id);
    $name = e0_title($id);
    $out = '<div class="opts">';
    if ($d['label'] && $d['values']) {
        $out .= '<label>' . esc_html($d['label']) . '<select id="opt" data-label="' . esc_attr($d['label']) . '">';
        foreach ($d['values'] as $v) $out .= '<option value="' . esc_attr($v) . '">' . esc_html($v) . '</option>';
        $out .= '</select></label>';
    }
    $out .= '<label>Cantidad<input id="qty" type="number" min="1" max="20" value="1" inputmode="numeric"></label></div>';
    $wa_label = $d['price'] === null ? 'CONSULTAR POR WHATSAPP' : 'COMPRAR POR WHATSAPP';
    $out .= '<div class="buy"><a class="btn btn-dark" id="buy" data-name="' . esc_attr($name) . '" data-price="' . esc_attr($d['price'] !== null ? e0_price($d['price']) : '') . '" href="' . esc_url(e0_wa_url(e0_wa_text($id))) . '" target="_blank" rel="noopener">' . esc_html($wa_label) . '</a>';
    $out .= '<a class="btn btn-line" href="mailto:' . esc_attr(E0_EMAIL) . '?subject=' . rawurlencode('Consulta sobre: ' . $name) . '">PREGUNTAR POR EMAIL</a></div>';
    return $out;
});

/* Miniaturas de la galería bajo la imagen principal del producto */
add_filter('render_block_core/post-featured-image', function ($html, $block) {
    if (!is_singular('producto') || !empty($block->context['queryId'])) return $html;
    $d = e0_product(get_the_ID());
    if (!$d['gallery']) return $html;
    $ids = array_merge(array(get_post_thumbnail_id()), $d['gallery']);
    $out = '<div class="gallery-thumbs">';
    foreach ($ids as $i => $aid) {
        if (!$aid) continue;
        $out .= '<button type="button" data-src="' . esc_url(wp_get_attachment_image_url($aid, 'large')) . '" aria-current="' . ($i === 0 ? 'true' : 'false') . '" aria-label="Ver imagen ' . ($i + 1) . '">'
            . wp_get_attachment_image($aid, 'thumbnail', false, array('loading' => 'lazy')) . '</button>';
    }
    return $html . $out . '</div>';
}, 10, 2);

/* Clases útiles para filtrar con JavaScript: precio-14, pos-3 */
add_filter('post_class', function ($classes, $class, $post_id) {
    if (get_post_type($post_id) === 'producto') {
        $d = e0_product($post_id);
        $classes[] = 'precio-' . ($d['price'] === null ? 'x' : (int) round($d['price']));
        $classes[] = 'pos-' . (int) get_post_field('menu_order', $post_id);
    }
    return $classes;
}, 10, 3);

/* La tienda muestra todos los productos, en el orden elegido */
add_action('pre_get_posts', function ($q) {
    if (is_admin() || !$q->is_main_query()) return;
    if ($q->is_post_type_archive('producto')) {
        $q->set('posts_per_page', 100);
        $q->set('orderby', array('menu_order' => 'ASC', 'date' => 'DESC'));
    }
    if ($q->is_search() && $q->get('post_type') === 'producto') {
        $q->set('posts_per_page', 100);
    }
});

/* ==========================================================
 * 5. Redirecciones (páginas antiguas y archivos de categoría)
 * ========================================================== */
add_action('template_redirect', function () {
    if (is_tax('categoria-producto')) {
        $t = get_queried_object();
        if ($t) { wp_safe_redirect(e0_collection_url($t->slug), 301); exit; }
    }
    $path = trim(parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH), '/');
    $legacy = array('shop' => '/tienda/', 'contact-us' => '/contacto/', 'about-us-3' => '/sobre-nosotros/', 'home-jewellery' => '/', 'carrito' => '/tienda/',
        'finalizar-compra' => '/tienda/', 'mi-cuenta' => '/contacto/', 'wishlist' => '/tienda/', 'compare' => '/tienda/', 'blog' => '/guias/', 'portfolio' => '/');
    if (isset($legacy[$path]) && is_404()) { wp_safe_redirect(home_url($legacy[$path]), 301); exit; }
    if (preg_match('#^(?:product-category|categoria-producto)/([^/]+)/?$#', $path, $m) && is_404()) { wp_safe_redirect(e0_collection_url($m[1]), 301); exit; }
});

/* ==========================================================
 * 6. SEO técnico
 * ========================================================== */
function e0_og_url($file) { return plugins_url('assets/og/' . $file, __FILE__); }

/* Devuelve título, descripción, URL canónica, imagen y datos estructurados de la página actual */
function e0_info() {
    static $info = null;
    if ($info !== null) return $info;
    $site = home_url('/');
    $info = array('title' => '', 'desc' => '', 'canonical' => $site, 'og' => e0_og_url('og-elanill0.jpg'), 'og_alt' => 'Joyas de acero inoxidable ' . E0_BRAND,
        'type' => 'website', 'noindex' => false, 'ld' => array(), 'product' => null);

    if (is_singular()) {
        $post = get_queried_object();
        $info['canonical'] = get_permalink($post);
        $t = get_post_meta($post->ID, 'seo_titulo', true);
        $dsc = get_post_meta($post->ID, 'seo_descripcion', true);
        $info['title'] = $t ? $t : e0_title($post) . ' | ' . E0_BRAND;
        $info['desc'] = $dsc ? $dsc : wp_trim_words(wp_strip_all_tags(has_excerpt($post) ? $post->post_excerpt : $post->post_content), 28, '…');
        if ($post->post_type === 'producto') {
            $info['type'] = 'product';
            $info['product'] = $post;
            $file = $post->post_name . '.jpg';
            $info['og'] = file_exists(plugin_dir_path(__FILE__) . 'assets/og/' . $file) ? e0_og_url($file) : (get_the_post_thumbnail_url($post, 'large') ?: $info['og']);
            $info['og_alt'] = e0_title($post);
        } else {
            $cat = get_post_meta($post->ID, 'categoria_producto', true);
            $file = $cat ? 'cat-' . $cat . '.jpg' : ($post->post_name === 'sobre-nosotros' ? 'sobre-nosotros.jpg' : '');
            if ($file && file_exists(plugin_dir_path(__FILE__) . 'assets/og/' . $file)) $info['og'] = e0_og_url($file);
        }
    } elseif (is_post_type_archive('producto')) {
        $info['canonical'] = home_url('/tienda/');
        $info['title'] = get_option('e0_tienda_titulo', 'Comprar joyas de acero inoxidable online | ' . E0_BRAND);
        $info['desc'] = get_option('e0_tienda_descripcion', 'Joyas de acero inoxidable: anillos, collares, pulseras y pendientes.');
    } elseif (is_search()) {
        $info['title'] = 'Resultados de búsqueda | ' . E0_BRAND;
        $info['desc'] = 'Resultados de búsqueda en ' . E0_BRAND . '.';
        $info['noindex'] = true;
    } elseif (is_404()) {
        $info['title'] = 'Página no encontrada | ' . E0_BRAND;
        $info['desc'] = 'La página que buscas no existe o ha cambiado de sitio. Vuelve al inicio o explora nuestras joyas de acero inoxidable.';
        $info['noindex'] = true;
    } else {
        $info['title'] = E0_BRAND . ' · Joyas de acero inoxidable';
        $info['desc'] = 'Joyas de acero inoxidable online.';
    }
    return $info;
}

add_filter('pre_get_document_title', function ($t) { $i = e0_info(); return $i['title'] ? $i['title'] : $t; }, 20);
add_filter('wp_robots', function ($r) {
    $i = e0_info();
    if ($i['noindex']) { $r['noindex'] = true; $r['follow'] = true; unset($r['max-image-preview']); }
    else { $r['index'] = true; $r['follow'] = true; $r['max-image-preview'] = 'large'; $r['max-snippet'] = '-1'; $r['max-video-preview'] = '-1'; }
    return $r;
});
remove_action('wp_head', 'rel_canonical');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wp_shortlink_wp_head', 10);
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

add_action('wp_head', function () {
    $i = e0_info();
    $title = wp_get_document_title();
    echo "\n<!-- Elanill0 SEO -->\n";
    echo '<meta name="description" content="' . esc_attr($i['desc']) . '">' . "\n";
    echo '<link rel="canonical" href="' . esc_url($i['canonical']) . '">' . "\n";
    echo '<link rel="alternate" hreflang="es-ES" href="' . esc_url($i['canonical']) . '">' . "\n";
    echo '<link rel="alternate" hreflang="x-default" href="' . esc_url($i['canonical']) . '">' . "\n";
    echo '<meta name="theme-color" content="#D8A697">' . "\n";
    echo '<meta property="og:locale" content="es_ES">' . "\n";
    echo '<meta property="og:site_name" content="' . esc_attr(E0_BRAND) . '">' . "\n";
    echo '<meta property="og:type" content="' . esc_attr($i['type']) . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($i['desc']) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($i['canonical']) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url($i['og']) . '">' . "\n";
    echo '<meta property="og:image:width" content="1200">' . "\n" . '<meta property="og:image:height" content="630">' . "\n";
    echo '<meta property="og:image:alt" content="' . esc_attr($i['og_alt']) . '">' . "\n";
    if ($i['product']) {
        $d = e0_product($i['product']);
        if ($d['price'] !== null) {
            echo '<meta property="product:price:amount" content="' . esc_attr(number_format($d['price'], 2, '.', '')) . '">' . "\n";
            echo '<meta property="product:price:currency" content="EUR">' . "\n" . '<meta property="product:availability" content="in stock">' . "\n";
        }
    }
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($i['desc']) . '">' . "\n";
    echo '<meta name="twitter:image" content="' . esc_url($i['og']) . '">' . "\n";
    echo '<script type="application/ld+json">' . wp_json_encode(array('@context' => 'https://schema.org', '@graph' => e0_graph($i)), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    echo "<!-- /Elanill0 SEO -->\n";
}, 1);

function e0_faq_from_blocks($blocks, &$out) {
    foreach ($blocks as $b) {
        if (isset($b['blockName']) && $b['blockName'] === 'core/details') {
            if (preg_match('/<summary[^>]*>(.*?)<\/summary>/s', $b['innerHTML'], $m)) {
                $answer = '';
                foreach ($b['innerBlocks'] as $ib) $answer .= ' ' . wp_strip_all_tags($ib['innerHTML']);
                $out[] = array('@type' => 'Question', 'name' => trim(wp_strip_all_tags($m[1])), 'acceptedAnswer' => array('@type' => 'Answer', 'text' => trim($answer)));
            }
        }
        if (!empty($b['innerBlocks'])) e0_faq_from_blocks($b['innerBlocks'], $out);
    }
}

function e0_graph($i) {
    $site = home_url('/');
    $org_id = $site . '#organization';
    $logo = wp_get_attachment_image_url((int) get_theme_mod('custom_logo') ?: (int) get_option('site_logo'), 'full');
    $g = array();
    $g[] = array(
        '@type' => array('Organization', 'OnlineStore'), '@id' => $org_id, 'name' => E0_BRAND, 'alternateName' => array('El Anillo', 'elanillo.es'),
        'url' => $site, 'logo' => array('@type' => 'ImageObject', 'url' => $logo ?: e0_og_url('og-elanill0.jpg')), 'image' => e0_og_url('og-elanill0.jpg'),
        'description' => 'Tienda online de joyas de acero inoxidable 316L en España: anillos, collares, pulseras y pendientes para hombre y mujer. Envío gratis en compras de más de 50 €.',
        'email' => E0_EMAIL, 'telephone' => '+' . E0_WA,
        'address' => array('@type' => 'PostalAddress', 'addressLocality' => 'Madrid', 'addressCountry' => 'ES'),
        'areaServed' => array('@type' => 'Country', 'name' => 'España'), 'sameAs' => array(E0_FB), 'priceRange' => '€',
        'contactPoint' => array(array('@type' => 'ContactPoint', 'contactType' => 'customer service', 'telephone' => '+' . E0_WA, 'email' => E0_EMAIL, 'availableLanguage' => 'es', 'areaServed' => 'ES')),
    );
    $g[] = array(
        '@type' => 'WebSite', '@id' => $site . '#website', 'url' => $site, 'name' => E0_BRAND, 'inLanguage' => 'es-ES', 'publisher' => array('@id' => $org_id),
        'potentialAction' => array('@type' => 'SearchAction', 'target' => array('@type' => 'EntryPoint', 'urlTemplate' => home_url('/?s={search_term_string}&post_type=producto')), 'query-input' => 'required name=search_term_string'),
    );
    $url = $i['canonical'];
    $page_type = 'WebPage';
    $post = is_singular() ? get_queried_object() : null;
    $crumbs = array(array($site, 'Inicio'));
    if ($post && $post->post_type === 'page') {
        foreach (array_reverse(get_post_ancestors($post)) as $a) $crumbs[] = array(get_permalink($a), e0_title($a));
        if (!is_front_page()) $crumbs[] = array($url, e0_title($post));
        $cat = get_post_meta($post->ID, 'categoria_producto', true);
        if ($cat) $page_type = 'CollectionPage';
        if ($post->post_name === 'sobre-nosotros') $page_type = 'AboutPage';
        if ($post->post_name === 'contacto') $page_type = 'ContactPage';
    } elseif ($post && $post->post_type === 'producto') {
        $page_type = 'ItemPage';
        $crumbs[] = array(home_url('/tienda/'), 'Tienda');
        $terms = get_the_terms($post->ID, 'categoria-producto');
        if ($terms && !is_wp_error($terms)) $crumbs[] = array(e0_collection_url($terms[0]->slug), $terms[0]->name);
        $crumbs[] = array($url, e0_title($post));
    } elseif (is_post_type_archive('producto')) {
        $page_type = 'CollectionPage';
        $crumbs[] = array($url, 'Tienda');
    }
    $g[] = array('@type' => $page_type, '@id' => $url . '#webpage', 'url' => $url, 'name' => $i['title'], 'description' => $i['desc'], 'isPartOf' => array('@id' => $site . '#website'),
        'about' => array('@id' => $org_id), 'inLanguage' => 'es-ES', 'primaryImageOfPage' => array('@type' => 'ImageObject', 'url' => $i['og']));
    if (count($crumbs) > 1) {
        $items = array();
        foreach ($crumbs as $n => $c) $items[] = array('@type' => 'ListItem', 'position' => $n + 1, 'name' => $c[1], 'item' => $c[0]);
        $g[] = array('@type' => 'BreadcrumbList', '@id' => $url . '#breadcrumb', 'itemListElement' => $items);
    }
    if ($post && $post->post_type === 'producto') {
        $d = e0_product($post);
        $imgs = array();
        $tid = get_post_thumbnail_id($post);
        foreach (array_merge(array($tid), $d['gallery']) as $aid) { if ($aid) { $u = wp_get_attachment_image_url($aid, 'full'); if ($u) $imgs[] = $u; } }
        $prod = array('@type' => 'Product', '@id' => $url . '#product', 'name' => e0_title($post), 'description' => $i['desc'], 'image' => $imgs, 'sku' => (string) $post->ID,
            'brand' => array('@type' => 'Brand', 'name' => E0_BRAND), 'material' => 'Acero inoxidable 316L', 'url' => $url);
        $terms = get_the_terms($post->ID, 'categoria-producto');
        if ($terms && !is_wp_error($terms)) $prod['category'] = 'Joyería > ' . $terms[0]->name;
        if ($d['price'] !== null) {
            $prod['offers'] = array('@type' => 'Offer', 'url' => $url, 'priceCurrency' => 'EUR', 'price' => number_format($d['price'], 2, '.', ''),
                'itemCondition' => 'https://schema.org/NewCondition', 'availability' => 'https://schema.org/InStock', 'seller' => array('@id' => $org_id),
                'hasMerchantReturnPolicy' => array('@type' => 'MerchantReturnPolicy', 'applicableCountry' => 'ES', 'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    'merchantReturnDays' => 14, 'url' => home_url('/envios-y-devoluciones/')));
        }
        $g[] = $prod;
    }
    if ($post && $post->post_type === 'page') {
        $cat = get_post_meta($post->ID, 'categoria_producto', true);
        if ($cat) {
            $q = new WP_Query(array('post_type' => 'producto', 'posts_per_page' => 50, 'orderby' => 'menu_order', 'order' => 'ASC', 'no_found_rows' => true,
                'tax_query' => ($cat === 'todos') ? array() : array(array('taxonomy' => 'categoria-producto', 'field' => 'slug', 'terms' => $cat))));
            $items = array();
            foreach ($q->posts as $n => $p) $items[] = array('@type' => 'ListItem', 'position' => $n + 1, 'url' => get_permalink($p), 'name' => e0_title($p));
            $g[] = array('@type' => 'ItemList', 'numberOfItems' => count($items), 'itemListElement' => $items);
        }
        $guias = get_page_by_path('guias');
        if ($guias && (int) $post->post_parent === (int) $guias->ID) {
            $g[] = array('@type' => 'Article', '@id' => $url . '#article', 'headline' => e0_title($post), 'description' => $i['desc'], 'inLanguage' => 'es-ES',
                'datePublished' => get_the_date('c', $post), 'dateModified' => get_the_modified_date('c', $post), 'mainEntityOfPage' => array('@id' => $url . '#webpage'),
                'author' => array('@id' => $org_id), 'publisher' => array('@id' => $org_id), 'image' => $i['og']);
        }
    }
    if (is_post_type_archive('producto')) {
        $items = array();
        $n = 0;
        global $wp_query;
        foreach ($wp_query->posts as $p) { $n++; $items[] = array('@type' => 'ListItem', 'position' => $n, 'url' => get_permalink($p), 'name' => e0_title($p)); }
        $g[] = array('@type' => 'ItemList', 'numberOfItems' => count($items), 'itemListElement' => $items);
    }
    if ($post) {
        $faq = array();
        e0_faq_from_blocks(parse_blocks($post->post_content), $faq);
        if ($faq) $g[] = array('@type' => 'FAQPage', 'mainEntity' => $faq);
    }
    return $g;
}

/* Mapa del sitio: solo páginas y productos; sin autores ni categorías (que redirigen) */
add_filter('wp_sitemaps_taxonomies', '__return_empty_array');
add_filter('wp_sitemaps_add_provider', function ($provider, $name) { return $name === 'users' ? false : $provider; }, 10, 2);
add_filter('robots_txt', function ($txt) {
    $rules = "Disallow: /?s=\nDisallow: /*?s=\n";
    return preg_match('/^Sitemap:/mi', $txt) ? preg_replace('/^(Sitemap:)/mi', $rules . "\n$1", $txt, 1) : $txt . $rules;
});

/* ==========================================================
 * 7. Activación: reescribir enlaces permanentes
 * ========================================================== */
register_activation_hook(__FILE__, function () { flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, function () { flush_rewrite_rules(); });

