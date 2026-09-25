# Módulo de Forja & Alquimia de Runas (`src/modules/forge`)

El módulo `forge` es el núcleo interactivo y alquímico de Stellar Runes. Permite a los jugadores seleccionar dos cartas de su mazo, previsualizar la fusión resultante, canalizar éter mediante WebGL y ejecutar la síntesis atómica (*Burn & Mint*).

---

## 1. Estructura del Módulo

```text
src/modules/forge/
├── domain/
│   ├── forge-rules.ts             # Reglas deterministas de afinidad y cálculo de rarezas
│   ├── forge-rules.test.ts        # Suite de pruebas unitarias de dominio (Vitest)
│   ├── schemas.ts                 # Esquema Zod de validación de stats generados por el Oráculo
│   └── types.ts                   # Tipos de Preview, Síntesis y Resultados
├── application/
│   ├── forge-service.ts           # Casos de uso: calculateForgePreview, synthesizeHybridCard
│   └── forge-service.test.ts      # Pruebas de orquestación de servicios
├── infrastructure/
│   ├── gemini-client.ts           # Cliente SDK @google/genai con fallback determinista
│   ├── oracle-crypto.ts           # Firmador criptográfico canónico Ed25519 para Soroban
│   └── schema.ts                  # Tipos del oráculo
├── ui/
│   ├── hooks/
│   │   └── useForgeWorkbench.ts   # Máquina de estados del Workbench de la Forja
│   ├── AetherCrystal.tsx          # Cristal cósmico 3D (Three.js WebGL)
│   ├── CardSlot.tsx               # Pedestales de cartas A y B con indicador de quema
│   ├── ForgeContainer.tsx         # Contenedor orquestador del Workbench
│   ├── ForgeIgniteButton.tsx      # Botón de ignición con soporte Hold-to-Forge (1.1s)
│   ├── ForgeSkeleton.tsx          # Pantalla de carga con shimmer elegante
│   ├── ForgeTable.tsx             # Mesa de runas ceremonial
│   ├── InventoryDrawer.tsx        # Cajón inferior de cartas con filtros por elemento
│   └── RevealModal.tsx            # Modal de revelación de nueva carta con confeti
└── index.ts                       # Exportación pública del módulo
```

---

## 2. Dominio y Reglas Deterministas (`domain/forge-rules.ts`)

> **Decisión Arquitectónica Clave**:  
> La Inteligencia Artificial (Gemini) **NO** decide el elemento ni la rareza resultante. Estos valores se calculan matemáticamente en el dominio para garantizar que el Oráculo fuera de cadena (*off-chain*) y el Smart Contract en Soroban (*on-chain*) arriben con certeza al **mismo e idéntico resultado**.

### Matriz de Fusión Elemental
* `FIRE + WATER` $\to$ **STEAM**
* `FIRE + EARTH` $\to$ **MAGMA**
* `AIR + FIRE` $\to$ **LIGHTNING**
* `WATER + EARTH` $\to$ **NATURE**
* `AIR + WATER` $\to$ **ICE**
* `EARTH + AIR` $\to$ **SAND**
* `ELEMENTO + MISMO ELEMENTO` $\to$ **CONSERVA EL ELEMENTO**
* `HÍBRIDO + OTRA CARTA` $\to$ **AETHER**

### Regla de Ascensión de Rareza
La carta resultante asciende un peldaño por encima del padre de mayor rareza, con tope en `LEGENDARY`:
$$\text{Rareza Resultante} = \min(\max(\text{Rarity}_A, \text{Rarity}_B) + 1, \text{LEGENDARY})$$

---

## 3. Servicios de Aplicación (`application/forge-service.ts`)

* `calculateForgePreview(cardA, cardB)`: Valida la elegibilidad de los dos padres, calcula el elemento resultante, la rareza y el rango de presupuesto numérico permitido ($\text{budgetMin} \dots \text{budgetMax}$).
* `synthesizeHybridCard(cardA, cardB)`: Genera la entidad de carta híbrida sintetizada asegurando que los atributos de ataque y defensa respeten estrictamente el presupuesto.

---

## 4. Cristal WebGL Three.js (`ui/AetherCrystal.tsx`)

Renderizador WebGL acelerado por hardware para el núcleo de poder del altar:
* **Geometría Bipiramidal**: Octaedro tallado con jaula de alambre holográfica (`Wireframe`) y enjambre de 35 partículas orbitales.
* **Física y Animación**: Utiliza `performance.now()` nativo para calcular deltas temporales continuos, libre de advertencias de versiones obsoletas de Three.js.
* **Reactividad Dinámica**:
  - Estado base: Pulsación suave en tonos cian y luz puntual ambiental.
  - Al equipar runas: Incremento de velocidad angular y luminosidad.
  - Al forjar: Vórtice acelerado en tonos magenta y azul cobalto con resplandor intenso.
* **Cero Fugas de Memoria (Zero Memory Leaks)**: Al desmontar el componente, se invocan explícitamente los métodos `.dispose()` de geometrías, materiales y renderer, además de cancelar el `requestAnimationFrame`.

---

## 5. Componentes y Flujo del Workbench (`ui/`)

1. **Altar (`ForgeTable.tsx`)**: Dispone espacialmente las ranuras `CardSlot` a los lados del `AetherCrystal`.
2. **Pedestales (`CardSlot.tsx`)**: Admiten cartas arrastradas del inventario o seleccionadas por click. Incluyen alertas visuales de "Se quemará" (`Burn indicator`) y botón de desequipado accesible.
3. **Botón de Ignición (`ForgeIgniteButton.tsx`)**:
   - Soporta doble modalidad de activación: Clic directo o mantener presionado durante 1.1 segundos (*Hold to Forge*) con barra de llenado visual.
   - Refleja estados de carga: "1/3 Gemini balanceando...", "2/3 Simulando Soroban...", "3/3 Ejecutando Burn & Mint".
4. **Cajón de Inventario (`InventoryDrawer.tsx`)**:
   - Pestañas de filtrado rápido: `Todos`, `FIRE`, `WATER`, `EARTH`, `AIR`, `Híbridos`.
   - Soporta botón para reclamar el mazo inicial gratuito (`Claim Starter Deck`) cuando el usuario conecta su wallet por primera vez.
5. **Modal de Revelación (`RevealModal.tsx`)**:
   - Presentación triunfal de la nueva carta forjada con confeti cósmico (`canvas-confetti`).
   - Muestra las dos cartas sacrificadas que fueron consumidas en el proceso.
