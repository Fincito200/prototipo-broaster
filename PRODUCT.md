# Broaster

## Platform
Web: HTML, CSS y JavaScript sin framework.

## Users
Caja registra y cobra pedidos; cocina los prepara por orden de recepción; administración edita la carta y consulta ventas.

## Capabilities and Constraints
Demo local con credenciales de prueba y almacenamiento en localStorage. Conserva el flujo de adicionales, pagos, estados y exportación CSV. Cremas de un clic y ensalada (con, aparte o sin) independientes para cada porción. Varias pestañas del mismo origen comparten actualizaciones. No tiene backend ni autenticación de producción.

## Brand Commitments
Nombre Broaster. Solicitud del usuario: interfaces originales y emojis personalizados.

## Carta
Hamburguesas: clásica y royal. Broaster: alita, pecho, pierna y encuentro; las Alitas BBQ previas pertenecen ahora a Broaster. Salchipapas: clásica y royal. Mostrito: alita, pecho, pierna y encuentro. Se mantienen bebidas y combo familiar. Administración admite futuras variedades. Las variantes nuevas requieren configurar su precio antes de venderse; se conservan los precios de demostración de productos previos. Actualización automática menuVersion 2 sin cambiar pedidos históricos ni productos personalizados.

## Operación móvil
Las salchipapas siempre se registran sin ensalada y no permiten modificarla. Las bebidas no llevan cremas ni ensalada. Gaseosa personal requiere elegir Coca-Cola o Inca Kola al agregar; marcas con cantidades independientes conservan el precio del producto. Caja usa opciones de un toque para porción, atención y pago; referencia y observaciones son opcionales. Barra móvil de total con acceso al pedido y retorno a la carta.

Todos los mostritos van obligatoriamente sin ensalada, igual que las salchipapas.

## Administración de categorías e imágenes
Nuevo producto y Editar producto permiten elegir un emoji del catálogo, usar el emoji automático por categoría o importar PNG/JPG/WebP desde el dispositivo. Las imágenes se optimizan a un máximo de 384px y se guardan con el producto. La categoría se elige de las existentes; Crear categoría registra un nombre nuevo sin perder los campos del formulario. Se evitan duplicados por espacios, mayúsculas y tildes.

## Lectura de comandas en Cocina
Cada comanda destaca Recojo, Mesa o Delivery junto a su referencia. Cada porción agrupa su tipo de hamburguesa, cremas y ensalada en un bloque propio. La cola conserva el orden de preparación obligatorio. Al marcar Listo, Caja actualiza la etiqueta del pedido en Pedidos recientes y permite registrar entrega, sin un panel superior duplicado. La sincronización actual sigue limitada a pestañas del mismo navegador y origen.
