import {
  createRuntimeProofCapsule,
  runtimeEvidenceMetadataFromProof,
  validateRuntimeProofEvidence,
  type FrontierRuntimeEvidenceMetadata,
  type FrontierRuntimeProofCapsule,
  type FrontierRuntimeProofMode,
  type FrontierRuntimeProofValidation
} from '../dist/index.js';

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
