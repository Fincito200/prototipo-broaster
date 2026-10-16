---
name: Broaster
description: El buen sabor se organiza.
colors:
  primary: "#ba4429"
  background: "#f6f2e9"
  surface: "#fffdf8"
  ink: "#30271f"
  muted: "#746452"
  line: "#e4dac8"
  green: "#335d48"
typography:
  display:
    fontFamily: "Broaster Display, Segoe UI, sans-serif"
    fontWeight: 700
  headline:
    fontFamily: "Broaster Display, Segoe UI, sans-serif"
    fontSize: "clamp(28px,3vw,42px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-1.4px"
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "15px"
rounded:
  control: "8px"
  card: "14px"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
---

## Overview
Interfaz de operación para el equipo del broaster, con papel crema, naranja tostado y una familia propia de personajes vectoriales.

## Colors
Acción principal naranja #ba4429; texto #30271f; fondos #f6f2e9 y #fffdf8. Cocina distingue estados con arena, terracota suave y verde salvia, siempre acompañados de texto.

## Typography
Ubuntu Bold local, registrado como Broaster Display, para marca, títulos de página, acceso y comanda; Segoe UI con respaldo Arial para texto y formularios. Tamaño base 15px, títulos de página 28–42px y titular del acceso 36–55px, con ajustes móviles. Números tabulares para importes. La licencia de la tipografía se conserva en assets/fonts/.

## Layout
Ancho máximo 1448px. Caja separa carta y comanda de 380px; la comanda pasa a 400px desde 1500px y a 350px hasta 1100px. A 850px carta y comanda se apilan. Cocina usa tres columnas de estado y se apila a 850px. Login dividido entre personaje de marca y formulario; se apila a 560px.

## Elevation & Depth
Superficies con bordes cálidos y sombras discretas en la comanda.

## Shapes
Tarjetas de 14px; controles de 8–10px; imágenes vectoriales sin fondos remotos.

## Components
Emojis originales SVG en assets/: pollo, hamburguesa, papas, bebida, ensalada, comanda, cocinero, gráfico y ocho salsas. El helper emoji() los inserta como imágenes decorativas junto a etiquetas visibles. Cremas en dos columnas con casillas; ensalada con opciones de selección única. Mantener el selector de producto y los resúmenes por porción. Foco visible de 3px; acciones principales de al menos 44px. Movimiento reducido respeta preferencias del sistema.

## Do's and Don'ts
Conservar texto junto a los emojis. No comunicar estados solo con color. Mantener la operación rápida y los importes legibles. Los recursos visuales deben seguir siendo locales para que el prototipo funcione sin servicios externos.

Controles de caja en móvil: categorías con desplazamiento horizontal, botones de porción de 46px, atención y pago como radios visuales de un toque, barra inferior fija con cantidad y total a 850px o menos. La barra respeta el área segura y la página reserva espacio inferior. Salchipapas muestran una regla fija sin ensalada; gaseosas ofrecen botones de marca y no muestran acompañamientos.
