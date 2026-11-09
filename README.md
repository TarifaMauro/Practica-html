# 🌼 Flores amarillas

Una pequeña experiencia web animada: un jardín nocturno donde crecen flores amarillas, con un mensaje permanente.

Empieza con una pantalla oscura y un botón **"Tócame ✨"**. Al presionarlo crecen los tallos, aparecen las hojas y se abren las flores, mientras el mensaje se muestra junto al jardín. Un botón discreto permite volver a ver la animación.

## Tecnologías

- HTML5
- CSS3 (variables, animaciones con `transform` y `opacity`)
- JavaScript Vanilla

Sin frameworks, sin dependencias, sin compilación. Las flores son SVG generado desde JavaScript (no hay imágenes externas).

## Funcionalidades

- Pantalla de bienvenida con estrellas titilantes y botón con halo luminoso.
- Transición suave hacia el jardín, con protección contra pulsaciones repetidas.
- 7 flores amarillas que crecen en cascada del centro hacia los lados (tallos, hojas, pétalos y centros).
- Partículas luminosas, destellos y movimiento sutil de tallos y hojas.
- Mensaje integrado en la pantalla principal, visible mientras las flores se mueven.
- Botón "Volver a ver la animación ↻" que reinicia todo sin duplicar elementos.
- Responsive: computadoras, tablets, Android e iPhone.
- Respeta `prefers-reduced-motion`.

## Estructura

```
flores-amarillas/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── README.md
```

## Ejecutar localmente

Opción simple: abre `index.html` con doble clic en tu navegador.

Opción recomendada: en Visual Studio Code instala la extensión **Live Server**, haz clic derecho sobre `index.html` y elige **Open with Live Server**.

## Personalizar

Todo se edita en el objeto `CONFIG` al inicio de `js/script.js`:

- `texts`: los textos del mensaje, los botones y la bienvenida.
- `flowers`: posición, altura, tamaño, curvatura e inclinación de cada flor.
- `counts`: cantidad de estrellas y partículas.
- `timing`: tiempos de la animación.

Los colores están como variables CSS al inicio de `css/styles.css`.

## Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (rama `main`).
2. En el repositorio: **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. Espera uno o dos minutos. La URL será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Alternativas: Netlify (arrastrar la carpeta en *Add new site → Deploy manually*) o Cloudflare Pages (conectar el repositorio, sin comando de build y con el directorio de salida vacío o `/`).
