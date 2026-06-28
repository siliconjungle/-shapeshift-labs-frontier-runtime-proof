import assert from 'node:assert';
import {
  FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND,
  createRuntimeProofProbeSpec,
  createSourceBoundRuntimeProof,
  createRuntimeProofCapsule,
  hashRuntimeProofValue,
  normalizeRuntimeProofCapsule,
  runtimeEvidenceMetadataFromProof,
  runtimeProofSourceHashes,
  runtimeProofSignals,
  runtimeProofTelemetrySummary,
  stableRuntimeProofJson,
  validateRuntimeProofAgainstProbe,
  validateSourceBoundRuntimeProof,
  validateRuntimeProofEvidence
} from '../dist/index.js';
import {
  capturePlaywrightRuntimeProof,
  createEnvironmentBlockedPlaywrightRuntimeProof
} from '../dist/playwright.js';

const proof = {
  kind: 'html-source-bound-runtime-boundary-proof',
  status: 'passed',
  sourcePath: 'src/view.html',
  runtimeProofCapsule: {
    mode: 'isolated-fixture',
    status: 'passed',
    command: 'playwright test runtime-proof.spec.ts',
    probeId: 'html:event-handler-runtime-boundary:onclick',
    evidenceHash: 'runtime-evidence-hash',
    signals: ['html-event-handler-runtime'],
    browser: { name: 'chromium', version: 'stable' },
    viewport: { width: 390, height: 844, deviceScaleFactor: 2 },
    artifacts: { sourceHash: 'source-artifact', bundleHash: 'bundle-artifact' },
    telemetry: {
      hash: 'telemetry-hash',
      domSnapshotHash: 'dom-hash',
      computedStyleHash: 'style-hash',
      layoutSnapshotHash: 'layout-hash',
      eventTraceHash: 'events-hash',
      screenshotHash: 'screenshot-hash',
      cumulativeLayoutShift: 0
    }
  }
};

const capsule = normalizeRuntimeProofCapsule(proof);
assert.equal(capsule.valid, true);
assert.equal(capsule.mode, 'isolated-fixture');
assert.equal(capsule.status, 'passed');
assert.equal(capsule.browserName, 'chromium');
assert.equal(capsule.browserVersion, 'stable');
assert.equal(capsule.viewport.width, 390);
assert.equal(capsule.telemetryHash, 'telemetry-hash');
assert.equal(capsule.domSnapshotHash, 'dom-hash');
assert.equal(capsule.computedStyleHash, 'style-hash');
assert.equal(capsule.layoutSnapshotHash, 'layout-hash');
assert.equal(capsule.eventTraceHash, 'events-hash');
assert.equal(capsule.cumulativeLayoutShift, 0);
assert.equal(typeof capsule.hash, 'string');

const metadata = runtimeEvidenceMetadataFromProof(proof, {
  requiredSignals: ['html-event-handler-runtime'],
  requireRuntimeProofCapsule: true,
  requireTelemetryHash: true,
  maxCumulativeLayoutShift: 0.01
});
assert.ok(metadata);
assert.equal(metadata.command, 'playwright test runtime-proof.spec.ts');
assert.equal(metadata.probeId, 'html:event-handler-runtime-boundary:onclick');
assert.equal(metadata.evidenceHash, 'runtime-evidence-hash');
assert.deepEqual(metadata.requiredSignals, ['html-event-handler-runtime']);
assert.equal(metadata.capsule.hash, capsule.hash);

const validation = validateRuntimeProofEvidence(proof, { requiredSignals: ['html-event-handler-runtime'] });
assert.equal(validation.ok, true);

const sourceHashes = {
  base: 'source:base',
  worker: 'source:worker',
  head: 'source:head',
  output: 'source:output'
};
const sourceBoundProof = createSourceBoundRuntimeProof({
  id: 'proof_source_bound_html_event',
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  baseSourceHash: sourceHashes.base,
  workerSourceHash: sourceHashes.worker,
  headSourceHash: sourceHashes.head,
  outputSourceHash: sourceHashes.output,
  runtimeProofCapsule: proof.runtimeProofCapsule
}, {
  requireTelemetryHash: true,
  maxCumulativeLayoutShift: 0.01
});
assert.equal(sourceBoundProof.kind, FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND);
assert.equal(sourceBoundProof.status, 'passed');
assert.equal(sourceBoundProof.runtimeEvidenceBound, true);
assert.equal(sourceBoundProof.autoMergeClaim, false);
assert.equal(sourceBoundProof.semanticEquivalenceClaim, false);
assert.equal(sourceBoundProof.browserRuntimeEquivalenceClaim, false);
assert.deepEqual(runtimeProofSourceHashes(sourceBoundProof), sourceHashes);
assert.equal(sourceBoundProof.runtimeProofCapsule.hash, capsule.hash);
assert.equal(typeof sourceBoundProof.hash, 'string');

const sourceBoundValidation = validateSourceBoundRuntimeProof(sourceBoundProof, {
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  sourceHashes,
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  requireTelemetryHash: true,
  maxCumulativeLayoutShift: 0.01
});
assert.equal(sourceBoundValidation.ok, true);
assert.deepEqual(sourceBoundValidation.sourceHashes, sourceHashes);

const telemetrySummary = runtimeProofTelemetrySummary(sourceBoundProof);
assert.equal(telemetrySummary.hasTelemetryHash, true);
assert.equal(telemetrySummary.hasDomSnapshotHash, true);
assert.equal(telemetrySummary.hasComputedStyleHash, true);
assert.equal(telemetrySummary.hasLayoutSnapshotHash, true);
assert.equal(telemetrySummary.hasEventTraceHash, true);
assert.equal(telemetrySummary.hasScreenshotHash, true);
assert.equal(telemetrySummary.cumulativeLayoutShift, 0);
assert.equal(typeof telemetrySummary.hash, 'string');

const probeSpec = createRuntimeProofProbeSpec({
  id: 'html-event-handler-runtime-probe',
  mode: 'isolated-fixture',
  command: 'playwright test runtime-proof.spec.ts',
  probeId: 'html:event-handler-runtime-boundary:onclick',
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  sourceHashes,
  requireTelemetryHash: true,
  requireDomSnapshotHash: true,
  requireComputedStyleHash: true,
  requireLayoutSnapshotHash: true,
  requireEventTraceHash: true,
  requireScreenshotHash: true,
  maxCumulativeLayoutShift: 0.01,
  requireSourceBoundProof: true
});
assert.equal(probeSpec.kind, 'frontier.runtime-proof.probe-spec');
assert.equal(probeSpec.requireRuntimeProofCapsule, true);
assert.equal(typeof probeSpec.hash, 'string');

const probeValidation = validateRuntimeProofAgainstProbe(sourceBoundProof, probeSpec);
assert.equal(probeValidation.ok, true);
assert.equal(probeValidation.telemetry.hasEventTraceHash, true);
assert.equal(probeValidation.sourceBoundValidation.ok, true);

const missingEventProbeValidation = validateRuntimeProofAgainstProbe({
  ...sourceBoundProof,
  runtimeProofCapsule: {
    ...sourceBoundProof.runtimeProofCapsule,
    eventTraceHash: undefined
  }
}, probeSpec);
assert.equal(missingEventProbeValidation.ok, false);
assert.equal(missingEventProbeValidation.reasonCodes.includes('runtime-proof-event-trace-hash-missing'), true);

const wrongModeProbeValidation = validateRuntimeProofAgainstProbe(sourceBoundProof, {
  ...probeSpec,
  mode: 'full-app-replay'
});
assert.equal(wrongModeProbeValidation.ok, false);
assert.equal(wrongModeProbeValidation.reasonCodes.includes('runtime-proof-mode-mismatch'), true);

const staleSourceBoundValidation = validateSourceBoundRuntimeProof({
  ...sourceBoundProof,
  outputSourceHash: 'source:stale'
}, {
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  sourceHashes,
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  requiredSignals: ['html-event-handler-runtime']
});
assert.equal(staleSourceBoundValidation.ok, false);
assert.equal(staleSourceBoundValidation.reasonCodes.includes('source-bound-runtime-proof-source-hash-mismatch'), true);

const broadClaimValidation = validateSourceBoundRuntimeProof({
  ...sourceBoundProof,
  browserRuntimeEquivalenceClaim: true
}, {
  sourceHashes,
  requiredSignals: ['html-event-handler-runtime']
});
assert.equal(broadClaimValidation.ok, false);
assert.equal(broadClaimValidation.reasonCodes.includes('source-bound-runtime-proof-broad-claim-present'), true);

const sourceTextHashes = runtimeProofSourceHashes({
  sourceTexts: { base: '<main />', worker: '<main data-worker />', head: '<main data-head />', output: '<main data-worker data-head />' }
}, hashRuntimeProofValue);
assert.equal(sourceTextHashes.base, hashRuntimeProofValue('<main />'));
assert.equal(sourceTextHashes.output, hashRuntimeProofValue('<main data-worker data-head />'));

const directCapsule = createRuntimeProofCapsule({
  mode: 'app-shell-fixture',
  command: 'npm run proof',
  probeId: 'app:route:/settings',
  evidenceHash: 'app-shell-evidence',
  signals: { 'app-shell-render-runtime': 'passed' }
});
assert.equal(directCapsule.mode, 'app-shell-fixture');
assert.deepEqual(directCapsule.signals, ['app-shell-render-runtime']);

assert.deepEqual(runtimeProofSignals(proof), ['html-event-handler-runtime']);

const missingSignal = validateRuntimeProofEvidence(proof, { requiredSignals: ['css-cascade-runtime'] });
assert.equal(missingSignal.ok, false);
assert.equal(missingSignal.reasonCodes.includes('runtime-proof-required-signal-missing'), true);
assert.equal(runtimeEvidenceMetadataFromProof(proof, { requiredSignals: ['css-cascade-runtime'] }), undefined);

const blocked = validateRuntimeProofEvidence({
  runtimeProofCapsule: {
    mode: 'environment-blocked',
    status: 'blocked',
    command: 'playwright test runtime-proof.spec.ts',
    probeId: 'blocked',
    evidenceHash: 'blocked-evidence',
    signals: ['html-event-handler-runtime']
  }
});
assert.equal(blocked.ok, false);
assert.equal(blocked.reasonCodes.includes('runtime-proof-environment-blocked'), true);

const failed = validateRuntimeProofEvidence({
  runtimeProofCapsule: {
    mode: 'isolated-fixture',
    status: 'failed',
    command: 'playwright test runtime-proof.spec.ts',
    probeId: 'failed',
    evidenceHash: 'failed-evidence',
    signals: ['html-event-handler-runtime']
  }
});
assert.equal(failed.ok, false);
assert.equal(failed.reasonCodes.includes('runtime-proof-capsule-not-passed'), true);

const shifted = validateRuntimeProofEvidence({
  runtimeProofCapsule: {
    mode: 'full-app-replay',
    command: 'playwright test layout.spec.ts',
    probeId: 'layout',
    evidenceHash: 'layout-evidence',
    signals: ['layout-runtime'],
    telemetry: { hash: 'layout-telemetry', cumulativeLayoutShift: 0.2 }
  }
}, { maxCumulativeLayoutShift: 0.05 });
assert.equal(shifted.ok, false);
assert.equal(shifted.reasonCodes.includes('runtime-proof-cumulative-layout-shift-exceeded'), true);

assert.equal(
  stableRuntimeProofJson({ b: 2, a: 1, c: undefined }),
  '{"a":1,"b":2}'
);
assert.equal(
  hashRuntimeProofValue({ a: 1, b: 2 }),
  hashRuntimeProofValue({ b: 2, a: 1 })
);

const fakePage = {
  viewportSize() {
    return { width: 800, height: 600 };
  },
  context() {
    return {
      browser() {
        return {
          version() {
            return 'stable';
          },
          browserType() {
            return {
              name() {
                return 'chromium';
              }
            };
          }
        };
      }
    };
  },
  async screenshot() {
    return new Uint8Array([1, 2, 3, 4]);
  },
  async evaluate(_pageFunction, arg) {
    if (arg?.traceKind === 'frontier.runtime-proof.playwright.trace.v1') return undefined;
    assert.equal(arg.captureKind, 'frontier.runtime-proof.playwright.capture.v1');
    assert.deepEqual(arg.selectors, ['#root']);
    return {
      environment: {
        viewport: { width: 800, height: 600 },
        deviceScaleFactor: 1,
        colorScheme: 'light',
        reducedMotion: 'no-preference'
      },
      domSnapshot: [{ path: '#root', tag: 'main', attributes: [['id', 'root']] }],
      computedStyleSnapshot: [{ path: '#root', properties: { display: 'block', color: 'rgb(0, 0, 0)' } }],
      layoutSnapshot: [{ path: '#root', rect: { x: 0, y: 0, width: 320, height: 120 } }],
      eventTrace: [{ sequence: 0, type: 'click', target: '#root' }],
      layoutShift: { cumulativeLayoutShift: 0, entries: [] }
    };
  }
};

const playwrightProof = await capturePlaywrightRuntimeProof(fakePage, {
  mode: 'isolated-fixture',
  command: 'playwright test runtime-proof.spec.ts',
  probeId: 'html-css:runtime-proof:#root',
  signals: ['html-css-browser-runtime'],
  sourcePath: 'src/view.html',
  sourceHash: 'source-hash',
  cssHash: 'css-hash',
  selectors: ['#root'],
  screenshot: true,
  maxCumulativeLayoutShift: 0.01
});
assert.equal(playwrightProof.status, 'passed');
assert.equal(playwrightProof.runtimeProofCapsule.mode, 'isolated-fixture');
assert.equal(playwrightProof.runtimeProofCapsule.browserName, 'chromium');
assert.equal(playwrightProof.runtimeProofCapsule.viewport.width, 800);
assert.equal(playwrightProof.runtimeProofCapsule.telemetryHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.runtimeProofCapsule.domSnapshotHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.runtimeProofCapsule.computedStyleHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.runtimeProofCapsule.layoutSnapshotHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.runtimeProofCapsule.eventTraceHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.runtimeProofCapsule.screenshotHash.startsWith('fnv1a32:'), true);
assert.equal(playwrightProof.validation.ok, true);

const blockedPlaywrightProof = await capturePlaywrightRuntimeProof({
  async evaluate() {
    throw new Error('login wall');
  }
}, {
  command: 'playwright test runtime-proof.spec.ts',
  probeId: 'html-css:runtime-proof:blocked',
  signals: ['html-css-browser-runtime']
});
assert.equal(blockedPlaywrightProof.status, 'blocked');
assert.equal(blockedPlaywrightProof.validation.ok, false);
assert.equal(blockedPlaywrightProof.validation.reasonCodes.includes('runtime-proof-environment-blocked'), true);

const directBlockedProof = createEnvironmentBlockedPlaywrightRuntimeProof({
  command: 'playwright test runtime-proof.spec.ts',
  probeId: 'html-css:runtime-proof:blocked-direct',
  signals: ['html-css-browser-runtime']
}, new Error('fixture setup failed'));
assert.equal(directBlockedProof.status, 'blocked');
assert.equal(directBlockedProof.error.message, 'fixture setup failed');

console.log('frontier runtime proof smoke passed');
