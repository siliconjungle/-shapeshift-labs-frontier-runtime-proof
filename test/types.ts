import {
  createRuntimeProofCapsule,
  runtimeEvidenceMetadataFromProof,
  validateRuntimeProofEvidence,
  type FrontierRuntimeEvidenceMetadata,
  type FrontierRuntimeProofCapsule,
  type FrontierRuntimeProofMode,
  type FrontierRuntimeProofValidation
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
