import assert from 'node:assert';
import {
  createRuntimeProofCapsule,
  hashRuntimeProofValue,
  normalizeRuntimeProofCapsule,
  runtimeEvidenceMetadataFromProof,
  runtimeProofSignals,
  stableRuntimeProofJson,
  validateRuntimeProofEvidence
} from '../dist/index.js';

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

console.log('frontier runtime proof smoke passed');
