export const FRONTIER_RUNTIME_PROOF_CAPSULE_KIND = 'frontier.runtime-proof.capsule';
export const FRONTIER_RUNTIME_PROOF_CAPSULE_VERSION = 1;
export const FRONTIER_RUNTIME_PROOF_EVIDENCE_KIND = 'frontier.runtime-proof.evidence';
export const FRONTIER_RUNTIME_PROOF_EVIDENCE_VERSION = 1;

export const FRONTIER_RUNTIME_PROOF_MODES = [
  'isolated-fixture',
  'app-shell-fixture',
  'full-app-replay'
] as const;

export const FRONTIER_RUNTIME_PROOF_BLOCKED_MODES = [
  'environment-blocked'
] as const;

export type FrontierRuntimeProofMode = typeof FRONTIER_RUNTIME_PROOF_MODES[number];
export type FrontierRuntimeProofBlockedMode = typeof FRONTIER_RUNTIME_PROOF_BLOCKED_MODES[number];
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
  | 'runtime-proof-cumulative-layout-shift-exceeded';

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
}

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

function firstNumber(...values: unknown[]): number | undefined {
  return values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function asRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as UnknownRecord;
}
