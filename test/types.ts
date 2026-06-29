import {
  createRuntimeProofProbeSpec,
  createSourceBoundRuntimeProof,
  createRuntimeProofCapsule,
  runtimeProofTelemetrySummary,
  runtimeProofSourceHashes,
  runtimeEvidenceMetadataFromProof,
  validateRuntimeProofAgainstProbe,
  validateSourceBoundRuntimeProof,
  validateRuntimeProofEvidence,
  type FrontierRuntimeProofSourceHashes,
  type FrontierRuntimeEvidenceMetadata,
  type FrontierRuntimeProofCapsule,
  type FrontierRuntimeProofMode,
  type FrontierRuntimeProofProbeSpec,
  type FrontierRuntimeProofProbeValidation,
  type FrontierRuntimeProofTelemetrySummary,
  type FrontierRuntimeProofValidation,
  type FrontierSourceBoundRuntimeProof
} from '../dist/index.js';
import {
  capturePlaywrightRuntimeProof,
  type FrontierPlaywrightLikePage,
  type FrontierPlaywrightRuntimeProof
} from '../dist/playwright.js';

const mode: FrontierRuntimeProofMode = 'isolated-fixture';
const capsule: FrontierRuntimeProofCapsule = createRuntimeProofCapsule({
  mode,
  command: 'playwright test proof.spec.ts',
  probeId: 'probe',
  evidenceHash: 'evidence',
  signals: ['html-event-handler-runtime']
});

const metadata: FrontierRuntimeEvidenceMetadata | undefined = runtimeEvidenceMetadataFromProof({
  runtimeProofCapsule: capsule
}, {
  requiredSignals: ['html-event-handler-runtime']
});

const validation: FrontierRuntimeProofValidation = validateRuntimeProofEvidence({
  runtimeProofCapsule: capsule
});

if (metadata && validation.ok && validation.metadata.capsule) {
  metadata.signals satisfies string[];
  validation.metadata.capsule.hash satisfies string;
}

const sourceBoundProof: FrontierSourceBoundRuntimeProof = createSourceBoundRuntimeProof({
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  baseSourceHash: 'source:base',
  workerSourceHash: 'source:worker',
  headSourceHash: 'source:head',
  outputSourceHash: 'source:output',
  runtimeProofCapsule: capsule
});

const sourceHashes: FrontierRuntimeProofSourceHashes = runtimeProofSourceHashes(sourceBoundProof);
const sourceBoundValidation = validateSourceBoundRuntimeProof(sourceBoundProof, {
  sourcePath: 'src/view.html',
  reasonCode: ['html-event-handler-runtime-boundary'],
  boundaryKey: ['button:onClick'],
  sourceHashes,
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  requiredSignals: ['html-event-handler-runtime']
});

if (sourceBoundValidation.ok) {
  sourceBoundValidation.metadata.probeId satisfies string;
  sourceBoundValidation.sourceHashes.output satisfies string | undefined;
}

const telemetry: FrontierRuntimeProofTelemetrySummary = runtimeProofTelemetrySummary(sourceBoundProof);
telemetry.hasEventTraceHash satisfies boolean;
telemetry.hasAccessibilitySnapshotHash satisfies boolean;
telemetry.hasFocusSnapshotHash satisfies boolean;

const probeSpec: FrontierRuntimeProofProbeSpec = createRuntimeProofProbeSpec({
  id: 'probe',
  mode: 'isolated-fixture',
  sourcePath: 'src/view.html',
  reasonCode: 'html-event-handler-runtime-boundary',
  boundaryKey: 'button:onClick',
  requiredSignals: ['html-event-handler-runtime'],
  requiredSourceRoles: ['base', 'worker', 'head', 'output'],
  sourceHashes,
  requireAccessibilitySnapshotHash: true,
  requireFocusSnapshotHash: true,
  requireTelemetryHash: false,
  requireSourceBoundProof: true
});

const probeValidation: FrontierRuntimeProofProbeValidation = validateRuntimeProofAgainstProbe(sourceBoundProof, probeSpec);
if (probeValidation.ok) {
  probeValidation.probe.hash satisfies string;
  probeValidation.telemetry.hash satisfies string;
}

const page: FrontierPlaywrightLikePage = {
  async evaluate<Result, Arg>(_pageFunction: (arg: Arg) => Result | Promise<Result>, _arg: Arg): Promise<Result> {
    return undefined as Result;
  }
};

const playwrightProofPromise: Promise<FrontierPlaywrightRuntimeProof> = capturePlaywrightRuntimeProof(page, {
  command: 'playwright test proof.spec.ts',
  probeId: 'probe',
  signals: ['html-css-browser-runtime']
});

playwrightProofPromise satisfies Promise<FrontierPlaywrightRuntimeProof>;
