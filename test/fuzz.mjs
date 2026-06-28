import assert from 'node:assert';
import {
  FRONTIER_RUNTIME_PROOF_MODES,
  createSourceBoundRuntimeProof,
  hashRuntimeProofValue,
  stableRuntimeProofJson,
  validateSourceBoundRuntimeProof,
  validateRuntimeProofEvidence
} from '../dist/index.js';

const args = new Set(process.argv.slice(2));
const casesArgIndex = process.argv.indexOf('--cases');
const cases = casesArgIndex >= 0 ? Number(process.argv[casesArgIndex + 1]) : 250;
const seedArgIndex = process.argv.indexOf('--seed');
let seed = seedArgIndex >= 0 ? Number(process.argv[seedArgIndex + 1]) : 0x7197cafe;

for (let run = 0; run < cases; run++) {
  const requiredSignal = `runtime-signal-${randomInt(8)}`;
  const hasRequiredSignal = random() < 0.75;
  const mode = random() < 0.08 ? 'environment-blocked' : randomPick(FRONTIER_RUNTIME_PROOF_MODES);
  const status = mode === 'environment-blocked' ? 'blocked' : random() < 0.9 ? 'passed' : randomPick(['failed', 'blocked', 'skipped']);
  const proof = {
    runtimeProofCapsule: {
      mode,
      status,
      command: random() < 0.95 ? `proof-command-${run}` : undefined,
      probeId: random() < 0.95 ? `probe-${run}` : undefined,
      evidenceHash: random() < 0.95 ? `evidence-${run}` : undefined,
      signals: hasRequiredSignal ? [requiredSignal, `extra-${randomInt(5)}`] : [`other-${randomInt(5)}`],
      telemetry: {
        hash: `telemetry-${run}`,
        cumulativeLayoutShift: random() < 0.9 ? random() * 0.02 : 0.2 + random()
      }
    }
  };
  const validation = validateRuntimeProofEvidence(proof, {
    requiredSignals: [requiredSignal],
    requireRuntimeProofCapsule: true,
    requireTelemetryHash: true,
    maxCumulativeLayoutShift: 0.1
  });
  const shouldPass =
    mode !== 'environment-blocked' &&
    status === 'passed' &&
    proof.runtimeProofCapsule.command !== undefined &&
    proof.runtimeProofCapsule.probeId !== undefined &&
    proof.runtimeProofCapsule.evidenceHash !== undefined &&
    hasRequiredSignal &&
    proof.runtimeProofCapsule.telemetry.cumulativeLayoutShift <= 0.1;
  assert.equal(validation.ok, shouldPass, `validation mismatch for run ${run}`);

  const left = { z: run, a: proof.runtimeProofCapsule.signals, n: randomInt(100) };
  const right = { n: left.n, a: proof.runtimeProofCapsule.signals, z: run };
  assert.equal(stableRuntimeProofJson(left), stableRuntimeProofJson(right));
  assert.equal(hashRuntimeProofValue(left), hashRuntimeProofValue(right));

  const sourceHashes = {
    base: `source-base-${run}`,
    worker: `source-worker-${run}`,
    head: `source-head-${run}`,
    output: `source-output-${run}`
  };
  if (shouldPass) {
    const sourceBoundProof = createSourceBoundRuntimeProof({
      sourcePath: `src/view-${run}.html`,
      reasonCode: requiredSignal,
      boundaryKey: `boundary-${randomInt(4)}`,
      requiredSignals: [requiredSignal],
      baseSourceHash: sourceHashes.base,
      workerSourceHash: sourceHashes.worker,
      headSourceHash: sourceHashes.head,
      outputSourceHash: sourceHashes.output,
      runtimeProofCapsule: proof.runtimeProofCapsule
    }, {
      maxCumulativeLayoutShift: 0.1
    });
    const staleSourceHash = random() < 0.2;
    const broadClaim = random() < 0.2;
    const sourceValidation = validateSourceBoundRuntimeProof({
      ...sourceBoundProof,
      outputSourceHash: staleSourceHash ? `stale-${run}` : sourceHashes.output,
      autoMergeClaim: broadClaim
    }, {
      sourcePath: `src/view-${run}.html`,
      reasonCode: requiredSignal,
      sourceHashes,
      requiredSourceRoles: ['base', 'worker', 'head', 'output'],
      requiredSignals: [requiredSignal],
      maxCumulativeLayoutShift: 0.1
    });
    assert.equal(sourceValidation.ok, !staleSourceHash && !broadClaim, `source-bound validation mismatch for run ${run}`);
  }
}

if (args.has('--json')) {
  console.log(JSON.stringify({ ok: true, cases, seed }, null, 2));
} else {
  console.log(`frontier runtime proof fuzz passed (${cases} cases)`);
}

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

function randomInt(max) {
  return Math.floor(random() * max);
}

function randomPick(values) {
  return values[randomInt(values.length)];
}
