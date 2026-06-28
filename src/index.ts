export const FRONTIER_RUNTIME_PROOF_CAPSULE_KIND = 'frontier.runtime-proof.capsule';
export const FRONTIER_RUNTIME_PROOF_CAPSULE_VERSION = 1;
export const FRONTIER_RUNTIME_PROOF_EVIDENCE_KIND = 'frontier.runtime-proof.evidence';
export const FRONTIER_RUNTIME_PROOF_EVIDENCE_VERSION = 1;
export const FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND = 'frontier.runtime-proof.source-bound-proof';
export const FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_VERSION = 1;

export const FRONTIER_RUNTIME_PROOF_MODES = [
  'isolated-fixture',
  'app-shell-fixture',
  'full-app-replay'
] as const;

export const FRONTIER_RUNTIME_PROOF_BLOCKED_MODES = [
  'environment-blocked'
] as const;

export const FRONTIER_RUNTIME_PROOF_SOURCE_ROLES = [
  'base',
  'worker',
  'head',
  'output'
] as const;

export type FrontierRuntimeProofMode = typeof FRONTIER_RUNTIME_PROOF_MODES[number];
export type FrontierRuntimeProofBlockedMode = typeof FRONTIER_RUNTIME_PROOF_BLOCKED_MODES[number];
export type FrontierRuntimeProofSourceRole = typeof FRONTIER_RUNTIME_PROOF_SOURCE_ROLES[number];
export type FrontierRuntimeProofStatus = 'passed' | 'failed' | 'blocked' | 'skipped' | string;
export type FrontierRuntimeProofReasonCode =
  | 'runtime-proof-capsule-mode-missing'
  | 'runtime-proof-capsule-mode-invalid'
  | 'runtime-proof-capsule-not-passed'
  | 'runtime-proof-environment-blocked'
  | 'runtime-proof-command-missing'
  | 'runtime-proof-probe-missing'
  | 'runtime-proof-evidence-hash-missing'
  | 'runtime-proof-required-signal-missing'
  | 'runtime-proof-capsule-missing'
  | 'runtime-proof-telemetry-hash-missing'
  | 'runtime-proof-cumulative-layout-shift-exceeded'
  | 'source-bound-runtime-proof-kind-invalid'
  | 'source-bound-runtime-proof-not-passed'
  | 'source-bound-runtime-proof-source-path-mismatch'
  | 'source-bound-runtime-proof-source-hash-missing'
  | 'source-bound-runtime-proof-source-hash-mismatch'
  | 'source-bound-runtime-proof-reason-mismatch'
  | 'source-bound-runtime-proof-boundary-mismatch'
  | 'source-bound-runtime-proof-record-mismatch'
  | 'source-bound-runtime-proof-broad-claim-present';

export interface FrontierRuntimeProofViewport {
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  colorScheme?: string;
  reducedMotion?: string;
}

export interface FrontierRuntimeProofCapsuleInput {
  kind?: string;
  version?: number;
  runtimeProofCapsule?: FrontierRuntimeProofCapsuleInput;
  proofCapsule?: FrontierRuntimeProofCapsuleInput;
  fixtureCapsule?: FrontierRuntimeProofCapsuleInput;
  mode?: FrontierRuntimeProofMode | FrontierRuntimeProofBlockedMode | string;
  status?: FrontierRuntimeProofStatus;
  command?: string;
  runtimeCommand?: string;
  probeId?: string;
  runtimeProbeId?: string;
  evidenceHash?: string;
  capsuleHash?: string;
  hash?: string;
  signals?: readonly string[] | Record<string, unknown> | string;
  browser?: {
    name?: string;
    browserName?: string;
    version?: string;
  };
  browserName?: string;
  browserVersion?: string;
  viewport?: FrontierRuntimeProofViewport;
  environment?: { hash?: string };
  environmentHash?: string;
  fixture?: { hash?: string };
  fixtureHash?: string;
  artifacts?: {
    sourceHash?: string;
    bundleHash?: string;
    cssHash?: string;
    jsHash?: string;
  };
  sourceArtifactHash?: string;
  bundleHash?: string;
  cssArtifactHash?: string;
  jsArtifactHash?: string;
  telemetry?: {
    hash?: string;
    signals?: readonly string[] | Record<string, unknown> | string;
    domSnapshotHash?: string;
    computedStyleHash?: string;
    layoutSnapshotHash?: string;
    eventTraceHash?: string;
    layoutShiftHash?: string;
    screenshotHash?: string;
    cumulativeLayoutShift?: number;
  };
  telemetryHash?: string;
  domSnapshotHash?: string;
  computedStyleHash?: string;
  layoutSnapshotHash?: string;
  eventTraceHash?: string;
  layoutShiftHash?: string;
  screenshotHash?: string;
  cumulativeLayoutShift?: number;
  runtimeEvidence?: {
    capsule?: FrontierRuntimeProofCapsuleInput;
  };
  browserEvidence?: {
    capsule?: FrontierRuntimeProofCapsuleInput;
  };
}

export type FrontierRuntimeProofSourceHashMap = Partial<Record<FrontierRuntimeProofSourceRole | 'merged', string>>;
export type FrontierRuntimeProofSourceTextMap = Partial<Record<FrontierRuntimeProofSourceRole | 'merged', string>>;

export interface FrontierRuntimeProofSourceBindingInput {
  base?: string;
  worker?: string;
  head?: string;
  output?: string;
  merged?: string;
  baseSourceText?: string;
  workerSourceText?: string;
  headSourceText?: string;
  outputSourceText?: string;
  mergedSourceText?: string;
  sourceTexts?: FrontierRuntimeProofSourceTextMap;
  sources?: FrontierRuntimeProofSourceTextMap;
  baseSourceHash?: string;
  workerSourceHash?: string;
  headSourceHash?: string;
  outputSourceHash?: string;
  mergedSourceHash?: string;
  sourceHashes?: FrontierRuntimeProofSourceHashMap;
  hashes?: FrontierRuntimeProofSourceHashMap;
}

export interface FrontierRuntimeProofSourceHashes {
  base?: string;
  worker?: string;
  head?: string;
  output?: string;
}

export interface FrontierSourceBoundRuntimeProofInput
  extends FrontierRuntimeProofCapsuleInput, FrontierRuntimeProofSourceBindingInput {
  id?: string;
  sourcePath?: string;
  reasonCode?: string;
  reasonCodes?: readonly string[];
  boundaryKey?: string;
  boundaryKeys?: readonly string[];
  recordKey?: string;
  recordKeys?: readonly string[];
  requiredSignals?: readonly string[];
  sourceBoundRuntimeProofHash?: string;
  autoMergeClaim?: boolean;
  semanticEquivalenceClaim?: boolean;
  runtimeEquivalenceClaim?: boolean;
  renderEquivalenceClaim?: boolean;
  browserRuntimeEquivalenceClaim?: boolean;
  browserRenderEquivalenceClaim?: boolean;
}

export interface FrontierSourceBoundRuntimeProof {
  kind: typeof FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND;
  version: typeof FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_VERSION;
  id?: string;
  status: 'passed';
  sourcePath?: string;
  reasonCode?: string;
  reasonCodes: string[];
  boundaryKey?: string;
  boundaryKeys: string[];
  recordKey?: string;
  recordKeys: string[];
  baseSourceHash?: string;
  workerSourceHash?: string;
  headSourceHash?: string;
  outputSourceHash?: string;
  runtimeCommand: string;
  runtimeProbeId: string;
  runtimeEvidenceHash: string;
  runtimeSignals: string[];
  requiredRuntimeSignals: string[];
  runtimeProofCapsule?: FrontierRuntimeProofCapsule;
  runtimeProofMode?: FrontierRuntimeProofMode;
  runtimeProofCapsuleHash?: string;
  runtimeBrowserName?: string;
  runtimeBrowserVersion?: string;
  runtimeViewport?: FrontierRuntimeProofViewport;
  runtimeTelemetryHash?: string;
  runtimeDomSnapshotHash?: string;
  runtimeComputedStyleHash?: string;
  runtimeLayoutSnapshotHash?: string;
  runtimeEventTraceHash?: string;
  runtimeLayoutShiftHash?: string;
  runtimeScreenshotHash?: string;
  runtimeCumulativeLayoutShift?: number;
  runtimeEvidenceBound: true;
  autoMergeClaim: false;
  semanticEquivalenceClaim: false;
  runtimeEquivalenceClaim: false;
  renderEquivalenceClaim: false;
  browserRuntimeEquivalenceClaim: false;
  browserRenderEquivalenceClaim: false;
  hash: string;
}

export interface FrontierSourceBoundRuntimeProofOptions extends FrontierRuntimeProofValidationOptions {
  sourcePath?: string;
  reasonCode?: string | readonly string[];
  boundaryKey?: string | readonly string[];
  recordKey?: string | readonly string[];
  sourceHashes?: FrontierRuntimeProofSourceHashes;
  requiredSourceRoles?: readonly FrontierRuntimeProofSourceRole[];
  sourceTextHash?: (sourceText: string) => string;
  allowedKinds?: readonly string[];
  rejectBroadClaims?: boolean;
}

export type FrontierSourceBoundRuntimeProofValidation =
  | {
    ok: true;
    proof: FrontierSourceBoundRuntimeProof | UnknownRecord;
    metadata: FrontierRuntimeEvidenceMetadata;
    sourceHashes: FrontierRuntimeProofSourceHashes;
  }
  | {
    ok: false;
    reasonCodes: FrontierRuntimeProofReasonCode[];
    metadataValidation: FrontierRuntimeProofValidation;
    sourceHashes: FrontierRuntimeProofSourceHashes;
  };

export interface FrontierRuntimeProofCapsule {
  kind: string;
  version: number;
  valid: true;
  mode: FrontierRuntimeProofMode;
  status: 'passed';
  command?: string;
  probeId?: string;
  evidenceHash?: string;
  signals: string[];
  browserName?: string;
  browserVersion?: string;
  viewport?: FrontierRuntimeProofViewport;
  environmentHash?: string;
  fixtureHash?: string;
  bundleHash?: string;
  cssArtifactHash?: string;
  jsArtifactHash?: string;
  sourceArtifactHash?: string;
  domSnapshotHash?: string;
  computedStyleHash?: string;
  layoutSnapshotHash?: string;
  eventTraceHash?: string;
  layoutShiftHash?: string;
  screenshotHash?: string;
  telemetryHash?: string;
  cumulativeLayoutShift?: number;
  hash: string;
}

export interface FrontierRuntimeProofInvalidCapsule {
  valid: false;
  mode?: string;
  status?: string;
  reasonCode: FrontierRuntimeProofReasonCode;
  reason: string;
}

export type FrontierRuntimeProofCapsuleResult = FrontierRuntimeProofCapsule | FrontierRuntimeProofInvalidCapsule | undefined;

export interface FrontierRuntimeEvidenceMetadata {
  kind: typeof FRONTIER_RUNTIME_PROOF_EVIDENCE_KIND;
  version: typeof FRONTIER_RUNTIME_PROOF_EVIDENCE_VERSION;
  command: string;
  probeId: string;
  evidenceHash: string;
  signals: string[];
  requiredSignals: string[];
  capsule?: FrontierRuntimeProofCapsule;
}

export interface FrontierRuntimeProofValidationOptions {
  requiredSignals?: readonly string[];
  requireRuntimeProofCapsule?: boolean;
  requireTelemetryHash?: boolean;
  maxCumulativeLayoutShift?: number;
}

export type FrontierRuntimeProofValidation =
  | {
    ok: true;
    metadata: FrontierRuntimeEvidenceMetadata;
  }
  | {
    ok: false;
    reasonCodes: FrontierRuntimeProofReasonCode[];
    capsule?: FrontierRuntimeProofCapsule | FrontierRuntimeProofInvalidCapsule;
    signals: string[];
    requiredSignals: string[];
  };

type UnknownRecord = Record<string, unknown>;

const runtimeProofModes = new Set<string>(FRONTIER_RUNTIME_PROOF_MODES);
const blockedRuntimeProofModes = new Set<string>(FRONTIER_RUNTIME_PROOF_BLOCKED_MODES);

export function createRuntimeProofCapsule(input: unknown): FrontierRuntimeProofCapsule {
  const capsule = normalizeRuntimeProofCapsule(input);
  if (!capsule || capsule.valid === false) {
    const reason = capsule?.reason ?? 'runtime proof capsule is missing or invalid';
    throw new Error(reason);
  }
  return capsule;
}

export function normalizeRuntimeProofCapsule(input: unknown): FrontierRuntimeProofCapsuleResult {
  const proof = asRecord(input);
  const capsule = findRuntimeProofCapsule(input);
  if (!capsule) return undefined;

  const mode = firstString(capsule.mode, proof?.runtimeProofMode, proof?.fixtureMode);
  if (!mode) {
    return invalidCapsule('runtime-proof-capsule-mode-missing', 'runtime proof capsule mode is missing');
  }
  if (blockedRuntimeProofModes.has(mode)) {
    return invalidCapsule('runtime-proof-environment-blocked', 'runtime proof capsule records a blocked environment', mode);
  }
  if (!runtimeProofModes.has(mode)) {
    return invalidCapsule('runtime-proof-capsule-mode-invalid', `runtime proof capsule mode is not supported: ${mode}`, mode);
  }

  const status = firstString(capsule.status, proof?.runtimeProofStatus, proof?.status);
  if (status && status !== 'passed') {
    return invalidCapsule('runtime-proof-capsule-not-passed', `runtime proof capsule status is not passed: ${status}`, mode, status);
  }

  const browser = asRecord(capsule.browser);
  const environment = asRecord(capsule.environment);
  const fixture = asRecord(capsule.fixture);
  const artifacts = asRecord(capsule.artifacts);
  const telemetry = asRecord(capsule.telemetry);
  const normalized = compactRecord({
    kind: firstString(capsule.kind) ?? FRONTIER_RUNTIME_PROOF_CAPSULE_KIND,
    version: firstNumber(capsule.version) ?? FRONTIER_RUNTIME_PROOF_CAPSULE_VERSION,
    valid: true as const,
    mode: mode as FrontierRuntimeProofMode,
    status: 'passed' as const,
    command: firstString(capsule.command, capsule.runtimeCommand, proof?.runtimeCommand, proof?.command),
    probeId: firstString(capsule.probeId, capsule.runtimeProbeId, proof?.runtimeProbeId, proof?.probeId),
    evidenceHash: firstString(capsule.evidenceHash, asRecord(capsule.evidence)?.hash, asRecord(capsule.evidence)?.evidenceHash, capsule.hash),
    signals: uniqueStrings([
      ...signalsFromValue(capsule.signals),
      ...signalsFromValue(telemetry?.signals)
    ]),
    browserName: firstString(capsule.browserName, browser?.name, browser?.browserName, proof?.browserName),
    browserVersion: firstString(capsule.browserVersion, browser?.version, proof?.browserVersion),
    viewport: normalizeViewport(firstObject(capsule.viewport, proof?.viewport)),
    environmentHash: firstString(capsule.environmentHash, environment?.hash),
    fixtureHash: firstString(capsule.fixtureHash, fixture?.hash),
    bundleHash: firstString(capsule.bundleHash, artifacts?.bundleHash),
    cssArtifactHash: firstString(capsule.cssArtifactHash, artifacts?.cssHash),
    jsArtifactHash: firstString(capsule.jsArtifactHash, artifacts?.jsHash),
    sourceArtifactHash: firstString(capsule.sourceArtifactHash, artifacts?.sourceHash),
    domSnapshotHash: firstString(capsule.domSnapshotHash, telemetry?.domSnapshotHash),
    computedStyleHash: firstString(capsule.computedStyleHash, telemetry?.computedStyleHash),
    layoutSnapshotHash: firstString(capsule.layoutSnapshotHash, telemetry?.layoutSnapshotHash),
    eventTraceHash: firstString(capsule.eventTraceHash, telemetry?.eventTraceHash),
    layoutShiftHash: firstString(capsule.layoutShiftHash, telemetry?.layoutShiftHash),
    screenshotHash: firstString(capsule.screenshotHash, telemetry?.screenshotHash),
    telemetryHash: firstString(capsule.telemetryHash, telemetry?.hash),
    cumulativeLayoutShift: firstNumber(capsule.cumulativeLayoutShift, telemetry?.cumulativeLayoutShift)
  }) as Omit<FrontierRuntimeProofCapsule, 'hash'>;

  return {
    ...normalized,
    hash: firstString(capsule.capsuleHash, proof?.runtimeProofCapsuleHash) ??
      hashRuntimeProofValue({ ...normalized, fingerprintKind: 'frontier.runtime-proof.capsule.fingerprint.v1' })
  };
}

export function runtimeProofSignals(input: unknown, capsule = normalizeRuntimeProofCapsule(input)): string[] {
  const proof = asRecord(input);
  const evidence = asRecord(proof?.evidence);
  const runtimeEvidence = asRecord(proof?.runtimeEvidence);
  const browserEvidence = asRecord(proof?.browserEvidence);
  const normalizedCapsule = capsule && capsule.valid === true ? capsule : undefined;
  return uniqueStrings([
    ...signalsFromValue(proof?.runtimeSignals),
    ...signalsFromValue(proof?.browserSignals),
    ...signalsFromValue(proof?.evidenceSignals),
    ...signalsFromValue(proof?.probeSignals),
    ...signalsFromValue(evidence?.signals),
    ...signalsFromValue(runtimeEvidence?.signals),
    ...signalsFromValue(browserEvidence?.signals),
    ...(normalizedCapsule?.signals ?? [])
  ]);
}

export function runtimeEvidenceMetadataFromProof(
  input: unknown,
  options: FrontierRuntimeProofValidationOptions = {}
): FrontierRuntimeEvidenceMetadata | undefined {
  const validation = validateRuntimeProofEvidence(input, options);
  return validation.ok ? validation.metadata : undefined;
}

export function validateRuntimeProofEvidence(
  input: unknown,
  options: FrontierRuntimeProofValidationOptions = {}
): FrontierRuntimeProofValidation {
  const proof = asRecord(input);
  const evidence = asRecord(proof?.evidence);
  const runtimeEvidence = asRecord(proof?.runtimeEvidence);
  const browserEvidence = asRecord(proof?.browserEvidence);
  const capsule = normalizeRuntimeProofCapsule(input);
  const signals = runtimeProofSignals(input, capsule);
  const requiredSignals = uniqueStrings(options.requiredSignals ?? []);
  const reasonCodes: FrontierRuntimeProofReasonCode[] = [];

  if (capsule?.valid === false) {
    reasonCodes.push(capsule.reasonCode);
  }

  const normalizedCapsule = capsule && capsule.valid === true ? capsule : undefined;
  const command = firstString(
    proof?.runtimeCommand,
    proof?.browserCommand,
    proof?.command,
    proof?.commandId,
    proof?.probeCommand,
    evidence?.command,
    runtimeEvidence?.command,
    browserEvidence?.command,
    normalizedCapsule?.command
  );
  const probeId = firstString(
    proof?.runtimeProbeId,
    proof?.browserProbeId,
    proof?.probeId,
    asRecord(proof?.probe)?.id,
    evidence?.probeId,
    runtimeEvidence?.probeId,
    browserEvidence?.probeId,
    normalizedCapsule?.probeId
  );
  const evidenceHash = firstString(
    proof?.runtimeEvidenceHash,
    proof?.browserEvidenceHash,
    proof?.evidenceHash,
    proof?.domEvidenceHash,
    proof?.renderEvidenceHash,
    proof?.hydrationEvidenceHash,
    proof?.resourceEvidenceHash,
    evidence?.hash,
    evidence?.evidenceHash,
    runtimeEvidence?.hash,
    runtimeEvidence?.evidenceHash,
    browserEvidence?.hash,
    browserEvidence?.evidenceHash,
    normalizedCapsule?.evidenceHash
  );

  if (!command) reasonCodes.push('runtime-proof-command-missing');
  if (!probeId) reasonCodes.push('runtime-proof-probe-missing');
  if (!evidenceHash) reasonCodes.push('runtime-proof-evidence-hash-missing');
  if (options.requireRuntimeProofCapsule && !normalizedCapsule) reasonCodes.push('runtime-proof-capsule-missing');
  if (options.requireTelemetryHash && !normalizedCapsule?.telemetryHash) reasonCodes.push('runtime-proof-telemetry-hash-missing');
  if (
    typeof options.maxCumulativeLayoutShift === 'number' &&
    typeof normalizedCapsule?.cumulativeLayoutShift === 'number' &&
    normalizedCapsule.cumulativeLayoutShift > options.maxCumulativeLayoutShift
  ) {
    reasonCodes.push('runtime-proof-cumulative-layout-shift-exceeded');
  }
  if (requiredSignals.length > 0 && !requiredSignals.some((signal) => signals.includes(signal))) {
    reasonCodes.push('runtime-proof-required-signal-missing');
  }

  if (reasonCodes.length > 0 || !command || !probeId || !evidenceHash) {
    return {
      ok: false,
      reasonCodes: uniqueStrings(reasonCodes) as FrontierRuntimeProofReasonCode[],
      capsule: capsule ?? undefined,
      signals,
      requiredSignals
    };
  }

  return {
    ok: true,
    metadata: compactRecord({
      kind: FRONTIER_RUNTIME_PROOF_EVIDENCE_KIND,
      version: FRONTIER_RUNTIME_PROOF_EVIDENCE_VERSION,
      command,
      probeId,
      evidenceHash,
      signals,
      requiredSignals,
      capsule: normalizedCapsule
    }) as unknown as FrontierRuntimeEvidenceMetadata
  };
}

export function runtimeProofSourceHashes(
  input: unknown,
  sourceTextHash?: (sourceText: string) => string
): FrontierRuntimeProofSourceHashes {
  const record = asRecord(input);
  if (!record) return {};
  return compactRecord({
    base: sourceHashForRole(record, 'base', sourceTextHash),
    worker: sourceHashForRole(record, 'worker', sourceTextHash),
    head: sourceHashForRole(record, 'head', sourceTextHash),
    output: sourceHashForRole(record, 'output', sourceTextHash)
  }) as FrontierRuntimeProofSourceHashes;
}

export function createSourceBoundRuntimeProof(
  input: FrontierSourceBoundRuntimeProofInput,
  options: FrontierSourceBoundRuntimeProofOptions = {}
): FrontierSourceBoundRuntimeProof {
  const requiredSignals = uniqueStrings(options.requiredSignals ?? input.requiredSignals ?? []);
  const metadata = runtimeEvidenceMetadataFromProof(input, {
    ...options,
    requiredSignals,
    requireRuntimeProofCapsule: options.requireRuntimeProofCapsule ?? true
  });
  if (!metadata) {
    throw new Error('source-bound runtime proof requires valid runtime evidence metadata');
  }

  const sourceHashes = runtimeProofSourceHashes(input, options.sourceTextHash);
  const requiredSourceRoles = options.requiredSourceRoles ?? FRONTIER_RUNTIME_PROOF_SOURCE_ROLES;
  const missingSourceRole = requiredSourceRoles.find((role) => !sourceHashes[role]);
  if (missingSourceRole) {
    throw new Error(`source-bound runtime proof is missing ${missingSourceRole} source hash`);
  }

  const status = firstString(input.status) ?? 'passed';
  if (status !== 'passed') {
    throw new Error(`source-bound runtime proof status is not passed: ${status}`);
  }

  const capsule = metadata.capsule;
  const proof = compactRecord({
    kind: FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND,
    version: FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_VERSION,
    id: input.id,
    status: 'passed' as const,
    sourcePath: input.sourcePath,
    reasonCode: input.reasonCode,
    reasonCodes: uniqueStrings(input.reasonCodes ?? []),
    boundaryKey: input.boundaryKey,
    boundaryKeys: uniqueStrings(input.boundaryKeys ?? []),
    recordKey: input.recordKey,
    recordKeys: uniqueStrings(input.recordKeys ?? []),
    baseSourceHash: sourceHashes.base,
    workerSourceHash: sourceHashes.worker,
    headSourceHash: sourceHashes.head,
    outputSourceHash: sourceHashes.output,
    runtimeCommand: metadata.command,
    runtimeProbeId: metadata.probeId,
    runtimeEvidenceHash: metadata.evidenceHash,
    runtimeSignals: metadata.signals,
    requiredRuntimeSignals: requiredSignals,
    runtimeProofCapsule: capsule,
    runtimeProofMode: capsule?.mode,
    runtimeProofCapsuleHash: capsule?.hash,
    runtimeBrowserName: capsule?.browserName,
    runtimeBrowserVersion: capsule?.browserVersion,
    runtimeViewport: capsule?.viewport,
    runtimeTelemetryHash: capsule?.telemetryHash,
    runtimeDomSnapshotHash: capsule?.domSnapshotHash,
    runtimeComputedStyleHash: capsule?.computedStyleHash,
    runtimeLayoutSnapshotHash: capsule?.layoutSnapshotHash,
    runtimeEventTraceHash: capsule?.eventTraceHash,
    runtimeLayoutShiftHash: capsule?.layoutShiftHash,
    runtimeScreenshotHash: capsule?.screenshotHash,
    runtimeCumulativeLayoutShift: capsule?.cumulativeLayoutShift,
    runtimeEvidenceBound: true as const,
    autoMergeClaim: false as const,
    semanticEquivalenceClaim: false as const,
    runtimeEquivalenceClaim: false as const,
    renderEquivalenceClaim: false as const,
    browserRuntimeEquivalenceClaim: false as const,
    browserRenderEquivalenceClaim: false as const
  }) as Omit<FrontierSourceBoundRuntimeProof, 'hash'>;

  return {
    ...proof,
    hash: input.sourceBoundRuntimeProofHash ??
      hashRuntimeProofValue({ ...proof, fingerprintKind: 'frontier.runtime-proof.source-bound-proof.fingerprint.v1' })
  };
}

export function validateSourceBoundRuntimeProof(
  input: unknown,
  options: FrontierSourceBoundRuntimeProofOptions = {}
): FrontierSourceBoundRuntimeProofValidation {
  const proof = asRecord(input);
  const sourceHashes = runtimeProofSourceHashes(input, options.sourceTextHash);
  const metadataValidation = validateRuntimeProofEvidence(input, {
    ...options,
    requiredSignals: options.requiredSignals,
    requireRuntimeProofCapsule: options.requireRuntimeProofCapsule ?? true
  });
  const reasonCodes: FrontierRuntimeProofReasonCode[] = metadataValidation.ok
    ? []
    : [...metadataValidation.reasonCodes];

  const allowedKinds = options.allowedKinds ?? [FRONTIER_SOURCE_BOUND_RUNTIME_PROOF_KIND];
  if (!proof || !allowedKinds.includes(firstString(proof?.kind) ?? '')) {
    reasonCodes.push('source-bound-runtime-proof-kind-invalid');
  }
  if ((firstString(proof?.status) ?? '') !== 'passed') {
    reasonCodes.push('source-bound-runtime-proof-not-passed');
  }
  if (options.sourcePath !== undefined && firstString(proof?.sourcePath) !== options.sourcePath) {
    reasonCodes.push('source-bound-runtime-proof-source-path-mismatch');
  }

  const requiredSourceRoles = options.requiredSourceRoles ?? [];
  for (const role of requiredSourceRoles) {
    if (!sourceHashes[role]) reasonCodes.push('source-bound-runtime-proof-source-hash-missing');
  }
  const expectedSourceHashes = options.sourceHashes ?? {};
  for (const role of FRONTIER_RUNTIME_PROOF_SOURCE_ROLES) {
    const expected = expectedSourceHashes[role];
    if (expected === undefined) continue;
    if (!sourceHashes[role]) reasonCodes.push('source-bound-runtime-proof-source-hash-missing');
    else if (sourceHashes[role] !== expected) reasonCodes.push('source-bound-runtime-proof-source-hash-mismatch');
  }

  const expectedReasons = optionStrings(options.reasonCode);
  if (expectedReasons.length > 0 && !coversAny(firstString(proof?.reasonCode), stringArray(proof?.reasonCodes), expectedReasons)) {
    reasonCodes.push('source-bound-runtime-proof-reason-mismatch');
  }

  const expectedBoundaries = optionStrings(options.boundaryKey);
  if (expectedBoundaries.length > 0 && !coversAny(firstString(proof?.boundaryKey), stringArray(proof?.boundaryKeys), expectedBoundaries)) {
    reasonCodes.push('source-bound-runtime-proof-boundary-mismatch');
  }

  const expectedRecords = optionStrings(options.recordKey);
  if (expectedRecords.length > 0 && !coversAny(firstString(proof?.recordKey), stringArray(proof?.recordKeys), expectedRecords)) {
    reasonCodes.push('source-bound-runtime-proof-record-mismatch');
  }

  if (options.rejectBroadClaims !== false && hasBroadEquivalenceClaim(proof)) {
    reasonCodes.push('source-bound-runtime-proof-broad-claim-present');
  }

  const uniqueReasonCodes = uniqueStrings(reasonCodes) as FrontierRuntimeProofReasonCode[];
  if (uniqueReasonCodes.length > 0 || !metadataValidation.ok) {
    return {
      ok: false,
      reasonCodes: uniqueReasonCodes,
      metadataValidation,
      sourceHashes
    };
  }

  return {
    ok: true,
    proof: proof as FrontierSourceBoundRuntimeProof | UnknownRecord,
    metadata: metadataValidation.metadata,
    sourceHashes
  };
}

export function stableRuntimeProofJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? 'undefined' : serialized;
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableRuntimeProofJson(item)).join(',')}]`;
  }
  const entries = Object.entries(value as UnknownRecord)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableRuntimeProofJson(item)}`).join(',')}}`;
}

export function hashRuntimeProofValue(value: unknown): string {
  const serialized = stableRuntimeProofJson(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function compactRuntimeProofRecord<T extends UnknownRecord>(record: T): Partial<T> {
  return compactRecord(record) as Partial<T>;
}

function findRuntimeProofCapsule(input: unknown): UnknownRecord | undefined {
  const record = asRecord(input);
  if (!record) return undefined;
  const runtimeEvidence = asRecord(record.runtimeEvidence);
  const browserEvidence = asRecord(record.browserEvidence);
  const nested = firstObject(
    record.runtimeProofCapsule,
    record.proofCapsule,
    record.fixtureCapsule,
    runtimeEvidence?.capsule,
    browserEvidence?.capsule
  );
  if (nested) return nested;
  if (looksLikeRuntimeProofCapsule(record)) return record;
  return undefined;
}

function looksLikeRuntimeProofCapsule(record: UnknownRecord): boolean {
  return record.mode !== undefined ||
    record.fixtureMode !== undefined ||
    record.browser !== undefined ||
    record.viewport !== undefined ||
    record.telemetry !== undefined ||
    record.artifacts !== undefined ||
    record.capsuleHash !== undefined;
}

function sourceHashForRole(
  record: UnknownRecord,
  role: FrontierRuntimeProofSourceRole,
  sourceTextHash?: (sourceText: string) => string
): string | undefined {
  const directHashFields = role === 'output'
    ? ['outputSourceHash', 'mergedSourceHash']
    : [`${role}SourceHash`];
  for (const field of directHashFields) {
    const value = firstString(record[field]);
    if (value) return value;
  }

  const aliases = sourceRoleAliases(role);
  const sourceHashes = asRecord(record.sourceHashes);
  const hashes = asRecord(record.hashes);
  for (const alias of aliases) {
    const value = firstString(sourceHashes?.[alias], hashes?.[alias]);
    if (value) return value;
  }

  if (!sourceTextHash) return undefined;
  const sourceTexts = asRecord(record.sourceTexts);
  const sources = asRecord(record.sources);
  const directTextFields = role === 'output'
    ? ['outputSourceText', 'mergedSourceText', 'output', 'merged']
    : [`${role}SourceText`, role];
  for (const field of directTextFields) {
    const value = firstSourceString(record[field]);
    if (value !== undefined) return sourceTextHash(value);
  }
  for (const alias of aliases) {
    const value = firstSourceString(sourceTexts?.[alias], sources?.[alias]);
    if (value !== undefined) return sourceTextHash(value);
  }
  return undefined;
}

function sourceRoleAliases(role: FrontierRuntimeProofSourceRole): string[] {
  return role === 'output' ? ['output', 'merged'] : [role];
}

function optionStrings(value: string | readonly string[] | undefined): string[] {
  if (typeof value === 'string' && value.length > 0) return [value];
  if (Array.isArray(value)) return uniqueStrings(value);
  return [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

function coversAny(value: string | undefined, values: readonly string[], expected: readonly string[]): boolean {
  return expected.some((item) => value === item || values.includes(item));
}

function hasBroadEquivalenceClaim(record: UnknownRecord | undefined): boolean {
  if (!record) return false;
  return record.autoMergeClaim === true ||
    record.semanticEquivalenceClaim === true ||
    record.runtimeEquivalenceClaim === true ||
    record.renderEquivalenceClaim === true ||
    record.browserRuntimeEquivalenceClaim === true ||
    record.browserRenderEquivalenceClaim === true;
}

function invalidCapsule(
  reasonCode: FrontierRuntimeProofReasonCode,
  reason: string,
  mode?: string,
  status?: string
): FrontierRuntimeProofInvalidCapsule {
  return compactRecord({
    valid: false as const,
    mode,
    status,
    reasonCode,
    reason
  }) as unknown as FrontierRuntimeProofInvalidCapsule;
}

function normalizeViewport(value: unknown): FrontierRuntimeProofViewport | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  return compactRecord({
    width: firstNumber(record.width),
    height: firstNumber(record.height),
    deviceScaleFactor: firstNumber(record.deviceScaleFactor),
    colorScheme: firstString(record.colorScheme),
    reducedMotion: firstString(record.reducedMotion)
  }) as FrontierRuntimeProofViewport;
}

function signalsFromValue(value: unknown): string[] {
  if (typeof value === 'string' && value.length > 0) return [value];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  const record = asRecord(value);
  if (record) {
    return Object.keys(record).filter((key) => record[key] === true || record[key] === 'passed');
  }
  return [];
}

function compactRecord(record: UnknownRecord): UnknownRecord {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

function firstObject(...values: unknown[]): UnknownRecord | undefined {
  return values.map((value) => asRecord(value)).find((value): value is UnknownRecord => value !== undefined);
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function firstSourceString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string');
}

function firstNumber(...values: unknown[]): number | undefined {
  return values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function asRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as UnknownRecord;
}
