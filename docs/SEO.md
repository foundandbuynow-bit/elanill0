# SEO de Elanill0 — estrategia y estado

Fecha de la investigación: 7 de octubre de 2026. Mercado: España (es-ES).

## Cómo se hizo la investigación

- **Autocompletado de Google España** (`suggestqueries.google.com`, `hl=es&gl=es`): 857 búsquedas reales sugeridas a partir de 28 términos semilla. Es una señal real de lo que escribe la gente, pero **no da volúmenes**. Para volúmenes exactos hay que usar Google Keyword Planner o Search Console cuando el sitio ya tenga datos.
- **Análisis de competidores españoles de joyas de acero inoxidable**: Hétika, Customima, Pepe Alba, Cattleya Mallorca, Joyitas de Acero, Salitre Joyas y Singularu (títulos, descripciones, encabezados, datos estructurados).

## Lo que hace la competencia

| Patrón | Ejemplo real |
|---|---|
| Título: «Joyas de acero inoxidable» + calificativo + marca | «Joyas de Acero Inoxidable Quirúrgico 316L \| Pepe Alba» |
| Meta descripción con beneficios y envío gratis | «…resistentes al agua e hipoalergénicas… Envío gratis desde 50 €. +2.000 reseñas» (Hétika) |
| H1 con la palabra clave principal | «Joyas de acero inoxidable en Palma de Mallorca…» |
| Textos largos por categoría con H2 | «Anillos para mujer: diseño, elegancia…» (Pepe Alba) |
| Datos estructurados | Organization, WebSite+SearchAction, BreadcrumbList, ItemList, FAQPage |
| Dos o tres reclamos repetidos | «hipoalergénico», «316L / acero quirúrgico», «resistente al agua», «envío gratis desde X €» |

## Palabras clave elegidas (por intención)

**Principales (cabeza):** joyas de acero inoxidable · joyería acero inoxidable · joyas acero inoxidable online · joyas acero inoxidable hombre / mujer · joyas acero inoxidable baratas · joyas acero inoxidable Madrid / España.

**Por categoría (transaccionales):**

| Categoría | Búsquedas objetivo |
|---|---|
| Anillos | anillos de acero inoxidable · anillo de sello hombre · anillo sello hombre acero · anillos acero inoxidable hombre / mujer |
| Collares | collar acero inoxidable (hombre, mujer) · cadena acero inoxidable hombre · cadena eslabones cubanos · collar eslabones cubanos |
| Pulseras | pulsera cadena cubana · pulsera de acero inoxidable · brazalete acero inoxidable · brazalete abierto mujer |
| Pendientes | pendientes acero inoxidable · pendientes aro acero · aros acero inoxidable · pendientes aro grandes · aros acero inoxidable dorado |

**Informativas (capturan tráfico y enlazan a la tienda):** talla anillo · talla anillo España · cómo saber mi talla de anillo · cadena 50 cm vs 60 cm · cómo limpiar joyas de acero inoxidable · joyas acero quirúrgico qué es · regalo joyas hombre / mujer.

## Mapa palabra clave → URL

| URL | Título (≤ 60) | Palabra principal |
|---|---|---|
| `/` | Joyas de acero inoxidable online \| Elanill0 | joyas de acero inoxidable (online) |
| `/tienda/` | Comprar joyas de acero inoxidable online \| Elanill0 | comprar joyas acero inoxidable |
| `/categoria-producto/anillos/` | Anillos de acero inoxidable para hombre y mujer \| Elanill0 | anillos acero inoxidable |
| `/categoria-producto/collares/` | Collares y cadenas de acero inoxidable \| Elanill0 | collar / cadena acero inoxidable |
| `/categoria-producto/pulseras/` | Pulseras y brazaletes de acero inoxidable \| Elanill0 | pulsera / brazalete acero inoxidable |
| `/categoria-producto/pendientes/` | Pendientes y aros de acero inoxidable \| Elanill0 | pendientes aro acero inoxidable |
| `/guias/talla-de-anillo/` | Talla de anillo: cómo medir tu dedo y tabla de tallas | talla anillo |
| `/guias/largo-de-cadena/` | Largo de cadena: 50, 60 o 70 cm, guía para elegir | cadena 50 cm 60 cm |
| `/guias/cuidado-del-acero/` | Cómo limpiar joyas de acero inoxidable: guía de cuidado | limpiar joyas acero inoxidable |
| `/guias/acero-inoxidable-o-acero-quirurgico/` | Acero inoxidable vs acero quirúrgico: diferencias | acero quirúrgico joyas |
| `/guias/regalos-de-joyas/` | Regalos de joyas para hombre y mujer baratos | regalo joyas hombre / mujer |
| `/producto/<slug>/` (14) | «{Producto} \| Elanill0» | el nombre exacto de cada pieza |

## Lo implementado en el sitio

- **URLs limpias** que coinciden con las que ya tenía tu WooCommerce (`/producto/…`, `/categoria-producto/…`) y **redirecciones 301** de las antiguas (`/shop/`, `/contact-us/`, `/about-us-3/`, `/cart`, etc.) en `site/_redirects` y `site/.htaccess`.
- **Etiquetas**: título y meta descripción únicos en cada página, canónica, `hreflang es-ES`, robots, Open Graph y Twitter Cards con imagen 1200×630 propia por producto y categoría.
- **Datos estructurados (JSON-LD)**: Organization + OnlineStore (con nombre alternativo «El Anillo»), WebSite con buscador, BreadcrumbList, CollectionPage + ItemList, Product con precio y política de devolución (14 días), Article y FAQPage.
- **Contenido**: un H1 por página; textos por categoría con H2; ficha de producto con descripción única; 5 guías informativas; preguntas frecuentes visibles en home, categorías y guías.
- **Enlazado interno**: migas de pan, productos relacionados y enlaces contextuales entre guías, categorías y productos.
- **Rendimiento (Core Web Vitals)**: tipografías alojadas en el propio sitio (64 KB), un único CSS minificado, imágenes WebP con `width`/`height`, la imagen principal con `fetchpriority="high"` y precarga, el resto con carga diferida; imágenes de producto de 25 MB a menos de 1 MB.
- **Rastreo**: `sitemap.xml` con imágenes, `robots.txt`, `site.webmanifest` e iconos, y página 404 real con `noindex`.
- **Privacidad**: sin Google Fonts externo ni cookies de terceros.
- **Feed de Google Merchant Center** (`google-merchant-feed.xml`) para aparecer gratis en Google Shopping.

## Qué debes confirmar para mejorar aún más el posicionamiento

Estas afirmaciones son las que más usa la competencia, pero **no las he puesto porque no las puedo verificar**. Si son ciertas para tus piezas, dímelo y las añado en títulos y descripciones:

1. ¿El acero es **316L / acero quirúrgico**? (la competencia lo usa mucho en título y meta)
2. ¿Son **hipoalergénicas / sin níquel**? (alto impacto, pero solo si el proveedor lo certifica)
3. ¿Son **resistentes al agua** de forma garantizada?
4. **Envío gratis a partir de X €** y plazo de entrega (aumenta mucho los clics).
5. ¿El nombre de marca es **Elanill0** o **El Anillo**? Tu logo dice «el anillo.es» y el dominio es elanill0.com; la gente buscará «el anillo» y «elanillo». Conviene unificar.
6. Los **pendientes de aro liso** no tienen precio en tu web original; sin precio no pueden aparecer en Google Shopping.
7. La foto de los aros lisos muestra 4 colores y 6 tamaños; la ficha original dice «plateado, 20/45/70 mm». Revisa cuál es cierto.

## Pasos fuera del código (los más importantes)

1. **Google Search Console**: verifica `elanill0.com` y envía `https://elanill0.com/sitemap.xml`.
2. **Bing Webmaster Tools**: importa desde Search Console (cubre también DuckDuckGo y Ecosia).
3. **Google Merchant Center**: sube `google-merchant-feed.xml` y configura envíos y devoluciones.
4. **Google Business Profile** (si tienes dirección o atención al cliente en Madrid): mejora la búsqueda local («joyas acero inoxidable Madrid»).
5. **Reseñas reales**: pide valoraciones a tus clientes (Google, Facebook). Añadirlas con datos estructurados aumenta los clics.
6. **Enlaces**: aparece en directorios, redes sociales y blogs de moda; es lo que más pesa tras el contenido.
7. **Instagram / Pinterest**: las joyas se descubren por imagen; enlaza siempre a la ficha del producto.
8. **Medir**: instala Search Console (obligatorio) y, si quieres, una analítica respetuosa con la privacidad.

## Comandos

```bash
npm install          # instala sharp (solo para generar imágenes)
npm run build        # genera imágenes sociales + todo el sitio en site/
npm run check        # 0 enlaces rotos + auditoría SEO (títulos, H1, alt, JSON-LD…)
npm run preview      # http://127.0.0.1:4400 con URLs limpias, redirecciones y 404
```

Los textos se editan en `data/products.json`, `data/categories.json` y `scripts/guides.js`; después, `npm run build`.
