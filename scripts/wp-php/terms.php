<?php
// Crea (o reutiliza) las categorías de producto y los grupos destacados; devuelve sus identificadores.
$cats = ['anillos' => 'Anillos', 'collares' => 'Collares', 'pulseras' => 'Pulseras', 'pendientes' => 'Pendientes'];
$dest = ['mas-vendidos' => 'Más vendidos'];
$out = ['categoria' => [], 'destacado' => []];
foreach ($cats as $slug => $name) {
    $t = get_term_by('slug', $slug, 'categoria-producto');
    if (!$t) { $r = wp_insert_term($name, 'categoria-producto', ['slug' => $slug]); if (is_wp_error($r)) return 'Error: ' . $r->get_error_message(); $out['categoria'][$slug] = (int) $r['term_id']; }
    else { $out['categoria'][$slug] = (int) $t->term_id; }
}
foreach ($dest as $slug => $name) {
    $t = get_term_by('slug', $slug, 'destacado');
    if (!$t) { $r = wp_insert_term($name, 'destacado', ['slug' => $slug]); if (is_wp_error($r)) return 'Error: ' . $r->get_error_message(); $out['destacado'][$slug] = (int) $r['term_id']; }
    else { $out['destacado'][$slug] = (int) $t->term_id; }
}
return $out;
