import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  // NOTE: provide should be use inside setup
  // otherwise currentInstance would be undefined.
  if (currentInstance) {
    let { provider } = currentInstance;
    const parentProvider = currentInstance.parent.provider;
    // init
    if (provider === parentProvider) {
      provider = currentInstance.provider = Object.create(parentProvider);
    }
    provider[key] = value;
  }
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const { parent } = currentInstance;
    const parentProvides = parent.provider;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }
  }
}
