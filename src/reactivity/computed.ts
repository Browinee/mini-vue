import { ReactiveEffect } from "./effect";

// 更新
class ComputedRefImpl {
  private _getter: any; // 保存传入的 fn 函数
  private _dirty: boolean = true; // 用来标识有没有缓存,true代表没有缓存
  private _value: any; // 保存上一次的值
  private _effect: any;
  constructor(getter) {
    // this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) this._dirty = true;
    });
  }
  get value() {
    // NOTE: if no cache
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }

    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
