# Lumi Text

¡Por supuesto! Aquí tienes una descripción concisa del proyecto, ideal para un README en GitHub, un portafolio o para explicarlo rápidamente.

## **Objetivo Principal**

Crear una aplicación web ligera y enfocada, diseñada para ayudar a hispanohablantes a mejorar su inglés a través de la lectura. El objetivo es transformar cualquier texto digital en una herramienta de aprendizaje interactiva, eliminando la necesidad de usar traductores externos y permitiendo al usuario construir un vocabulario personalizado de forma orgánica y eficiente.

## La aplicación funciona 100% en el navegador del cliente, garantizando una experiencia rápida, privada y disponible sin conexión a internet.

## **Características Principales**

1.  **Biblioteca Personalizada:**

    - El usuario puede subir sus propios archivos de texto (`.txt`) o simplemente pegar contenido directamente en la aplicación. Esto le permite aprender con material que realmente le interesa (artículos, libros, letras de canciones, etc.).

2.  **Lectura Interactiva con Traducción Instantánea:**

    - Cada palabra en el texto es clickeable. Al hacer clic, aparece un pequeño popup con la traducción al español, agilizando la comprensión sin interrumpir el flujo de lectura.

3.  **Sistema de Vocabulario Inteligente:**

    - Dentro del popup, el usuario puede marcar cada palabra como **"conocida"** o **"desconocida"**.
    - Las palabras marcadas como **desconocidas se resaltan visualmente** (p. ej., en color rojo) a lo largo de todos los textos, ayudando a reforzar su aprendizaje.
    - Todas las palabras desconocidas se guardan automáticamente en una base de datos local para futuros repasos.

4.  **Sincronización con Audio para Práctica de _Listening_:**

    - Se puede asociar un archivo de audio (como un audiolibro) a cada texto. Esto permite al usuario leer y escuchar al mismo tiempo, mejorando tanto la comprensión lectora como la auditiva y la pronunciación.

5.  **Privacidad y Funcionamiento Offline:**
    - Al no requerir un backend y utilizar IndexedDB para todo el almacenamiento, la aplicación es completamente privada. Los textos y el progreso del usuario nunca abandonan su propio dispositivo.

## **Plan de Desarrollo**

Nos centraremos en un desarrollo incremental, construyendo característica por característica sobre una base sólida. Empezaremos con lo más simple y añadiremos complejidad gradualmente.

---

### **Fase 0: Preparación y Arquitectura del Proyecto**

Antes de escribir una sola línea de código de la aplicación, necesitamos preparar nuestro entorno y definir la estructura.

**1. Inicialización del Proyecto:**

- Usa **Vite** para crear el proyecto. Es más rápido y moderno que `create-react-app`.
  ```bash
  npm create vite@latest mi-lector-de-ingles -- --template react-ts
  ```
  _(Recomiendo usar TypeScript (`-ts`) desde el principio. Te ahorrará muchos dolores de cabeza al trabajar con IndexedDB y la estructura de tus datos)._

**2. Instalación de Dependencias Clave:**

- **React Router:** Para la navegación entre la lista de textos y el lector.
  ```bash
  npm install react-router-dom
  ```
- **Dexie.js:** Un wrapper de IndexedDB que hace que trabajar con esta base de datos sea un placer y no una tortura. ¡Altamente recomendado!
  ```bash
  npm install dexie dexie-react-hooks
  ```

**3. Estructura de Carpetas:**
Crea una estructura de carpetas clara dentro de `src/`:

```
src/
├── assets/         # Imágenes, fuentes, etc.
├── components/     # Componentes reutilizables (Button, Popup, Player...)
├── context/        # React Context para el estado global (palabras conocidas/desconocidas)
├── db/             # Lógica de IndexedDB (definición de la BBDD con Dexie)
├── hooks/          # Hooks personalizados (useWords, useTexts...)
├── pages/          # Componentes de página (HomePage, ReaderPage, AddTextPage)
├── styles/         # Estilos globales si los hubiera
└── types/          # Definiciones de tipos de TypeScript (Text, Word...)
```

**4. Definición de la Base de Datos (con Dexie):**
Crea el archivo `src/db/db.ts`. Aquí definiremos las "tablas" de nuestra base de datos IndexedDB.

```typescript
// src/db/db.ts
import Dexie, { Table } from "dexie";

export interface Text {
  id?: number;
  title: string;
  content: string;
  audioUrl?: string; // Guardaremos la URL temporal del audio aquí
  createdAt: Date;
}

export interface Word {
  lemma: string; // La palabra en su forma base (ej: "run" para "running")
  status: "unknown" | "known";
  translation: string;
}

export class MySubClassedDexie extends Dexie {
  texts!: Table<Text>;
  words!: Table<Word>;

  constructor() {
    super("englishReaderDB");
    this.version(1).stores({
      texts: "++id, title, createdAt", // ++id es autoincremental, el resto son índices
      words: "&lemma, status", // &lemma significa que es una clave primaria única
    });
  }
}

export const db = new MySubClassedDexie();
```

---

### **Fase 1: El Núcleo - Subir y Leer Textos**

**Objetivo:** Permitir al usuario añadir un texto y verlo en una página de lectura.

**Pasos:**

1.  **Crear Página Principal (`HomePage.tsx`):**

    - Esta página mostrará una lista de todos los textos guardados.
    - Usará un hook de Dexie (`useLiveQuery`) para obtener los textos de IndexedDB en tiempo real.
    - Tendrá un botón "Añadir nuevo texto" que navegará a la página de añadir texto.
    - Cada texto en la lista será un enlace que llevará a `/reader/:textId`.

2.  **Crear Página para Añadir Textos (`AddTextPage.tsx`):**

    - Un formulario con:
      - Un `<input type="text">` para el título.
      - Un `<textarea>` para pegar el contenido del texto.
      - Un `<input type="file" accept=".txt">` para subir un archivo de texto.
    - La lógica del formulario leerá el contenido (ya sea del textarea o del archivo) y usará una función de nuestra base de datos para guardarlo en la tabla `texts` de IndexedDB.
    - Tras guardar, redirigirá al usuario a la página principal o a la nueva página de lectura.

3.  **Crear la Página del Lector (`ReaderPage.tsx`):**

    - Obtendrá el `textId` de los parámetros de la URL usando `useParams` de React Router.
    - Usará `useLiveQuery` para obtener el texto específico de IndexedDB.
    - **Procesamiento del Texto:** Aquí está la magia. El contenido del texto no se puede mostrar tal cual. Debe procesarse para que cada palabra sea interactiva.
      - Toma el string `text.content`.
      - Divídelo en palabras y espacios. Una buena forma es usar regex: `content.split(/(\s+)/)`. Esto conserva los espacios y saltos de línea como elementos separados en el array.
      - Renderiza el resultado con un `.map()`, envolviendo cada palabra en un componente `<Word />` (que crearemos en la siguiente fase) y los espacios como texto plano.

    ```jsx
    // Dentro de ReaderPage.tsx (simplificado)
    const wordsAndSpaces = text.content.split(/(\s+)/);

    return (
      <div>
        {wordsAndSpaces.map((segment, index) => {
          if (segment.trim() === "") {
            return <span key={index}>{segment}</span>; // Es un espacio o salto de línea
          }
          return <Word key={index} word={segment} />;
        })}
      </div>
    );
    ```

---

### **Fase 2: La Interacción - Popup de Palabras y Estados**

**Objetivo:** Al hacer clic en una palabra, mostrar un popup con la traducción y opciones para marcar su estado.

**Pasos:**

1.  **Crear el Componente `Word` (`components/Word/Word.tsx`):**

    - Este componente recibe una palabra (`word`) como prop.
    - Tendrá un `<span>` con un `onClick` handler.
    - Usará `CSS Modules` para los estilos. Ejemplo: `import styles from './Word.module.css';`
    - Su estilo dependerá de su estado (desconocida, conocida).

2.  **Crear el Componente `WordPopup` (`components/WordPopup/WordPopup.tsx`):**

    - Se mostrará de forma condicional y se posicionará cerca de la palabra clickeada.
    - Recibirá la palabra y su estado actual como props.
    - **Traducción:** Para la traducción, tienes dos opciones:
      - **Opción A (Online):** Usar una API de traducción gratuita como [MyMemory Translated API](https://mymemory.translated.net/doc/spec.php). Es simple y no requiere clave. Haces un `fetch` desde el popup.
      - **Opción B (Offline):** Incluir un diccionario JSON (inglés-español) en tu proyecto. Esto lo hace 100% offline pero puede ser pesado y menos completo.
    - Tendrá dos botones: "Conozco" y "Desconocida".
    - Al hacer clic en estos botones, se actualizará el estado de la palabra en IndexedDB.

3.  **Gestión de Estado Global de Palabras (`WordContext`):**
    - Crea un `WordContext` para mantener un mapa del estado de todas las palabras que el usuario ha marcado.
    - El `Provider` de este contexto envolverá toda la aplicación.
    - Al iniciar la app, este contexto cargará todas las palabras de la tabla `words` de IndexedDB en un objeto: `{'hello': {status: 'known', ...}, 'world': {status: 'unknown', ...}}`.
    - El componente `Word` usará este contexto (`useContext(WordContext)`) para saber si debe aplicar el estilo de "desconocida" (`styles.unknownWord`).
    - Cuando el usuario cambia el estado de una palabra en el popup, además de actualizar IndexedDB, actualizas el estado del contexto para que la UI reaccione inmediatamente.

---

### **Fase 3: Integración de Audio**

**Objetivo:** Asociar un archivo de audio a un texto y reproducirlo.

**Pasos:**

1.  **Actualizar la Interfaz:**

    - En la página `ReaderPage.tsx`, añade un `<input type="file" accept="audio/*">`. Puedes ocultarlo y activarlo con un botón con un ícono de música.

2.  **Manejar la "Subida" de Audio:**

    - Cuando el usuario selecciona un archivo de audio, **NO** lo guardamos en IndexedDB.
    - Usamos `URL.createObjectURL(file)` para generar una URL local temporal para ese archivo. Ejemplo: `blob:http://localhost:5173/1234-5678...`
    - Guardamos esta **URL de tipo string** en nuestra tabla `texts` en el campo `audioUrl`, junto al `id` del texto correspondiente.

3.  **Crear el Componente `AudioPlayer` (`components/AudioPlayer/AudioPlayer.tsx`):**

    - Un componente simple que envuelve la etiqueta HTML5 `<audio>`.
    - Recibe la `audioUrl` como prop.
    - Ejemplo: `<audio controls src={props.audioUrl}>Tu navegador no soporta audio.</audio>`

4.  **Integrar en el Lector:**
    - En `ReaderPage.tsx`, si el objeto `text` tiene un `audioUrl`, renderiza el componente `AudioPlayer` pasándole esa URL.

**Consideración Clave sobre el Audio:**
La URL creada con `createObjectURL` es **temporal y solo válida para la sesión actual del navegador**. Si el usuario cierra la pestaña y la vuelve a abrir, esa URL ya no funcionará.

- **Solución:** Al cargar la `ReaderPage`, puedes intentar hacer un `fetch` a la `audioUrl`. Si falla (lo que ocurrirá en una nueva sesión), significa que la referencia está rota. En ese caso, puedes mostrar un mensaje como "El audio no está cargado. Por favor, selecciónalo de nuevo" y mostrar el input para volver a seleccionarlo. Esto mantiene la app 100% del lado del cliente sin sorpresas.

---

### **Fase 4: Funcionalidades Adicionales y Pulido**

**Objetivo:** Mejorar la experiencia de usuario con las últimas características.

**Pasos:**

1.  **Eliminar Textos:**

    - En la `HomePage.tsx`, añade un botón de eliminar (`X`) al lado de cada texto en la lista.
    - Al hacer clic, muestra una confirmación (`window.confirm`) y luego llama a la función de Dexie para borrar el texto de la tabla `texts` por su `id`. `db.texts.delete(textId)`.

2.  **Resaltado Global de Palabras Desconocidas:**

    - Gracias al `WordContext` que creamos en la Fase 2, esto es casi automático.
    - El componente `Word` ya consulta el contexto para determinar su estado.
    - Solo necesitas definir el estilo en su archivo CSS Module.

    ```css
    /* src/components/Word/Word.module.css */
    .word {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .word:hover {
      background-color: #f0f0f0;
    }

    .unknown {
      background-color: #ffcccc; /* Un rojo suave para las desconocidas */
      color: #a60000;
    }
    ```

    ```jsx
    // src/components/Word/Word.tsx
    // ...
    const { wordStatuses } = useContext(WordContext);
    const wordInfo = wordStatuses[word.toLowerCase()]; // Normalizar palabra
    const className = `${styles.word} ${
      wordInfo?.status === "unknown" ? styles.unknown : ""
    }`;
    // ...
    ```

3.  **(Opcional pero recomendado) Página de Repaso:**
    - Crea una página `/review`.
    - Esta página usará `useLiveQuery` para obtener todas las palabras de la tabla `words` donde `status === 'unknown'`.
    - Muestra estas palabras como flashcards para que el usuario las repase.

¡Y eso es todo! Siguiendo estos pasos de forma ordenada, construirás una aplicación robusta, funcional y exactamente como la describiste. ¡Manos a la obra y mucho éxito con tu proyecto
