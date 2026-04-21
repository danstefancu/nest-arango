# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build          # Full build (clean + ESM + CJS + CLI)
npm run build:esm      # ES modules only
npm run build:cjs      # CommonJS only
npm run clean          # Remove dist/lib

# Test
npm test               # Full test suite (runs from tests/ with --runInBand)

# Single test by name
cd tests && npx jest --config ./jest.json --runInBand --testNamePattern="<test name>"
```

Tests live in `tests/core.tests.ts` and spin up an ArangoDB testcontainer automatically — no manual instance needed. `tests/tsconfig.json` provides the IDE and ts-jest TypeScript config for the test directory.

## Architecture

This is a NestJS dynamic module that integrates ArangoDB via ArangoJS. It follows the standard NestJS dual-module pattern for library design.

### Module Hierarchy

- **`ArangoModule`** — public API; `forRoot()`/`forRootAsync()` establishes the DB connection, `forFeature()`/`forFeatureAsync()` registers entity collections and creates their repositories
- **`ArangoCoreModule`** — global module; owns the `Database` instance and `ArangoManager` provider; imported once per application

### Repository Layer

`ArangoRepository<T>` is the generic base; `ArangoEdgeRepository<T>` extends it with edge-specific methods (`edges()`, `inEdges()`, `outEdges()`). `createArangoProviders()` inspects the entity's metadata to decide which class to instantiate.

All repository methods accept an optional `options` object with `{ transaction?, emitEvents? }`. Pagination is via `{ offset?, limit? }` with `fullCount` returned for total-count queries.

### Entity / Collection Binding

Entities extend `ArangoDocument` (or `ArangoDocumentEdge` for edges) and are decorated with `@Collection('collection-name')`. Metadata is stored in global singletons — `TypeMetadataStorage` and `EventListenerMetadataStorage` — so it survives NestJS module teardown.

### Event Listeners

Lifecycle hooks are method decorators on entity classes: `@BeforeSave`, `@AfterSave`, `@BeforeUpdate`, `@AfterUpdate`, `@BeforeReplace`, `@AfterReplace`, `@AfterRemove`. The `EventListenerContext` passed to each handler exposes `oldEntity`, `newEntity`, `transaction`, `repository`, and `database`.

Bulk methods (`saveAll`, `updateAll`, `replaceAll`, `removeAll`) invoke event listeners **sequentially** per item (not in parallel) to avoid race conditions on the shared `context` object.

### ArangoEdgeRepository

`edges()` uses `collection._edges(..., 'any')` internally because `arangojs.collection.edges()` omits the `direction` parameter which ArangoDB requires. `inEdges()` and `outEdges()` use the arangojs helpers directly.

### AQL Utilities

Helper functions in `src/utils/` (`generateFilters`, `aqlPart`, `aqlConcat`, `documentAQLBuilder`) build AQL query fragments for nested-object filtering used by `findOneBy` / `findManyBy`.

### CLI / Migrations

`src/cli/` provides a standalone migration tool invoked via the built CLI binary. Commands: `--create <name>`, `--run`, `--revert`. Migrations implement `{ up(db), down(db) }` and are resolved in timestamp order. Requires a `nest-arango.config.ts` in the consuming project root.

### Dual Build

The package ships both ESM (`dist/esm/`) and CJS (`dist/cjs/`) with `exports` in `package.json` pointing each condition to the correct build. The CLI is a separate CJS entry point.
