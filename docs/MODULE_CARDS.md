# Módulo de Cartas & Catálogo (`src/modules/cards`)

El módulo `cards` es el Bounded Context responsable de representar las entidades fundamentales del juego de cartas, validar sus esquemas, consultar el catálogo canónico y renderizar la experiencia interactiva de coleccionismo.

---

## 1. Estructura del Módulo

```text
src/modules/cards/
├── domain/
│   ├── catalog.ts             # Las 8 cartas canónicas base iniciales
│   ├── constants.ts           # Definición de elementos, rarezas y presupuestos
│   ├── schemas.ts             # Esquemas Zod de validación estricta
│   └── types.ts               # Interfaces TypeScript para Card y CardData
├── infrastructure/
│   └── card-repository.ts     # Repositorio desacoplado de Supabase (Read Model)
├── ui/
│   ├── hooks/
│   │   └── useCardGestures.ts # Detector gestual desacoplado (Tap, Long Press, Drag)
│   ├── CardDetailsModal.tsx   # Modal de desglose de atributos y lore técnico
│   ├── CardInspectModal.tsx   # Modal de inspección 3D holográfica con giro dinámico
│   └── CardItem.tsx           # Componente atómico visual de carta
└── index.ts                   # Exportación pública del módulo
```

---

## 2. Dominio (`domain/`)

### Elementos y Rarezas (`constants.ts`)
* **Elementos Base (4)**: `FIRE`, `WATER`, `EARTH`, `AIR`.
* **Elementos Híbridos (7)**: `STEAM`, `MAGMA`, `LIGHTNING`, `NATURE`, `ICE`, `SAND`, `AETHER`.
* **Rarezas (5)**: `COMMON` (0), `UNCOMMON` (1), `RARE` (2), `EPIC` (3), `LEGENDARY` (4).
* **Presupuesto de Atributos (`STAT_BUDGET`)**:
  - `COMMON`: Min 6, Max 8 (Individual: 1 a 6)
  - `UNCOMMON`: Min 8, Max 10 (Individual: 1 a 8)
  - `RARE`: Min 10, Max 13 (Individual: 2 a 10)
  - `EPIC`: Min 13, Max 16 (Individual: 3 a 12)
  - `LEGENDARY`: Min 16, Max 20 (Individual: 4 a 15)

### Esquemas Zod (`schemas.ts`)
* `CardElementSchema`: Valida cadenas literales correspondientes a los 11 elementos posibles.
* `CardRaritySchema`: Valida las 5 rarezas permitidas.
* `StellarAddressSchema`: Valida que la dirección pública comience con `G` y tenga longitud exacta de 56 caracteres con formato StrKey Base32.
* `BaseCardSeedSchema`: Valida que las cartas cumplan con los rangos numéricos al poblar la base de datos.

### Catálogo Base (`catalog.ts`)
Contiene las 8 cartas canónicas con las que inicia el ecosistema (2 por cada elemento base):
1. **Ignis Sprite** (FIRE · COMMON · ATK 4, DEF 2)
2. **Magma Whelp** (FIRE · COMMON · ATK 3, DEF 4)
3. **Aqua Nymph** (WATER · COMMON · ATK 2, DEF 5)
4. **Tide Caller** (WATER · COMMON · ATK 4, DEF 3)
5. **Terra Golem** (EARTH · COMMON · ATK 3, DEF 5)
6. **Stone Weaver** (EARTH · COMMON · ATK 4, DEF 3)
7. **Zephyr Wisp** (AIR · COMMON · ATK 5, DEF 2)
8. **Gale Falcon** (AIR · COMMON · ATK 4, DEF 3)

---

## 3. Infraestructura (`infrastructure/card-repository.ts`)

Aplica el patrón **Repository** aislando las consultas a Supabase:
* `getCatalog()`: Obtiene el catálogo público de cartas ordenado por ID.
* `getUserCards(playerAddress)`: Consulta las cartas vivas (`is_burned: false`) de una wallet conectada, validando la dirección con `StellarAddressSchema`.
* `getForgeHistory(playerAddress, limit)`: Recupera el historial de forjas confirmadas o pendientes del jugador.

---

## 4. Capa de UI & Experiencia de Usuario (`ui/`)

### Detector Gestual Dual (`useCardGestures.ts`)
Resuelve el conflicto clásico entre tocar, arrastrar y mantener presionado en dispositivos móviles y táctiles:
* **Quick Tap (< 350ms)**: Abre instantáneamente el visor 3D holográfico de apreciación artística (`CardInspectModal`).
* **Long Press (500ms)**: Abre el modal de desglose técnico y estadísticas completas (`CardDetailsModal`).
* **Drag & Drop**: Permite arrastrar libremente la carta hacia los pedestales `Ranura A` o `Ranura B` del altar. Al soltar, detecta el slot objetivo mediante `document.elementFromPoint()`.

### Visor Holográfico 3D (`CardInspectModal.tsx`)
* Simula un efecto holográfico premium calculando la rotación matemática en los ejes X e Y (`rotX`, `rotY`) de hasta 15° según la posición del cursor o acelerómetro.
* Genera una lámina de reflejo especular dinámica (`glarePos`).
* Accesibilidad: Soporta cierre con la tecla `Escape` o clic en el fondo oscuro.

### Desglose Técnico (`CardDetailsModal.tsx`)
* Barras de calibración proporcional de ATK y DEF sobre el presupuesto máximo.
* Muestra el elemento, rareza, habilidad pasiva, lore místico y hash de autenticidad.
