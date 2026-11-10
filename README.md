# NovaShop — sitio listo para GitHub Pages

Tienda de demostración estática con diseño responsive, catálogo, filtros, favoritos y carrito local.

## Publicación desde GitHub (sin usar terminal)

1. Entra en https://github.com/new e inicia sesión.
2. Crea un repositorio **público** llamado, por ejemplo, `novashop`.
3. Dentro del repositorio, selecciona **Add file → Upload files**.
4. **Descomprime el ZIP** y sube **todo su contenido a la raíz del repositorio**, incluido `index.html`, `style.css`, `script.js`, la carpeta `assets` y el archivo `.nojekyll`. No subas únicamente el ZIP ni una carpeta contenedora.
5. Pulsa **Commit changes**.
6. En **Settings → Pages**, elige **Deploy from a branch**, rama **main**, carpeta **/(root)**, y guarda.
7. Cuando GitHub termine de publicar, entra en `https://TU-USUARIO.github.io/novashop/` (cambia usuario y nombre del repositorio). También puedes encontrar el enlace en **Settings → Pages → Visit site**.

## Opcional: publicar usando Git desde tu PC

Abre una terminal en la carpeta descomprimida y ejecuta:

```bash
git init
git add .
git commit -m "Publicar NovaShop"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/novashop.git
git push -u origin main
```

Primero crea el repositorio **vacío** en GitHub y sustituye `TU-USUARIO` por tu usuario. Después habilita GitHub Pages con los pasos 6 y 7.

## Estructura

```text
index.html
style.css
script.js
assets/
.nojekyll
.gitignore
README.md
LEEME.txt
```

## Notas

- Las rutas de CSS, JS e imágenes son **relativas**, por lo que funcionan en GitHub Pages incluso al publicar en un subdirectorio del repositorio.
- Los favoritos y el carrito se guardan en el navegador del visitante; no se comparten entre dispositivos.
- La página **no procesa compras, pagos ni pedidos reales**. Para vender necesitarás un backend y una pasarela de pagos adecuada.
- Las fuentes web se descargan desde Google Fonts cuando hay conexión; existe una tipografía de reserva para cuando no hay acceso a internet.
