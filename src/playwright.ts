import {
  createRuntimeProofCapsule,
  hashRuntimeProofValue,
  validateRuntimeProofEvidence,
  type FrontierRuntimeProofCapsule,
  type FrontierRuntimeProofMode,
  type FrontierRuntimeProofValidation,
  type FrontierRuntimeProofViewport
} from './index.ts';

export const FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_KIND = 'frontier.runtime-proof.playwright-evidence';
export const FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_VERSION = 1;

export interface FrontierPlaywrightLikePage {
  evaluate<Result, Arg>(
    pageFunction: (arg: Arg) => Result | Promise<Result>,
    arg: Arg
  ): Promise<Result>;
  viewportSize?(): { width: number; height: number } | null;
  screenshot?(options?: Record<string, unknown>): Promise<Uint8Array | string>;
  context?(): {
    browser?(): {
      version?(): string;
      browserType?(): { name?(): string };
    } | null;
  };
}

export interface FrontierPlaywrightRuntimeProofOptions {
  mode?: FrontierRuntimeProofMode;
  command: string;
  probeId: string;
  signals: readonly string[];
  requiredSignals?: readonly string[];
  sourcePath?: string;
  sourceHash?: string;
  bundleHash?: string;
  cssHash?: string;
  jsHash?: string;
  environmentHash?: string;
  fixtureHash?: string;
  evidenceHash?: string;
  browserName?: string;
  browserVersion?: string;
  viewport?: FrontierRuntimeProofViewport;
  selectors?: readonly string[];
  styleProperties?: readonly string[];
  eventTypes?: readonly string[];
  maxElements?: number;
  maxDepth?: number;
  maxTextLength?: number;
  maxEvents?: number;
  includeText?: boolean;
  screenshot?: boolean | Record<string, unknown>;
  maxCumulativeLayoutShift?: number;
  exercise?: (page: FrontierPlaywrightLikePage) => Promise<void> | void;
}

export interface FrontierPlaywrightRuntimeTelemetry {
  environment?: Record<string, unknown>;
  domSnapshot: unknown;
  computedStyleSnapshot: unknown;
  layoutSnapshot: unknown;
  eventTrace: unknown;
  layoutShift: {
    cumulativeLayoutShift: number;
    entries: unknown[];
  };
}

export interface FrontierPlaywrightRuntimeProof {
  kind: typeof FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_KIND;
  version: typeof FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_VERSION;
  status: 'passed' | 'blocked';
  mode: FrontierRuntimeProofMode | 'environment-blocked';
  command: string;
  probeId: string;
  signals: string[];
  sourcePath?: string;
  runtimeProofCapsule: FrontierRuntimeProofCapsule | Record<string, unknown>;
  telemetry?: FrontierPlaywrightRuntimeTelemetry;
  validation: FrontierRuntimeProofValidation;
  error?: {
    name?: string;
    message: string;
  };
}

interface BrowserCaptureInput {
  captureKind: 'frontier.runtime-proof.playwright.capture.v1';
  selectors: string[];
  styleProperties: string[];
  maxElements: number;
  maxDepth: number;
  maxTextLength: number;
  includeText: boolean;
}

interface BrowserTraceInput {
  traceKind: 'frontier.runtime-proof.playwright.trace.v1';
  eventTypes: string[];
  maxEvents: number;
}

interface BrowserLayoutShift {
  value: number;
  hadRecentInput?: boolean;
  sources?: BrowserLayoutShiftSource[];
}

interface BrowserLayoutShiftSource {
  node?: Node;
  previousRect?: DOMRectReadOnly;
  currentRect?: DOMRectReadOnly;
}

const defaultStyleProperties = Object.freeze([
  'display',
  'position',
  'visibility',
  'opacity',
  'z-index',
  'box-sizing',
  'width',
  'height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'color',
  'background-color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'transform',
  'overflow',
  'pointer-events'
]);

const defaultEventTypes = Object.freeze([
  'click',
  'input',
  'change',
  'submit',
  'keydown',
  'keyup',
  'pointerdown',
  'pointerup',
  'focus',
  'blur'
]);

export async function capturePlaywrightRuntimeProof(
  page: FrontierPlaywrightLikePage,
  options: FrontierPlaywrightRuntimeProofOptions
): Promise<FrontierPlaywrightRuntimeProof> {
  try {
    await installPlaywrightRuntimeProofTrace(page, options);
    await options.exercise?.(page);
    const telemetry = await capturePlaywrightRuntimeTelemetry(page, options);
    const screenshotHash = await captureScreenshotHash(page, options);
    const browser = browserMetadata(page, options);
    const viewport = viewportMetadata(page, options, telemetry);
    const telemetryHashes = {
      domSnapshotHash: hashRuntimeProofValue(telemetry.domSnapshot),
      computedStyleHash: hashRuntimeProofValue(telemetry.computedStyleSnapshot),
      layoutSnapshotHash: hashRuntimeProofValue(telemetry.layoutSnapshot),
      eventTraceHash: hashRuntimeProofValue(telemetry.eventTrace),
      layoutShiftHash: hashRuntimeProofValue(telemetry.layoutShift),
      screenshotHash,
      cumulativeLayoutShift: telemetry.layoutShift.cumulativeLayoutShift
    };
    const telemetryHash = hashRuntimeProofValue({
      kind: 'frontier.runtime-proof.telemetry.v1',
      ...telemetryHashes
    });
    const artifacts = {
      sourceHash: options.sourceHash,
      bundleHash: options.bundleHash,
      cssHash: options.cssHash,
      jsHash: options.jsHash
    };
    const evidenceHash = options.evidenceHash ?? hashRuntimeProofValue({
      kind: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_KIND,
      version: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_VERSION,
      mode: options.mode ?? 'isolated-fixture',
      command: options.command,
      probeId: options.probeId,
      signals: uniqueStrings(options.signals),
      sourcePath: options.sourcePath,
      artifacts,
      browser,
      viewport,
      telemetryHash
    });
    const runtimeProofCapsule = createRuntimeProofCapsule({
      mode: options.mode ?? 'isolated-fixture',
      status: 'passed',
      command: options.command,
      probeId: options.probeId,
      evidenceHash,
      signals: uniqueStrings(options.signals),
      browser,
      viewport,
      environmentHash: options.environmentHash,
      fixtureHash: options.fixtureHash,
      artifacts,
      telemetry: {
        hash: telemetryHash,
        ...telemetryHashes
      }
    });
    const proof: Omit<FrontierPlaywrightRuntimeProof, 'validation'> = {
      kind: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_KIND,
      version: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_VERSION,
      status: 'passed' as const,
      mode: runtimeProofCapsule.mode,
      command: options.command,
      probeId: options.probeId,
      signals: runtimeProofCapsule.signals,
      sourcePath: options.sourcePath,
      runtimeProofCapsule,
      telemetry
    };
    return {
      ...proof,
      validation: validateRuntimeProofEvidence(proof, validationOptions(options))
    };
  } catch (error) {
    return createEnvironmentBlockedPlaywrightRuntimeProof(options, error);
  }
}

export async function installPlaywrightRuntimeProofTrace(
  page: FrontierPlaywrightLikePage,
  options: Pick<FrontierPlaywrightRuntimeProofOptions, 'eventTypes' | 'maxEvents'> = {}
): Promise<void> {
  await page.evaluate(installBrowserTrace, {
    traceKind: 'frontier.runtime-proof.playwright.trace.v1',
    eventTypes: uniqueStrings(options.eventTypes ?? defaultEventTypes),
    maxEvents: boundedInteger(options.maxEvents, 200)
  });
}

export async function capturePlaywrightRuntimeTelemetry(
  page: FrontierPlaywrightLikePage,
  options: Pick<
    FrontierPlaywrightRuntimeProofOptions,
    'selectors' | 'styleProperties' | 'maxElements' | 'maxDepth' | 'maxTextLength' | 'includeText'
  > = {}
): Promise<FrontierPlaywrightRuntimeTelemetry> {
  return page.evaluate(captureBrowserTelemetry, {
    captureKind: 'frontier.runtime-proof.playwright.capture.v1',
    selectors: uniqueStrings(options.selectors ?? ['body']),
    styleProperties: uniqueStrings(options.styleProperties ?? defaultStyleProperties),
    maxElements: boundedInteger(options.maxElements, 120),
    maxDepth: boundedInteger(options.maxDepth, 8),
    maxTextLength: boundedInteger(options.maxTextLength, 80),
    includeText: options.includeText === true
  });
}

export function createEnvironmentBlockedPlaywrightRuntimeProof(
  options: Pick<FrontierPlaywrightRuntimeProofOptions, 'command' | 'probeId' | 'signals' | 'sourcePath'>,
  error: unknown
): FrontierPlaywrightRuntimeProof {
  const normalizedError = normalizeError(error);
  const evidenceHash = hashRuntimeProofValue({
    kind: 'frontier.runtime-proof.playwright-environment-blocked.v1',
    command: options.command,
    probeId: options.probeId,
    signals: uniqueStrings(options.signals),
    error: normalizedError
  });
  const proof: Omit<FrontierPlaywrightRuntimeProof, 'validation'> = {
    kind: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_KIND,
    version: FRONTIER_PLAYWRIGHT_RUNTIME_PROOF_VERSION,
    status: 'blocked' as const,
    mode: 'environment-blocked' as const,
    command: options.command,
    probeId: options.probeId,
    signals: uniqueStrings(options.signals),
    sourcePath: options.sourcePath,
    runtimeProofCapsule: {
      mode: 'environment-blocked',
      status: 'blocked',
      command: options.command,
      probeId: options.probeId,
      evidenceHash,
      signals: uniqueStrings(options.signals)
    },
    error: normalizedError
  };
  return {
    ...proof,
    validation: validateRuntimeProofEvidence(proof, {
      requiredSignals: uniqueStrings(options.signals),
      requireRuntimeProofCapsule: true
    })
  };
}

function installBrowserTrace(input: BrowserTraceInput): void {
  const global = window as unknown as {
    __frontierRuntimeProofEventTrace?: Record<string, unknown>[];
    __frontierRuntimeProofTraceInstalled?: boolean;
    __frontierRuntimeProofLayoutShifts?: Record<string, unknown>[];
    __frontierRuntimeProofLayoutObserverInstalled?: boolean;
  };
  global.__frontierRuntimeProofEventTrace = [];
  if (!global.__frontierRuntimeProofTraceInstalled) {
    global.__frontierRuntimeProofTraceInstalled = true;
    for (const type of input.eventTypes) {
      window.addEventListener(type, (event) => {
        const trace = global.__frontierRuntimeProofEventTrace ?? [];
        if (trace.length >= input.maxEvents) return;
        const target = event.target instanceof Element ? event.target : undefined;
        trace.push(compactBrowserRecord({
          sequence: trace.length,
          type: event.type,
          target: target ? cssPath(target) : undefined,
          defaultPrevented: event.defaultPrevented,
          key: event instanceof KeyboardEvent ? event.key : undefined,
          button: event instanceof MouseEvent ? event.button : undefined,
          valueHash: target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
            ? hashBrowserString(target.value)
            : undefined,
          checked: target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio')
            ? target.checked
            : undefined
        }));
      }, { capture: true });
    }
  }
  global.__frontierRuntimeProofLayoutShifts = [];
  if (!global.__frontierRuntimeProofLayoutObserverInstalled && 'PerformanceObserver' in window) {
    global.__frontierRuntimeProofLayoutObserverInstalled = true;
    try {
      const observer = new PerformanceObserver((list) => {
        const shifts = global.__frontierRuntimeProofLayoutShifts ?? [];
        for (const entry of list.getEntries() as unknown as BrowserLayoutShift[]) {
          if (entry.hadRecentInput) continue;
          shifts.push({
            value: roundBrowserNumber(entry.value),
            sources: entry.sources?.map((source: BrowserLayoutShiftSource) => compactBrowserRecord({
              node: source.node instanceof Element ? cssPath(source.node) : undefined,
              previousRect: rectRecord(source.previousRect),
              currentRect: rectRecord(source.currentRect)
            })) ?? []
          });
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      global.__frontierRuntimeProofLayoutObserverInstalled = false;
    }
  }
}

function captureBrowserTelemetry(input: BrowserCaptureInput): FrontierPlaywrightRuntimeTelemetry {
  const global = window as unknown as {
    __frontierRuntimeProofEventTrace?: Record<string, unknown>[];
    __frontierRuntimeProofLayoutShifts?: Record<string, unknown>[];
  };
  const roots = selectRoots(input);
  const elements = collectElements(roots, input.maxElements);
  const layoutShiftEntries = global.__frontierRuntimeProofLayoutShifts ?? [];
  return {
    environment: compactBrowserRecord({
      url: location.href,
      userAgentHash: hashBrowserString(navigator.userAgent),
      deviceScaleFactor: window.devicePixelRatio,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      colorScheme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'
    }),
    domSnapshot: roots.map((root) => snapshotElement(root, input, 0)),
    computedStyleSnapshot: elements.map((element) => computedStyleRecord(element, input.styleProperties)),
    layoutSnapshot: elements.map((element) => layoutRecord(element)),
    eventTrace: global.__frontierRuntimeProofEventTrace ?? [],
    layoutShift: {
      cumulativeLayoutShift: roundBrowserNumber(layoutShiftEntries.reduce((sum, entry) => {
        const value = typeof entry.value === 'number' ? entry.value : 0;
        return sum + value;
      }, 0)),
      entries: layoutShiftEntries
    }
  };
}

function selectRoots(input: BrowserCaptureInput): Element[] {
  const roots: Element[] = [];
  for (const selector of input.selectors) {
    roots.push(...Array.from(document.querySelectorAll(selector)));
  }
  if (roots.length === 0 && document.body) roots.push(document.body);
  return roots.slice(0, input.maxElements);
}

function collectElements(roots: Element[], maxElements: number): Element[] {
  const elements: Element[] = [];
  const seen = new Set<Element>();
  for (const root of roots) {
    if (!seen.has(root)) {
      seen.add(root);
      elements.push(root);
    }
    for (const element of Array.from(root.querySelectorAll('*'))) {
      if (elements.length >= maxElements) return elements;
      if (seen.has(element)) continue;
      seen.add(element);
      elements.push(element);
    }
  }
  return elements.slice(0, maxElements);
}

function snapshotElement(element: Element, input: BrowserCaptureInput, depth: number): Record<string, unknown> {
  const children = depth >= input.maxDepth
    ? []
    : Array.from(element.children).slice(0, input.maxElements).map((child) => snapshotElement(child, input, depth + 1));
  return compactBrowserRecord({
    path: cssPath(element),
    tag: element.tagName.toLowerCase(),
    attributes: Array.from(element.attributes)
      .map((attribute) => [attribute.name, attribute.value] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
    textHash: input.includeText ? hashBrowserString((element.textContent ?? '').trim().slice(0, input.maxTextLength)) : undefined,
    childElementCount: element.childElementCount,
    children
  });
}

function computedStyleRecord(element: Element, properties: readonly string[]): Record<string, unknown> {
  const style = getComputedStyle(element);
  return {
    path: cssPath(element),
    properties: Object.fromEntries(properties.map((property) => [property, style.getPropertyValue(property)]))
  };
}

function layoutRecord(element: Element): Record<string, unknown> {
  const rect = element.getBoundingClientRect();
  return compactBrowserRecord({
    path: cssPath(element),
    rect: rectRecord(rect),
    scrollWidth: roundBrowserNumber(element.scrollWidth),
    scrollHeight: roundBrowserNumber(element.scrollHeight),
    clientWidth: roundBrowserNumber(element.clientWidth),
    clientHeight: roundBrowserNumber(element.clientHeight)
  });
}

function rectRecord(rect: DOMRectReadOnly | undefined): Record<string, number> | undefined {
  if (!rect) return undefined;
  return {
    x: roundBrowserNumber(rect.x),
    y: roundBrowserNumber(rect.y),
    width: roundBrowserNumber(rect.width),
    height: roundBrowserNumber(rect.height),
    top: roundBrowserNumber(rect.top),
    right: roundBrowserNumber(rect.right),
    bottom: roundBrowserNumber(rect.bottom),
    left: roundBrowserNumber(rect.left)
  };
}

function cssPath(element: Element): string {
  if (element.id) return `#${cssEscape(element.id)}`;
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 8) {
    const tag = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const sameTagSiblings: Element[] = Array.from(parent.children)
      .filter((child): child is Element => child instanceof Element && child.tagName === current?.tagName);
    const index = sameTagSiblings.indexOf(current) + 1;
    parts.unshift(sameTagSiblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    current = parent;
  }
  return parts.join(' > ');
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(value)
    : value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function compactBrowserRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function hashBrowserString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function roundBrowserNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function validationOptions(options: FrontierPlaywrightRuntimeProofOptions) {
  return {
    requiredSignals: uniqueStrings(options.requiredSignals ?? options.signals),
    requireRuntimeProofCapsule: true,
    requireTelemetryHash: true,
    maxCumulativeLayoutShift: options.maxCumulativeLayoutShift
  };
}

function browserMetadata(
  page: FrontierPlaywrightLikePage,
  options: Pick<FrontierPlaywrightRuntimeProofOptions, 'browserName' | 'browserVersion'>
): { name?: string; version?: string } | undefined {
  const browser = page.context?.().browser?.();
  const name = options.browserName ?? browser?.browserType?.().name?.();
  const version = options.browserVersion ?? browser?.version?.();
  return name || version ? { name, version } : undefined;
}

function viewportMetadata(
  page: FrontierPlaywrightLikePage,
  options: Pick<FrontierPlaywrightRuntimeProofOptions, 'viewport'>,
  telemetry: FrontierPlaywrightRuntimeTelemetry
): FrontierRuntimeProofViewport | undefined {
  if (options.viewport) return options.viewport;
  const viewport = page.viewportSize?.();
  const environment = telemetry.environment;
  const environmentViewport = environment?.viewport as { width?: unknown; height?: unknown } | undefined;
  const width = viewport?.width ?? numberOrUndefined(environmentViewport?.width);
  const height = viewport?.height ?? numberOrUndefined(environmentViewport?.height);
  const deviceScaleFactor = numberOrUndefined(environment?.deviceScaleFactor);
  const colorScheme = stringOrUndefined(environment?.colorScheme);
  const reducedMotion = stringOrUndefined(environment?.reducedMotion);
  return width || height || deviceScaleFactor || colorScheme || reducedMotion
    ? { width, height, deviceScaleFactor, colorScheme, reducedMotion }
    : undefined;
}

async function captureScreenshotHash(
  page: FrontierPlaywrightLikePage,
  options: Pick<FrontierPlaywrightRuntimeProofOptions, 'screenshot'>
): Promise<string | undefined> {
  if (!options.screenshot || typeof page.screenshot !== 'function') return undefined;
  const screenshotOptions = options.screenshot === true ? {} : options.screenshot;
  const screenshot = await page.screenshot(screenshotOptions);
  if (typeof screenshot === 'string') return hashRuntimeProofValue({ screenshot });
  return hashBytes(screenshot);
}

function hashBytes(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function boundedInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.min(Math.floor(value), 10_000)
    : fallback;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

function normalizeError(error: unknown): { name?: string; message: string } {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { message: String(error) };
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
