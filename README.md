# ⚡ QuantLiquidationTerminal: Modo Espejo BTC / $1000PEPE

Terminal de Trading Cuantitativo y Web3 para la ejecución de estrategias basadas en **Mapas de Liquidación**, **Muros de Absorción de Stops**, **Correlación de Pearson ($r$)** y **Modo Espejo** entre Bitcoin y $1000PEPE.

---

## 🚀 Despliegue en Vercel (Producción Web)

Este repositorio está 100% preconfigurado con `vercel.json` y Vite para desplegarse en **Vercel** en menos de 1 minuto sin necesidad de ajustes manuales.

### Método 1: Despliegue con GitHub (Recomendado)

1. **Crear repositorio en GitHub**:
   Crea un nuevo repositorio en [github.com/new](https://github.com/new) (ej. `quant-liquidation-mirror`).

2. **Subir tu código**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for vercel deployment"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/quant-liquidation-mirror.git
   git push -u origin main
   ```

3. **Importar en Vercel**:
   - Ingresa a [vercel.com/new](https://vercel.com/new).
   - Conecta tu cuenta de GitHub y selecciona el repositorio `quant-liquidation-mirror`.
   - Vercel detectará automáticamente el framework como **Vite**.
   - Haz clic en **"Deploy"**. ¡Listo! Tu terminal estará en línea con HTTPS y CDN global.

### Método 2: Despliegue directo mediante Vercel CLI

```bash
# Instalar Vercel CLI e iniciar sesión
npm install -g vercel

# Desplegar a producción
vercel --prod
```

---

## 📌 Requisitos y Módulos Implementados

1. **Arquitectura de Interfaz en Paralelo (Modo Espejo)**:
   - Visualización en dos columnas sincronizadas:
     - **Columna Izquierda**: Bitcoin (BTC / USDT Perp).
     - **Columna Derecha**: $1000PEPE (1000PEPE / USDT Perp).
   - Menú de temporalidades macro: **12H, 24H y 48H**.
   - Slider dinámico para el **Umbral de Densidad de Liquidez (0.10 a 1.00, por defecto en 0.63)**.

2. **Lógica del Algoritmo y Conexión de Datos**:
   - Conexión a endpoints públicos de Binance Futures (`fapi.binance.com`) con fallback determinista de alta precisión.
   - **Filtro de Datos**: Al seleccionar `12H` y Umbral `0.63`, muestra únicamente los nodos que superen dicho umbral.
   - **Módulo de Correlación de Pearson**: Monitoreo en tiempo real. Activa el indicador visual **"MODO ESPEJO ACTIVO"** cuando $r > 0.85$.

3. **Detector de Zonas Magnéticas (El Radar)**:
   - Identificación de Muros de Liquidación para Shorts (Buy Stops) y Longs (Sell Stops).
   - Alerta visual **"Zona de Atracción Detectada"** ante confluencia en dirección y distancia proporcional.
   - **Validación Macro**: Chequeo de persistencia y crecimiento del volumen acumulado entre 12H, 24H y 48H, con **Puntuación de Fuerza Magnética (1 al 10)**.

4. **Notificaciones Sonoras (Web Audio API)**:
   - Tono tri-armónico cybernetic ante activación de **Modo Espejo** ($r > 0.85$).
   - Sonar radar ping ante detección de **Zona de Atracción Magnética**.
   - Control de volumen, mute/unmute y prueba de tonos integrada.

5. **Módulo de Gestión de Riesgo**:
   - Cuadro dinámico con la advertencia institucional requerida:
     > *"El precio tiende a perforar estas zonas para tomar liquidez, no a rebotar antes. Ajuste su stop loss considerando la volatilidad de la perforación."*
   - Calculadora de sobrepaso (*Sweeping Wick Buffer ATR*) para stops seguros.

---

## 🛠️ Ejecución Local

### Opción A: Frontend React + TypeScript (Vite + Tailwind)

```bash
npm install
npm run dev
```
Disponible en `http://localhost:3000`.

### Opción B: Python con Streamlit

```bash
pip install -r requirements.txt
streamlit run app_streamlit.py
```

---

## 📄 Archivos de Configuración para Vercel

- `vercel.json`: Reglas de reescritura SPA (`rewrites`), cabeceras de seguridad y directorios de salida (`dist`).
- `vite.config.ts`: Alias `@` optimizado para ESM en runners de Vercel.
- `.gitignore`: Excluye `node_modules/`, `dist/`, `.vercel/` y artefactos de compilación.
