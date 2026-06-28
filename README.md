# @shapeshift-labs/frontier-runtime-proof

Runtime-neutral proof capsule, telemetry, and admission primitives for Frontier merge and review evidence.

`frontier-runtime-proof` does not launch browsers, run Playwright, read files, inspect Git, or decide whether code is semantically equivalent. It defines the small evidence contract that higher packages can use after a runtime probe has already run: what fixture mode was used, which command/probe produced the evidence, which source-bound signals were observed, and which telemetry artifacts make the proof reviewable.

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

## Boundary

This package owns only the runtime-neutral proof record and admission helpers. Browser execution belongs in adapters such as Playwright harnesses, app-specific test runners, or coordinator packages. Semantic merge packages can depend on this package without importing browser automation or app runtime code.
