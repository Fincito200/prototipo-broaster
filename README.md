# Broaster · Demo de caja, cocina y administración

Aplicación web adaptable a celular, construida con HTML, CSS y JavaScript.

## Abrir la demo

Sirve esta carpeta con un servidor estático (por ejemplo, Live Server) y abre el enlace en tu navegador. Conserva la carpeta `assets/`: contiene los emojis, las imágenes y la tipografía.

## Accesos de demostración

| Rol | Usuario | Contraseña de prueba |
|---|---|---|
| Caja | cajera | Caja123! |
| Cocina | cocinero | Cocina123! |
| Administración | admin | Admin123! |

Son credenciales públicas de demostración dentro del código. Este prototipo no implementa autenticación real.

## Funciones

- Carta con categorías, variantes y precios.
- Cremas, ensalada y tipo de hamburguesa por porción.
- Gaseosa personal con elección de Coca-Cola o Inca Kola.
- Comandas de cocina con orden de preparación y estados.
- Registro de entrega, cobro y adicionales.
- Administración de productos, categorías, emojis e imágenes importadas.
- Historial por fecha y exportación CSV compatible con Excel.

## Publicar en Vercel

Importa este repositorio y usa el preset **Other**, sin comando de compilación. La salida es la raíz del proyecto. `vercel.json` contiene esa configuración.

## Alcance de la demo

Los datos se guardan en el navegador mediante localStorage. Las pestañas del mismo navegador y origen comparten cambios; celulares o computadoras diferentes no comparten pedidos. No hay backend ni funcionamiento sin conexión garantizado. Se cargan cuatro comandas de ejemplo una vez por navegador; se identifican como pedidos de prueba.

Más instrucciones en `LEEME.txt`. La licencia de Ubuntu Bold se incluye en `assets/fonts/`.
