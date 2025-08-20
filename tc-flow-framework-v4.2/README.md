# TC Flow Framework (v4.2)

- HTML visual report (report.html) maintained; JSON/Markdown also emitted.
- Cross-step connectivity via templates `${steps.<id>.<field>}` and `${vars.<name>}`.
- Exports: map certain fields from a step result to global `vars`.
- State in/out files to carry context across runs.
- Catalog + Manifest generators to produce user-friendly documentation.

## Install
```bash
npm install
npm run prepare
```

## Run examples
```bash
npm run build
node dist/core/flow.js --flow flows/test-flow/developer/dev-flow.json
# resume or startAt
node dist/core/flow.js --flow flows/test-flow/developer/dev-flow.json --startAt saveAsMD
# state carry-over
node dist/core/flow.js --flow flows/test-flow/developer/dev-flow.json --stateOut .cache/state.json
node dist/core/flow.js --flow flows/test-flow/developer/dev-flow.json --stateIn .cache/state.json
```

## Docs (inputs + catalog)
```bash
# 1) generate/update catalog.json
npm run catalog
# 2) generate manifest and combined doc
npm run manifest
# or both in one step
npm run docs
```

Artifacts will be written to:
- `catalog.json`
- `flow-manifest.json`
- `docs/steps-manifest.md`
- `docs/inputs-and-catalog.md`
