import { extend } from "../shared";

let activeEffect;
let shouldTrack;

export class ReactiveEffect {
  private _fn: any;
  public scheduler?: () => void;
  private _active: boolean = true;
  public onStop?: () => void;
  deps = [];
  constructor(fn, scheduler) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    //  NOTE:  stop: already remove deps and no need for track, just trigger fn
    if (!this._active) {
      // NOTE: this would trigger getter function and track, but
      // in this time, shouldTrack is false, so it won't trigger track
      return this._fn();
    }

    // NOTE: not stop
    activeEffect = this;
    shouldTrack = true;
    const result = this._fn();

    shouldTrack = false;
    return result;
  }
  stop() {
    // NOTE: check if stop is called before
    if (this._active) {
      cleanupEffect(this);
      this.onStop && this.onStop();
      this._active = false;
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

const globalTargetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;
  // NOTE: {[target]: {[key]: dep[]}
  let depsMap = globalTargetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    globalTargetMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  trackEffects(deps);
}
export function trackEffects(deps) {
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  const depsMap = globalTargetMap.get(target);
  const deps = depsMap.get(key);
  triggerEffects(deps);
}

export function triggerEffects(deps) {
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(
  fn,
  options?: { scheduler?: () => void; onStop?: () => void }
) {
  const { scheduler } = options || {};
  const _effect: any = new ReactiveEffect(fn, scheduler);
  extend(_effect, options);
  _effect.run();

  // NOTE: _effect.run need correct this
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
