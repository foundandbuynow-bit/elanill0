# Elanill0 en WordPress — qué hay instalado y cómo se gestiona

Sitio: https://elanill0.com · WordPress 7.1.3 · PHP 8.3 · LiteSpeed Cache. Desplegado el 7 de octubre de 2026.

## Qué se instaló

| Pieza | Dónde | Para qué |
|---|---|---|
| **Tema de bloques `elanill0-theme`** | `wp/elanill0-theme/` → Apariencia → Temas | Diseño (colores, tipografías propias, cabecera, pie, plantillas). Sin constructores de páginas. |
| **Plugin `elanill0-catalogo`** | `wp/elanill0-catalogo/` → Plugins | Productos, categorías, precios, botón de WhatsApp por producto y todo el SEO técnico. |
| **19 páginas** | Páginas | Inicio, Tienda, Colecciones (+4), Guías (+5), Sobre nosotros, Contacto y 4 legales. Todo en bloques nativos (0 `core/html`). |
| **14 productos** | Productos | Con precio, precio anterior, categoría, imágenes y textos propios. |
| **25 imágenes** | Medios | Con texto alternativo; los bloques de imagen están enlazados a la mediateca (se sustituyen con un clic). |

Las copias del sitio anterior (instalación vacía de Twenty Twenty-Five) están en `wp-content/uploads/sauvegarde-avant-theme.json`.

## Cómo editarlo (sin tocar código)

- **Precio, descuento, textos y fotos de un producto:** *Productos → editar*. Caja «Datos del producto»: precio actual, precio antes, opción (talla/longitud) y valores. El «Extracto» es el texto corto; el contenido es la descripción.
- **Añadir un producto:** *Productos → Añadir*. Asigna una categoría y, si quieres que salga en «Más vendidos» de la portada, el destacado `mas-vendidos`. El botón de WhatsApp se genera solo.
- **Textos de páginas, guías y preguntas frecuentes:** editor de bloques (cada pregunta es un bloque «Detalles»; Google la recibe como FAQ automáticamente).
- **SEO de cualquier página o producto:** caja «SEO (Google)» (título hasta 60 caracteres, descripción 120–155).
- **Menú, cabecera y pie:** *Apariencia → Editor → Patrones / Partes de plantilla*.

## Volver atrás

```
Apariencia → Temas → Twenty Twenty-Five → Activar
```

Tema y contenido no se borran. El plugin se puede desactivar sin perder los productos.

## Redesplegar cambios de diseño o de contenido

Las credenciales **no están en el proyecto**: se leen del `.mcpb` de Novamira, que debes guardar fuera del repositorio.

```bash
# 1) regenerar plantillas y contenido
node scripts/build-wp-theme.js
# 2) empaquetar, subir, instalar y purgar caché
export NOVAMIRA_BUNDLE=<carpeta con el manifest.json del .mcpb descomprimido>
node scripts/deploy-wp.js package && node scripts/deploy-wp.js upload
node scripts/deploy-wp.js install && node scripts/deploy-wp.js purge
# solo si cambian páginas o productos:
node scripts/deploy-wp.js media && node scripts/deploy-wp.js terms && node scripts/deploy-wp.js content
node scripts/deploy-wp.js cleanup      # borra del servidor los ZIP y el JSON de transferencia
```

Todas las etapas son idempotentes: se pueden repetir sin duplicar nada. Al cambiar `style.css` basta con `package → upload → install → purge` (la versión del archivo cambia sola).

## Comprobaciones realizadas

| Puerta | Resultado |
|---|---|
| 1 · Bloques en el servidor | 33 contenidos · 821 bloques · **0 `core/html`** · 0 bloques ajenos a `core/` · 12/12 imágenes con id |
| 2 · Editor | 33/33 abren con **0 bloques inválidos** |
| 3 · Rendimiento y móvil | Sin desplazamiento horizontal a 390 px · 0 imágenes rotas · menú móvil legible · 0 errores de consola |
| 4 · Fidelidad con la maqueta | Cabecera, menú, hero, tarjetas de producto, promo y banner **idénticos**; difieren a propósito: contadores de colección (se quedarían desactualizados) y el formulario de boletín |
| 5 · Editor | Capas fuera de flujo preservadas, fuente correcta, botones de ancho normal |
| SEO publicado | 33 URL en el mapa del sitio · 0 problemas de título/descripción/H1/canónica/JSON-LD · redirecciones 301 y 404 con `noindex` |

## Pendiente o a tener en cuenta

- **Seguridad:** el `.mcpb` contiene una contraseña de aplicación en texto claro. Cuando termines de trabajar con Claude, revócala en *Usuarios → Perfil → Contraseñas de aplicación* (Novamira avisa de que no se revoque mientras se use).
- **No hay formulario de contacto ni boletín:** WordPress no trae bloque de formulario; se sustituyó por botones de WhatsApp y email. Si quieres formulario, instala Contact Form 7 y se añade con un bloque «Shortcode».
- **Plugin de seguridad/copias/analítica:** no hay ninguno instalado. Recomendable una copia automática.
- **Textos legales y afirmaciones del material:** pendientes de revisión por tu parte (ver `docs/SEO.md`).
