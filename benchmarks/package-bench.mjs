import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { validateRuntimeProofEvidence } from '../dist/index.js';

const outIndex = process.argv.indexOf('--out');
const out = outIndex >= 0 ? process.argv[outIndex + 1] : '';
const casesIndex = process.argv.indexOf('--cases');
const caseCount = casesIndex >= 0 ? Number(process.argv[casesIndex + 1]) : 5000;
const started = performance.now();
let passed = 0;

for (let index = 0; index < caseCount; index++) {
  const result = validateRuntimeProofEvidence({
    runtimeProofCapsule: {
      mode: index % 3 === 0 ? 'isolated-fixture' : index % 3 === 1 ? 'app-shell-fixture' : 'full-app-replay',
      command: `proof-${index}`,
      probeId: `probe-${index}`,
      evidenceHash: `evidence-${index}`,
      signals: ['html-event-handler-runtime'],
      telemetry: { hash: `telemetry-${index}`, cumulativeLayoutShift: 0 }
    }
  }, {
    requiredSignals: ['html-event-handler-runtime'],
    requireRuntimeProofCapsule: true,
    requireTelemetryHash: true
  });
  if (result.ok) passed += 1;
}

const elapsedMs = performance.now() - started;
const result = {
  ok: passed === caseCount,
  package: '@shapeshift-labs/frontier-runtime-proof',
  scenario: `runtime-proof-validate-${caseCount}`,
  elapsedMs,
  caseCount,
  passed
};

if (out) {
  const outPath = path.resolve(out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
}

console.log(JSON.stringify(result, null, 2));
