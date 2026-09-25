# Stellar Runes — Arquitectura del Sistema

> **Hackathon Stellar Odyssey Perú 2026**  
> **Proyecto:** Stellar Runes (Aether TCG)  
> **Patrón:** Clean Architecture & Modular Monorepo por Bounded Contexts (Screaming Architecture)

---

## 1. Visión General y Filosofía

Stellar Runes adopta los principios de **Clean Architecture** (Robert C. Martin) y **Domain-Driven Design (DDD)** adaptados al ecosistema moderno de Next.js 16 (App Router) y TypeScript estricto.

El principio rector es la **Regla de Dependencia**:
* Las capas internas de dominio no conocen detalles de infraestructura, bases de datos ni frameworks de interfaz de usuario.
* La capa de entrega (`src/app/`) actúa como un mecanismo delgado de transporte (HTTP Handlers y Server Components).
* Todo el valor de negocio reside en contextos acotados independientes (`src/modules/`).

```
                    ┌────────────────────────────────────────┐
                    │          DELIVERY MECHANISM            │
                    │        Next.js App Router (src/app)    │
                    └───────────────────┬────────────────────┘
                                        │
                    ┌───────────────────▼────────────────────┐
                    │               UI LAYER                 │
                    │   React Components, Hooks, Three.js    │
                    └───────────────────┬────────────────────┘
                                        │
                    ┌───────────────────▼────────────────────┐
                    │          APPLICATION LAYER             │
                    │     Use Cases & Domain Orchestrators   │
                    └───────────────────┬────────────────────┘
                                        │
                    ┌───────────────────▼────────────────────┐
                    │             DOMAIN LAYER               │
                    │  Pure Rules, Entities, Types & Schemas │
                    └───────────────────▲────────────────────┘
                                        │
                    ┌───────────────────┴────────────────────┐
                    │          INFRASTRUCTURE LAYER          │
                    │   Supabase, Gemini GenAI, Crypto Ed25519│
                    └────────────────────────────────────────┘
```

---

## 2. Mapa de Directorios (`src/`)

```text
src/
├── app/                                 # Delivery Mechanism (Transporte y Enrutamiento)
│   ├── api/forge/route.ts               # Endpoint HTTP del Oráculo
│   ├── globals.css                      # Estilos globales y tokens Tailwind v4
│   ├── layout.tsx                       # Layout raíz (Fuentes Geist, Provider global)
│   └── page.tsx                         # Página principal (Workbench de la Forja)
│
├── modules/                             # Bounded Contexts (Lógica de Dominio)
│   ├── cards/                           # Contexto de Cartas y Catálogo
│   │   ├── domain/                      # Reglas puras, constantes, esquemas Zod y tipos
│   │   ├── infrastructure/              # Repositorio de datos Supabase
│   │   ├── ui/                          # Componentes de presentación, modales e interacciones
│   │   └── index.ts                     # Barrel export del módulo
│   │
│   ├── forge/                           # Contexto de Forja y Alquimia de Runas
│   │   ├── domain/                      # Matriz de fusión determinista y reglas de rareza
│   │   ├── application/                 # Servicio orquestador de síntesis de cartas
│   │   ├── infrastructure/              # Cliente Gemini AI y firmador criptográfico Ed25519
│   │   ├── ui/                          # Altar 3D Three.js, slots, drawer y máquina de estados
│   │   └── index.ts                     # Barrel export del módulo
│   │
│   └── wallet/                          # Contexto de Billetera y Conexión Web3
│       ├── infrastructure/              # Adaptador para Stellar Wallets Kit
│       ├── ui/                          # Componentes de botón y proveedor de contexto
│       └── index.ts                     # Barrel export del módulo
│
├── shared/                              # Elementos Transversales Reutilizables
│   ├── infrastructure/                  # Clientes base (Supabase client/admin, Stellar RPC)
│   ├── ui/
│   │   ├── icons/Elements.tsx           # Iconografía elemental SVG pura
│   │   ├── navbar/TopNav.tsx            # Header responsive y navegación mobile-first
│   │   └── providers/AppProviders.tsx   # Envoltorio de estado y contextos de la app
│   └── index.ts
│
├── types/                               # Definición de tipos generados (DB Supabase, JSR)
├── index.ts                             # Exportación raíz de la librería SDK
├── stellar.ts                           # Configuración de red para el SDK
└── wallet/                              # Distribución del paquete Web3 para Deno
```

---

## 3. Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**:
   - Cada componente o función tiene una única razón para cambiar.
   - `forge-rules.ts` solo calcula matemáticas y afinidades elementales.
   - `gemini-client.ts` solo se comunica con la IA para la parte narrativa/lore.
   - `oracle-crypto.ts` solo maneja la construcción del payload canónico y la firma Ed25519.
2. **Open/Closed Principle (OCP)**:
   - La matriz de elementos (`HYBRID_TABLE`) y los rangos de presupuestos (`STAT_BUDGET`) son extensibles sin alterar el orquestador de forja.
3. **Liskov Substitution Principle (LSP)**:
   - Las cartas base y las cartas forjadas implementan la interfaz canónica `Card` / `CardData`, permitiendo que cualquier componente visual las renderice indistintamente.
4. **Interface Segregation Principle (ISP)**:
   - Los componentes de UI solo reciben las props y callbacks estrictamente requeridos (evitando prop drilling masivo).
5. **Dependency Inversion Principle (DIP)**:
   - Las reglas de negocio no dependen de Supabase ni de Next.js; la infraestructura implementa las interfaces requeridas por los casos de uso.

---

## 4. Estándares Técnicos y Garantía de Calidad

* **Node.js**: `>= 22`
* **Framework**: Next.js 16 (Turbopack)
* **TypeScript**: 5.9 (Modo estricto, `noEmit`, cero uso de `any`)
* **Linter**: ESLint 9 con reglas oficiales de Next.js y React 19 (`react-hooks/refs`, `react-hooks/set-state-in-effect`)
* **Tests**: Vitest para pruebas unitarias de dominio y servicios
* **WebGL**: Three.js optimizado con delta de tiempo nativo y limpieza total de memoria GPU al desmontar
* **Deno**: Verificación cruzada mediante `npm run wallet:typecheck` sobre `src/index.ts`
