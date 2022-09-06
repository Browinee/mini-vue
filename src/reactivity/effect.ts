let activeEffect;

class ReactiveEffect {
  private _fn: any;
  public scheduler?: () => void;
  constructor(fn, scheduler) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}
const globalTargetMap = new Map();
export function track(target, key) {
  // {[target]: {[key]: dep[]}
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
  deps.add(activeEffect);
}
export function trigger(target, key) {
  let depsMap = globalTargetMap.get(target);
  let deps = depsMap.get(key);
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
export function effect(fn, options?: { scheduler?: () => void }) {
  const { scheduler = () => {} } = options || {};
  const _effect = new ReactiveEffect(fn, scheduler);
  _effect.run();
  return () => _effect.run();
  // or use following way to bind this
  // return _effect.run.bind(_effect);
}
