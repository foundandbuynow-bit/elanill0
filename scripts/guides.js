/* Guías de contenido (SEO informativo). Cada guía: slug, title, h1, desc, lead, html, faq, related */
const ringRows = [
  ['6', '16,5', '51,9', '≈ 52', true],
  ['7', '17,3', '54,4', '≈ 54', false],
  ['8', '18,2', '57,0', '≈ 57', true],
  ['9', '19,0', '59,5', '≈ 59', false],
  ['10', '19,8', '62,1', '≈ 62', true],
  ['11', '20,7', '65,0', '≈ 65', false],
  ['12', '21,5', '67,5', '≈ 67', true]
];

const guides = [
  {
    slug: 'cuidado-del-acero',
    title: 'Cómo limpiar joyas de acero inoxidable: guía de cuidado',
    h1: 'Cómo limpiar y cuidar tus joyas de acero inoxidable',
    desc: 'Aprende a limpiar joyas de acero inoxidable en 4 pasos, qué evitar y cómo guardarlas para que mantengan su brillo mucho tiempo.',
    lead: 'El acero inoxidable es resistente, pero un poco de cuidado hace que tus joyas brillen más tiempo. Estos son los pasos que recomendamos.',
    steps: [
      ['01', 'Límpialas con jabón suave', 'Agua tibia y unas gotas de jabón neutro. Frota con suavidad con un paño o un cepillo de dientes blando.'],
      ['02', 'Enjuaga y seca bien', 'Aclara con agua limpia y seca con un paño suave que no suelte pelusa para evitar marcas de agua.'],
      ['03', 'Pule el brillo', 'Un paño de microfibra devuelve el brillo al acero. Hazlo con movimientos suaves y sin apretar.'],
      ['04', 'Guárdalas por separado', 'Ponlas en una bolsita o caja, cada pieza aparte, para evitar rozaduras entre ellas.']
    ],
    html: `
<h2>Qué evitar con tus joyas de acero inoxidable</h2>
<ul>
  <li>El contacto prolongado con lejía, cloro y productos de limpieza fuertes.</li>
  <li>Estropajos y productos abrasivos: pueden rayar la superficie.</li>
  <li>Ponértelas para el gimnasio, trabajos manuales o antes de aplicar cremas y perfumes.</li>
  <li>Dormir con ellas puestas, para evitar enganches y roces.</li>
</ul>
<h2>¿Y si la pieza tiene acabado dorado?</h2>
<p>Las <a href="/categoria-producto/pendientes/">piezas doradas</a> necesitan un poco más de mimo: límpialas con especial suavidad y evita frotar con fuerza, porque el color puede desgastarse con el roce y el tiempo. Es normal en cualquier joya con acabado de color.</p>
<h2>Cómo recuperar el brillo de una joya de acero inoxidable</h2>
<p>Si notas que una pieza ha perdido brillo, límpiala con agua tibia y jabón suave, sécala bien y púlela con un paño de microfibra. La mayoría de las veces basta con eso. Si aun así no mejora, escríbenos por <a href="/contacto/">WhatsApp</a> y lo revisamos.</p>`,
    faq: [
      ['¿El acero inoxidable se oxida?', 'Nuestras joyas son de acero inoxidable 316L, que resiste muy bien la humedad y no se oxida con facilidad en el uso normal. Aun así, conviene secarlo bien y evitar productos químicos agresivos.'],
      ['¿Puedo ducharme o ir a la playa con mis joyas?', 'El acero soporta bien el agua, pero el cloro, la sal y los jabones pueden apagar el brillo con el tiempo. Lo mejor es quitártelas y aclararlas si han estado en contacto con ellos.'],
      ['¿Con qué limpio una joya de acero inoxidable?', 'Con agua tibia, jabón neutro y un paño suave o un cepillo de dientes blando. Después, aclara y seca bien.'],
      ['¿Qué hago si mi joya pierde brillo?', 'Límpiala con agua tibia y jabón suave y pule con un paño de microfibra. Si no mejora, escríbenos y lo revisamos.']
    ],
    related: ['anillos', 'collares', 'pulseras', 'pendientes']
  },
  {
    slug: 'talla-de-anillo',
    title: 'Talla de anillo: cómo medir tu dedo y tabla de tallas',
    h1: 'Talla de anillo: cómo medir tu dedo y tabla de tallas',
    desc: 'Descubre tu talla de anillo en 3 minutos: cómo medir tu dedo con un hilo, tabla con diámetro y perímetro en mm y equivalencia aproximada en España.',
    lead: 'Elegir bien la talla es lo más importante al comprar un anillo online. Con un hilo y una regla sabrás cuál es la tuya en tres minutos.',
    html: `
<h2>Cómo saber tu talla de anillo en casa</h2>
<ol>
  <li>Corta una tira de papel o un hilo fino de unos 10 cm.</li>
  <li>Rodea con él la base del dedo en el que vas a llevar el anillo y marca el punto donde se juntan los extremos.</li>
  <li>Extiende el hilo y mide con una regla la longitud en milímetros: ese es el perímetro de tu dedo.</li>
  <li>Busca ese valor en la tabla de abajo. Si estás entre dos tallas, elige la mayor.</li>
</ol>
<p>Otra opción es medir un anillo que ya te quede bien: mide su diámetro interior en milímetros y compáralo con la columna «Diámetro interior».</p>
<h2>Tabla de tallas de anillo</h2>
<p>Nuestros anillos con tallas se venden en tallas estadounidenses (6, 8, 10 y 12). Esta tabla te ayuda a convertirlas en medidas reales y a ver su equivalencia aproximada en España, donde muchas joyerías usan el perímetro interior en milímetros.</p>
<div class="table-wrap"><table>
  <thead><tr><th>Talla (EE. UU.)</th><th>Diámetro interior (mm)</th><th>Perímetro (mm)</th><th>Talla España (aprox.)</th></tr></thead>
  <tbody>
    ${ringRows.map(([us, d, p, es, ours]) => `<tr${ours ? ' class="ours"' : ''}><td>${us}${ours ? ' <small>(disponible)</small>' : ''}</td><td>${d}</td><td>${p}</td><td>${es}</td></tr>`).join('\n    ')}
  </tbody>
</table></div>
<p class="note">Medidas orientativas: pueden variar ligeramente según el fabricante. Si tienes dudas, escríbenos y te ayudamos a elegir.</p>
<h2>Consejos para acertar con la talla</h2>
<ul>
  <li>Mide al final del día: los dedos se hinchan con el calor y por la tarde son un poco más gruesos.</li>
  <li>Si el anillo es ancho (como el <a href="/producto/anillo-de-hombre-en-acero-inoxidable-plateado/">anillo de sello</a>), elige media talla más porque abraza más superficie del dedo.</li>
  <li>El anillo debe pasar el nudillo con un pequeño esfuerzo y quedar firme sin apretar.</li>
</ul>
<h2>Anillos de acero inoxidable en tu talla</h2>
<p>Ya con tu talla en la mano, mira nuestros <a href="/categoria-producto/anillos/">anillos de acero inoxidable</a>: el <a href="/producto/anillo-liso-de-acero-inoxidable-plateado/">anillo liso plateado</a> está disponible en tallas 6, 8, 10 y 12.</p>`,
    faq: [
      ['¿Cómo sé mi talla de anillo?', 'Mide el perímetro de tu dedo con un hilo, anota los milímetros y búscalos en la tabla de tallas. Si estás entre dos tallas, elige la mayor.'],
      ['¿Qué talla de anillo es la 52 en España?', 'Una talla 52 corresponde a un perímetro interior de unos 52 mm, aproximadamente una talla 6 estadounidense.'],
      ['¿Qué talla de anillo me conviene si el anillo es ancho?', 'Los anillos anchos abrazan más el dedo, así que suele convenir elegir media talla más que en un anillo fino.'],
      ['¿Puedo cambiar el anillo si no me queda bien?', 'Sí, dentro de los plazos legales. Escríbenos por WhatsApp y te explicamos cómo hacerlo.']
    ],
    related: ['anillos']
  },
  {
    slug: 'largo-de-cadena',
    title: 'Largo de cadena: 50, 60 o 70 cm, guía para elegir',
    h1: 'Largo de cadena: ¿50, 60 o 70 cm? Cómo elegir el tuyo',
    desc: 'Guía para elegir el largo de una cadena o collar: dónde cae cada medida (45, 50, 55, 60 y 70 cm) y cómo combinar varias cadenas.',
    lead: 'La misma cadena se ve muy distinta con 50 cm que con 70 cm. Esta guía te explica dónde cae cada longitud para que aciertes a la primera.',
    html: `
<h2>Dónde cae cada largo de cadena</h2>
<div class="table-wrap"><table>
  <thead><tr><th>Largo</th><th>Dónde cae (orientativo)</th><th>Cómo se ve</th></tr></thead>
  <tbody>
    <tr><td>40–45 cm</td><td>Pegada al cuello</td><td>Tipo gargantilla</td></tr>
    <tr class="ours"><td>50 cm</td><td>A la altura de la clavícula</td><td>El largo más habitual</td></tr>
    <tr class="ours"><td>55 cm</td><td>Justo por debajo de la clavícula</td><td>Versátil, para cualquier escote</td></tr>
    <tr class="ours"><td>60 cm</td><td>Sobre la parte alta del pecho</td><td>Ideal para hombre y para capas</td></tr>
    <tr class="ours"><td>70 cm</td><td>Sobre el pecho</td><td>Cadena larga, con mucha presencia</td></tr>
  </tbody>
</table></div>
<p class="note">Medidas orientativas: el resultado cambia según la estatura y el cuello. Las filas resaltadas son los largos que tenemos en tienda.</p>
<h2>Qué largo elegir según tu estilo</h2>
<ul>
  <li><strong>Con colgante o llevada sola:</strong> 50 cm es la medida más favorecedora para la mayoría de la gente.</li>
  <li><strong>Para hombre:</strong> 55 o 60 cm suele quedar mejor, sobre todo con cadenas gruesas como la <a href="/producto/collar-de-eslabones-cubanos-de-acero/">cadena de eslabones cubanos</a>.</li>
  <li><strong>Para combinar varias cadenas:</strong> mezcla largos con 5 o 10 cm de diferencia, por ejemplo 50 y 60 cm, para que no se enreden.</li>
</ul>
<h2>Cadena cubana o cadena de cuerda: el grosor también importa</h2>
<p>Una cadena de 3 mm, como la <a href="/producto/collar-de-cadena-de-cuerda-trenzada-de-acero-inoxidable/">cadena de cuerda trenzada</a>, es fina y elegante. Una de 5 mm, como el collar de eslabones cubanos, tiene mucha más presencia. Cuanto más gruesa, más conviene que sea más larga para que se vea proporcionada.</p>
<h2>Cómo medir una cadena que ya tienes</h2>
<p>Extiende la cadena en línea recta, con el cierre abierto, y mide desde un extremo hasta el otro con una regla o un metro. Ese es el largo total. Mira nuestros <a href="/categoria-producto/collares/">collares y cadenas de acero inoxidable</a> y elige el que mejor te quede.</p>`,
    faq: [
      ['¿Qué largo de cadena es mejor, 50 o 60 cm?', '50 cm queda a la altura de la clavícula y es lo habitual para mujer. 60 cm cae un poco más abajo y es muy popular en hombre y para combinar con otras cadenas.'],
      ['¿Qué largo de cadena es mejor para hombre?', 'La mayoría de hombres eligen 55 o 60 cm, y 70 cm para un estilo más largo y llamativo.'],
      ['¿Cómo combino varias cadenas sin que se enreden?', 'Elige largos con 5 a 10 cm de diferencia y de grosores distintos, por ejemplo una cadena fina de 50 cm y una más gruesa de 60 cm.']
    ],
    related: ['collares']
  },
  {
    slug: 'acero-inoxidable-o-acero-quirurgico',
    title: 'Acero inoxidable vs acero quirúrgico: diferencias',
    h1: 'Acero inoxidable o acero quirúrgico: diferencias y cuál elegir',
    desc: 'Qué es el acero inoxidable y el acero quirúrgico en joyería, qué tienen en común, si se oxidan y qué debes saber si tienes la piel sensible.',
    lead: 'Cuando buscas joyas resistentes verás dos nombres: acero inoxidable y acero quirúrgico. Te explicamos qué significa cada uno, sin tecnicismos.',
    html: `
<h2>Qué es el acero inoxidable</h2>
<p>El acero inoxidable es una aleación de hierro con cromo (y otros metales). El cromo forma una capa invisible en la superficie que protege al metal de la oxidación, y por eso resiste bien la humedad y el uso diario. Es el material de los cubiertos, los relojes y, cada vez más, la joyería moderna.</p>
<h2>Qué es el acero quirúrgico</h2>
<p>«Acero quirúrgico» es un nombre comercial, no una norma oficial. En joyería se usa normalmente para referirse a acero inoxidable de grado 316L, un tipo muy utilizado también en instrumental médico. Por eso, cuando una tienda habla de acero quirúrgico, suele hablar de un acero inoxidable de gran calidad.</p>
<h2>Las joyas de Elanill0 son de acero inoxidable 316L</h2>
<p>Todas nuestras piezas están hechas de acero inoxidable 316L, es decir, del tipo que se conoce como acero quirúrgico. Es un acero de gran resistencia a la corrosión, por eso es una elección habitual en joyería de uso diario.</p>
<h2>¿Las joyas de acero inoxidable se oxidan?</h2>
<p>Con el uso normal, no se oxidan con facilidad, y soportan el agua y el sudor mucho mejor que otras joyas de bisutería. Aun así, conviene secarlas bien y evitar el contacto prolongado con cloro y productos agresivos. Lo explicamos en la <a href="/guias/cuidado-del-acero/">guía para limpiar y cuidar el acero</a>.</p>
<h2>Joyas de acero inoxidable y piel sensible</h2>
<p>El acero inoxidable contiene pequeñas cantidades de níquel, aunque queda atrapado en la aleación y se libera muy poco. Aun así, las personas con alergia fuerte al níquel pueden reaccionar a cualquier metal que lo contenga. Si tienes la piel muy sensible, consulta a tu médico o dermatólogo antes de usar una joya nueva, y escríbenos si quieres saber más sobre el material de una pieza concreta.</p>
<h2>Acero inoxidable frente a plata, oro y bisutería</h2>
<ul>
  <li><strong>Frente al oro y la plata:</strong> es mucho más económico y más resistente a golpes y rayones, aunque no tiene su valor como metal precioso.</li>
  <li><strong>Frente a la bisutería:</strong> aguanta mucho mejor el agua, el sudor y el paso del tiempo, así que puedes llevarlo a diario.</li>
</ul>
<p>Descubre toda nuestra colección de <a href="/tienda/">joyas de acero inoxidable</a>.</p>`,
    faq: [
      ['¿Qué acero usa Elanill0?', 'Todas nuestras joyas son de acero inoxidable 316L, el tipo conocido como acero quirúrgico.'],
      ['¿El acero quirúrgico y el inoxidable son lo mismo?', 'En joyería, el acero quirúrgico suele ser acero inoxidable de grado 316L. Es un nombre comercial más que una norma oficial.'],
      ['¿Las joyas de acero inoxidable se oxidan?', 'No se oxidan con facilidad en el uso diario, aunque conviene secarlas bien y evitar productos químicos fuertes.'],
      ['¿Las joyas de acero inoxidable son aptas para pieles sensibles?', 'Depende de cada persona. El acero inoxidable libera muy poco níquel, pero quien tenga alergia fuerte debe consultar a su médico antes de usarlas.']
    ],
    related: ['anillos', 'collares', 'pulseras', 'pendientes']
  },
  {
    slug: 'regalos-de-joyas',
    title: 'Regalos de joyas para hombre y mujer baratos',
    h1: 'Regalos de joyas para hombre y mujer: ideas con acero inoxidable',
    desc: 'Ideas de regalos de joyas para hombre y mujer por menos de 20 €: anillo de sello, cadena cubana, aros, brazaletes y más, en acero inoxidable.',
    lead: 'Una joya es un regalo que se usa y se recuerda. Estas ideas funcionan para cumpleaños, aniversarios, Navidad o un «porque sí», todas por menos de 20 €.',
    html: `
<h2>Regalos de joyas para hombre</h2>
<ul>
  <li><a href="/producto/anillo-de-hombre-en-acero-inoxidable-plateado/">Anillo de sello plateado</a>: moderno y minimalista, un regalo seguro para pareja, padre, hermano o amigo.</li>
  <li><a href="/producto/collar-de-eslabones-cubanos-de-acero/">Collar de eslabones cubanos</a>: una cadena con presencia que se lleva con todo.</li>
  <li><a href="/producto/pulsera-de-cadena-cubana-acero-inoxidable/">Pulsera de cadena cubana</a>: un detalle para la muñeca que hace juego con la cadena.</li>
</ul>
<h2>Regalos de joyas para mujer</h2>
<ul>
  <li><a href="/producto/pendientes-de-aro-grandes-trenzados-de-acero/">Aros grandes trenzados</a>: brillan y favorecen en cualquier peinado.</li>
  <li><a href="/producto/collar-de-cadena-de-cuerda-trenzada-de-acero-inoxidable/">Collar de cadena de cuerda</a>: elegante y fino, para llevar solo o en capas.</li>
  <li><a href="/producto/brazalete-abierto-de-acero-inoxidable-trenzado/">Brazalete abierto trenzado</a>: minimalista y fácil de ajustar.</li>
</ul>
<h2>Regalos para parejas</h2>
<p>Dos <a href="/producto/anillo-liso-de-acero-inoxidable-plateado/">anillos lisos plateados</a> a juego, o un <a href="/producto/anillo-acero-inoxidable-vintage/">anillo vintage con números romanos</a> para cada uno, son un detalle sencillo y con significado. Pide las tallas con ayuda de la <a href="/guias/talla-de-anillo/">guía de tallas</a>.</p>
<h2>Cómo acertar con un regalo de joyería</h2>
<ul>
  <li>Fíjate en el metal que ya lleva la persona (plateado o dorado) y repite el tono.</li>
  <li>Si no sabes la talla de anillo, elige un brazalete abierto o una cadena: no tienen talla fija.</li>
  <li>Escríbenos por WhatsApp contándonos a quién va dirigido y te recomendamos una pieza.</li>
</ul>
<h2>Regalos de joyas baratos que no lo parecen</h2>
<p>Todas nuestras piezas son de acero inoxidable 316L, cuestan menos de 20 € y tienen descuentos de hasta el 45 %. Además, <strong>el envío es gratis en compras de más de 50 €</strong>: combina varias piezas y te ahorras el envío. Mira la <a href="/tienda/">tienda completa</a> y elige la que mejor encaje.</p>`,
    faq: [
      ['¿Qué joya regalar a un hombre?', 'Un anillo de sello, una cadena de eslabones cubanos o una pulsera de cadena cubana son regalos muy acertados y fáciles de combinar.'],
      ['¿Qué joya regalar si no sé la talla?', 'Un brazalete abierto, una cadena o unos pendientes no necesitan talla. Son la opción más segura para sorprender.'],
      ['¿Hay envío gratis?', 'Sí, el envío es gratis en compras de más de 50 €. Por debajo de esa cantidad, acordamos el coste por WhatsApp.'],
      ['¿Puedo cambiar el regalo si no gusta?', 'Sí, dentro de los plazos legales. Consulta nuestras condiciones de envíos y devoluciones o escríbenos por WhatsApp.']
    ],
    related: ['anillos', 'collares', 'pulseras', 'pendientes']
  }
];

module.exports = guides;
