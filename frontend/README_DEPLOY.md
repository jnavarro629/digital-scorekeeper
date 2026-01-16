# Digital Scorekeeper - Guía de Deployment en Netlify

## 📋 Descripción
Digital Scorekeeper es una aplicación web moderna para la gestión de estadísticas de baloncesto en vivo, optimizada para tablet y móvil (Mobile First).

## ✨ Características Principales

### Funcionalidades Core
- ✅ Configuración de equipos con colores personalizados
- ✅ Gestión de 12 jugadores por equipo
- ✅ Cronómetro progresivo con soporte de prórrogas
- ✅ Registro completo de estadísticas (MIN, PTS, T2, T3, T1, REB, AST, BR, BP, TF, TC, FC, FR, VAL)
- ✅ Sistema de play-by-play en tiempo real
- ✅ Box Score completo con valoración
- ✅ Exportación a PDF (con opción de incluir play-by-play)
- ✅ Sistema de deshacer (Undo) para corregir errores
- ✅ Sustituciones simples de jugadores
- ✅ Dark Mode y Light Mode
- ✅ Persistencia en LocalStorage

### Flujo de Acciones Inteligente
1. **Tras anotar puntos (+2 o +3)**: Pregunta si hubo asistencia y quién asistió
2. **Tras anotar falta**: Pregunta qué jugador contrario recibió la falta
3. **Tras tapón**: Pregunta qué jugador contrario fue taponado
4. **Tras robo**: Pregunta qué jugador contrario cometió la pérdida
5. **Tras pérdida**: Pregunta si hubo robo y quién lo hizo

## 🚀 Deployment en Netlify

### Opción 1: Deploy desde la Interfaz de Netlify

1. **Preparar el build local**:
```bash
cd frontend
yarn install
yarn build
```

2. **Deploy manual**:
   - Ve a [netlify.com](https://netlify.com) y haz login
   - Arrastra la carpeta `frontend/build` a la interfaz de Netlify
   - ¡Listo! Tu app estará desplegada

### Opción 2: Deploy con GitHub/Git

1. **Conectar repositorio**:
   - Sube tu código a GitHub/GitLab/Bitbucket
   - En Netlify: "New site from Git"
   - Selecciona tu repositorio

2. **Configuración de Build**:
   ```
   Base directory: frontend
   Build command: yarn build
   Publish directory: frontend/build
   ```

3. **Variables de Entorno (Opcional)**:
   No se requieren variables de entorno ya que la app usa LocalStorage.

### Opción 3: Deploy con Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
yarn build
netlify deploy --prod --dir=build
```

## 📱 Características Técnicas

### Stack Tecnológico
- **Frontend**: React 19.0
- **Estado**: Zustand con persistencia
- **Estilos**: Tailwind CSS + Shadcn/ui
- **Tipografía**: 
  - Space Grotesk (interfaz)
  - Orbitron (marcador digital)
- **Iconos**: Lucide React
- **PDF Export**: jsPDF + jspdf-autotable
- **Persistencia**: LocalStorage

### Responsive Design
- ✅ Mobile First (optimizado para tablet y móvil)
- ✅ Desktop compatible
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Navegadores Soportados
- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Mobile Safari (iOS 12+)
- Chrome Mobile (últimas 2 versiones)

## 📖 Guía de Uso

### 1. Configuración Inicial
1. Ingresa nombres de los equipos (Local y Visitante)
2. Selecciona colores para cada equipo
3. Agrega nombres de jugadores (12 por equipo)
4. Configura duración de cuartos (default: 10 minutos)
5. Click en "Iniciar Partido"

### 2. Durante el Partido
1. **Seleccionar jugador**: Click en el jugador de la lista
2. **Registrar acción**: Click en el botón de acción (Puntos, Falta, Rebote, etc.)
3. **Completar detalles**: Responder preguntas secundarias si aparecen
4. **Deshacer**: Click en botón "Undo" para corregir errores

### 3. Controles del Cronómetro
- ▶️ Play: Iniciar cronómetro
- ⏸️ Pause: Pausar cronómetro
- 🔄 Reset: Reiniciar a 00:00
- ⏭️ Next: Avanzar al siguiente cuarto/prórroga

### 4. Sustituciones
- Click en el icono ⇄ junto al jugador activo
- Selecciona jugador del banquillo
- La sustitución se registra inmediatamente

### 5. Estadísticas y Exportación
- **Ver Box Score**: Click en icono de gráfica 📊
- **Exportar PDF**: Click en icono de descarga 📥
  - Opción de incluir play-by-play
- **Dark/Light Mode**: Click en icono ☀️/🌙

## 🔧 Configuración de Netlify (netlify.toml)

Crea un archivo `netlify.toml` en la raíz del proyecto:

```toml
[build]
  base = "frontend"
  command = "yarn build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 📊 Cálculo de Valoración (VAL)

La valoración se calcula con la fórmula:
```
VAL = PTS + REB + AST + BR + TF 
      - (T2 fallados) - (T3 fallados) - (T1 fallados) - BP
```

## 🐛 Troubleshooting

### La app no carga después del deploy
- Verifica que la ruta de build sea correcta: `frontend/build`
- Asegúrate de tener el redirect configurado en netlify.toml

### LocalStorage no persiste
- Verifica que el navegador no esté en modo incógnito
- Comprueba que las cookies/storage estén habilitadas

### Fuentes no se cargan
- Las fuentes se cargan desde Google Fonts, requiere conexión a internet

### PDF no se genera
- Verifica que el navegador permita descargas
- Comprueba la consola del navegador por errores

## 📝 Notas Adicionales

### Datos Guardados
- Los datos del partido se guardan automáticamente en LocalStorage
- Para continuar un partido interrumpido, simplemente recarga la página
- Para empezar un partido nuevo, usa el botón "Reiniciar partido" en el menú

### Límites
- Historial de Undo: últimas 10 acciones
- Jugadores por equipo: 12 (5 en cancha, 7 en banco)
- Sin límite de cuartos (soporta múltiples prórrogas)

## 🎨 Personalización

### Colores de Equipo
Los colores se pueden elegir libremente con el selector de color. Los colores seleccionados se aplican a:
- Badges de nombre de equipo
- Marcador
- Jugadores seleccionados
- Bordes en play-by-play

### Temas
La aplicación incluye:
- **Dark Mode**: Tema oscuro profesional (default)
- **Light Mode**: Tema claro para entornos luminosos
- La preferencia se guarda en LocalStorage

## 📄 Licencia

Este proyecto está listo para uso personal y comercial.

## 🤝 Soporte

Para problemas o preguntas, revisa:
1. Esta documentación
2. La sección de Troubleshooting
3. Los logs del navegador (F12 → Console)

---

**¡Disfruta usando Digital Scorekeeper!** 🏀
