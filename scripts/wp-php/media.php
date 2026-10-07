<?php
// Importa los visuales a la mediateca (idempotente: se identifican por _e0_slug) y devuelve slug -> {id,url,alt}.
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
WP_Filesystem();
$up = wp_get_upload_dir()['basedir'];
$tmpdir = "$up/e0-media-tmp";
if (is_dir($tmpdir)) { foreach (glob("$tmpdir/*") ?: [] as $f) @unlink($f); } else { wp_mkdir_p($tmpdir); }
$r = unzip_file("$up/e0-media.zip", $tmpdir);
if (is_wp_error($r)) return 'Error al descomprimir: ' . $r->get_error_message();
$manifest = json_decode(file_get_contents("$tmpdir/manifest.json"), true);
$map = [];
foreach ($manifest as $slug => $m) {
    $existing = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_e0_slug', 'meta_value' => $slug, 'posts_per_page' => 1, 'fields' => 'ids']);
    if ($existing) { $id = $existing[0]; }
    else {
        $tmp = wp_tempnam($m['file']);
        copy("$tmpdir/" . $m['file'], $tmp);
        $id = media_handle_sideload(['name' => $m['file'], 'tmp_name' => $tmp], 0, $m['title']);
        if (is_wp_error($id)) { $map[$slug] = ['error' => $id->get_error_message()]; @unlink($tmp); continue; }
        update_post_meta($id, '_e0_slug', $slug);
    }
    update_post_meta($id, '_wp_attachment_image_alt', $m['alt']);
    $map[$slug] = ['id' => (int) $id, 'url' => wp_get_attachment_url($id), 'alt' => $m['alt']];
}
foreach (glob("$tmpdir/*") ?: [] as $f) @unlink($f);
@rmdir($tmpdir);
return $map;
