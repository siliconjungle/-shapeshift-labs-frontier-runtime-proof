# @shapeshift-labs/frontier-runtime-proof

Runtime-neutral proof capsule, telemetry, and admission primitives for Frontier merge and review evidence.

The root `frontier-runtime-proof` import does not launch browsers, run Playwright, read files, inspect Git, or decide whether code is semantically equivalent. It defines the small evidence contract that higher packages can use after a runtime probe has already run: what fixture mode was used, which command/probe produced the evidence, which source-bound signals were observed, and which telemetry artifacts make the proof reviewable. The optional `./playwright` subpath can turn an already-owned Playwright `page` into that capsule without adding Playwright to the root dependency graph.

## Install

```sh
npm install @shapeshift-labs/frontier-runtime-proof
```

## Model

A runtime proof capsule is a normalized record around a runtime check:

- `isolated-fixture`: a micro-slice fixture for a component, HTML/CSS fragment, or behavior boundary.
- `app-shell-fixture`: a route/app shell with dependencies stubbed or fixture-backed.
- `full-app-replay`: a real app replay under declared state and environment conditions.

`environment-blocked` is intentionally a blocked mode, not a pass. Login walls, missing secrets, unavailable services, and fixture setup failures should fail closed.

## API

```js
import {
  runtimeEvidenceMetadataFromProof,
  validateRuntimeProofEvidence
} from '@shapeshift-labs/frontier-runtime-proof';

const proof = {
  runtimeProofCapsule: {
    mode: 'isolated-fixture',
    status: 'passed',
    command: 'playwright test runtime-proof.spec.ts',
    probeId: 'html:event-handler-runtime-boundary:onclick',
    evidenceHash: 'runtime-evidence-hash',
    signals: ['html-event-handler-runtime'],
    browser: { name: 'chromium', version: 'stable' },
    viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
    telemetry: {
      hash: 'telemetry-hash',
      domSnapshotHash: 'dom-hash',
      computedStyleHash: 'style-hash',
      layoutSnapshotHash: 'layout-hash',
      eventTraceHash: 'events-hash',
      cumulativeLayoutShift: 0
    }
  }
};

const metadata = runtimeEvidenceMetadataFromProof(proof, {
  requiredSignals: ['html-event-handler-runtime'],
  requireRuntimeProofCapsule: true,
  requireTelemetryHash: true,
  maxCumulativeLayoutShift: 0.01
});

const validation = validateRuntimeProofEvidence(proof, {
  requiredSignals: ['html-event-handler-runtime']
});
```

The return value is machine-checkable. Missing commands, probes, evidence hashes, required signals, telemetry hashes, failing statuses, blocked environments, and excessive cumulative layout shift all produce explicit reason codes.

## Source-Bound Proofs

Semantic merge callers usually need more than "a browser test passed." They need proof that the runtime evidence applies to the exact source versions being merged. The source-bound helpers normalize `base` / `worker` / `head` / `output` hashes, bind them to the runtime capsule, and reject broad proof claims.

```js
import {
  createSourceBoundRuntimeProof,
  validateSourceBoundRuntimeProof
} from '@shapeshift-labs/frontier-runtime-proof';

const sourceProof = createSourceBoundRuntimeProof({
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  baseSourceHash: 'source:base',
  workerSourceHash: 'source:worker',
  headSourceHash: 'source:head',
  outputSourceHash: 'source:output',
  runtimeProofCapsule: proof.runtimeProofCapsule
});

const admission = validateSourceBoundRuntimeProof(sourceProof, {
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  sourceHashes: {
    base: 'source:base',
    worker: 'source:worker',
    head: 'source:head',
    output: 'source:output'
  },
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  requiredSignals: ['html-event-handler-runtime']
});
```

The proof object keeps `autoMergeClaim`, `semanticEquivalenceClaim`, `runtimeEquivalenceClaim`, `renderEquivalenceClaim`, `browserRuntimeEquivalenceClaim`, and `browserRenderEquivalenceClaim` false. Downstream merge packages can admit a specific boundary after checking the source hashes, reason code, boundary key, runtime signals, and telemetry constraints.

## Boundary

This package owns only the runtime-neutral proof record and admission helpers. Browser execution belongs in adapters such as Playwright harnesses, app-specific test runners, or coordinator packages. Semantic merge packages can depend on this package without importing browser automation or app runtime code.

## Optional Playwright Helper

The root import stays runtime-neutral. The optional `./playwright` subpath accepts a Playwright-compatible `page` object structurally, so Playwright remains an app/test-runner dependency rather than a root package dependency.

```js
import { capturePlaywrightRuntimeProof } from '@shapeshift-labs/frontier-runtime-proof/playwright';

const proof = await capturePlaywrightRuntimeProof(page, {
  mode: 'isolated-fixture',
  command: 'playwright test runtime-proof.spec.ts',
  probeId: 'html-css:runtime-proof:#root',
  signals: ['html-css-browser-runtime'],
  sourcePath: 'src/view.html',
  sourceHash: 'source-hash',
  cssHash: 'css-hash',
  selectors: ['#root'],
  screenshot: true,
  maxCumulativeLayoutShift: 0.01,
  async exercise(page) {
    await page.getByRole('button', { name: 'Save' }).click();
  }
});
```

The helper installs bounded event and layout-shift probes, captures DOM, computed-style, layout, event-trace, optional screenshot, browser, viewport, and telemetry hashes, then returns a normal `runtimeProofCapsule`. If the page cannot be prepared or captured, it returns an `environment-blocked` proof that fails closed.
