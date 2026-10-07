<?php
// Puerta 1: integridad de los bloques, en el servidor.
function e0_count($blocks, &$n) {
    foreach ($blocks as $b) {
        if (empty($b['blockName'])) continue;
        $n[$b['blockName']] = ($n[$b['blockName']] ?? 0) + 1;
        if (!empty($b['innerBlocks'])) e0_count($b['innerBlocks'], $n);
    }
}
$res = ['paginas' => [], 'totales' => ['bloques' => 0, 'html_bruto' => 0, 'fuera_de_core' => 0, 'imagenes' => 0, 'imagenes_con_id' => 0]];
$posts = get_posts(['post_type' => ['page', 'producto'], 'post_status' => 'publish', 'posts_per_page' => 200]);
foreach ($posts as $p) {
    $n = [];
    e0_count(parse_blocks($p->post_content), $n);
    $bad = array_filter(array_keys($n), function ($k) { return strpos($k, 'core/') !== 0; });
    $imgs = $n['core/image'] ?? 0;
    $with_id = preg_match_all('/<!-- wp:image \{[^}]*"id":\d+/', $p->post_content);
    $res['totales']['bloques'] += array_sum($n);
    $res['totales']['html_bruto'] += $n['core/html'] ?? 0;
    $res['totales']['fuera_de_core'] += count($bad);
    $res['totales']['imagenes'] += $imgs;
    $res['totales']['imagenes_con_id'] += $with_id;
    if (($n['core/html'] ?? 0) || $bad || $imgs !== $with_id) $res['problemas'][] = $p->post_name;
}
$res['paginas'] = count($posts);
return $res;
