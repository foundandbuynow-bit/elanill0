<?php
// Descomprime tema y plugin, comprueba la sintaxis PHP antes de activar nada.
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
WP_Filesystem();
$up = wp_get_upload_dir()['basedir'];
$res = [];

// 1) tema: vaciar carpetas versionadas para que no sobrevivan archivos antiguos
$theme_root = get_theme_root() . '/elanill0-theme';
foreach (['patterns', 'templates', 'parts', 'assets'] as $d) {
    foreach (glob("$theme_root/$d/*") ?: [] as $f) { if (is_file($f)) @unlink($f); }
}
$r = unzip_file("$up/e0-theme.zip", get_theme_root());
$res['tema'] = is_wp_error($r) ? $r->get_error_message() : 'descomprimido';

// 2) plugin
$r = unzip_file("$up/e0-plugin.zip", WP_PLUGIN_DIR);
$res['plugin'] = is_wp_error($r) ? $r->get_error_message() : 'descomprimido';

// 3) sintaxis PHP
$lint = function ($f) {
    try { token_get_all(file_get_contents($f), TOKEN_PARSE); return 'ok'; }
    catch (\Throwable $e) { return 'ERROR: ' . $e->getMessage() . ' (línea ' . $e->getLine() . ')'; }
};
$res['lint_tema'] = $lint("$theme_root/functions.php");
$res['lint_plugin'] = $lint(WP_PLUGIN_DIR . '/elanill0-catalogo/elanill0-catalogo.php');

// 4) activar el plugin solo si la sintaxis es correcta
if ($res['lint_plugin'] === 'ok' && $res['lint_tema'] === 'ok') {
    wp_clean_themes_cache(true);
    if (!is_plugin_active('elanill0-catalogo/elanill0-catalogo.php')) {
        $a = activate_plugin('elanill0-catalogo/elanill0-catalogo.php');
        $res['activar_plugin'] = is_wp_error($a) ? $a->get_error_message() : 'activado';
    } else { $res['activar_plugin'] = 'ya activo'; }
    $t = wp_get_theme('elanill0-theme');
    $res['tema_valido'] = $t->exists() ? ($t->get('Name') . ' v' . $t->get('Version') . ($t->is_block_theme() ? ' [bloque]' : ' [NO es de bloques]')) : 'no encontrado';
}
return $res;
