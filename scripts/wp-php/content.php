<?php
// Crea o actualiza páginas y productos desde wp-content/uploads/e0-content.json (idempotente).
$up = wp_get_upload_dir()['basedir'];
$data = json_decode(file_get_contents("$up/e0-content.json"), true);
if (!$data) return 'No se pudo leer e0-content.json';
$media = $data['media'];
$report = ['paginas' => [], 'productos' => []];

// ---- páginas (los padres antes que los hijos) ----
usort($data['pages'], function ($a, $b) { return (empty($a['parent']) ? 0 : 1) <=> (empty($b['parent']) ? 0 : 1); });
foreach ($data['pages'] as $pg) {
    $parent_id = 0;
    $path = $pg['slug'];
    if (!empty($pg['parent'])) { $p = get_page_by_path($pg['parent']); $parent_id = $p ? $p->ID : 0; $path = $pg['parent'] . '/' . $pg['slug']; }
    $existing = get_page_by_path($path);
    $args = [
        'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $pg['title'], 'post_name' => $pg['slug'], 'post_parent' => $parent_id,
        'post_content' => wp_slash($pg['content']), 'post_excerpt' => $pg['excerpt'], 'menu_order' => $pg['order'],
    ];
    if ($existing) { $args['ID'] = $existing->ID; $id = wp_update_post($args, true); } else { $id = wp_insert_post($args, true); }
    if (is_wp_error($id)) { $report['paginas'][$path] = 'ERROR: ' . $id->get_error_message(); continue; }
    update_post_meta($id, 'seo_titulo', $pg['seoTitle']);
    update_post_meta($id, 'seo_descripcion', $pg['seoDesc']);
    if (!empty($pg['meta'])) foreach ($pg['meta'] as $k => $v) update_post_meta($id, $k, $v);
    $report['paginas'][$path] = (int) $id;
}

// ---- productos ----
$n = count($data['products']);
foreach ($data['products'] as $i => $p) {
    $found = get_posts(['post_type' => 'producto', 'name' => $p['slug'], 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids']);
    $date = gmdate('Y-m-d H:i:s', time() - $i * 3600);
    $args = [
        'post_type' => 'producto', 'post_status' => 'publish', 'post_title' => $p['title'], 'post_name' => $p['slug'],
        'post_content' => wp_slash($p['content']), 'post_excerpt' => $p['excerpt'], 'menu_order' => $i,
        'post_date_gmt' => $date, 'post_date' => get_date_from_gmt($date),
    ];
    if ($found) { $args['ID'] = $found[0]; $id = wp_update_post($args, true); } else { $id = wp_insert_post($args, true); }
    if (is_wp_error($id)) { $report['productos'][$p['slug']] = 'ERROR: ' . $id->get_error_message(); continue; }
    foreach (['seo_titulo' => $p['seoTitle'], 'seo_descripcion' => $p['seoDesc']] as $k => $v) update_post_meta($id, $k, $v);
    foreach (['precio' => $p['price'], 'precio_antes' => $p['oldPrice']] as $k => $v) { if ($v === null) delete_post_meta($id, $k); else update_post_meta($id, $k, $v); }
    if ($p['optLabel']) { update_post_meta($id, 'opcion_etiqueta', $p['optLabel']); update_post_meta($id, 'opcion_valores', $p['optValues']); } else { delete_post_meta($id, 'opcion_etiqueta'); delete_post_meta($id, 'opcion_valores'); }
    $ids = [];
    foreach ($p['images'] as $k => $file) { $m = $media['prod-' . $file] ?? null; if ($m) { $ids[] = $m['id']; update_post_meta($m['id'], '_wp_attachment_image_alt', $p['alts'][$k] ?? $p['title']); } }
    if ($ids) { set_post_thumbnail($id, $ids[0]); $extra = array_slice($ids, 1); if ($extra) update_post_meta($id, 'galeria', implode(',', $extra)); else delete_post_meta($id, 'galeria'); }
    wp_set_object_terms($id, [(int) $data['terms']['categoria'][$p['cat']]], 'categoria-producto');
    wp_set_object_terms($id, array_map(function ($s) use ($data) { return (int) $data['terms']['destacado'][$s]; }, $p['destacado']), 'destacado');
    $report['productos'][$p['slug']] = (int) $id;
}
return $report;
