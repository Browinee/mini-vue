const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    // NOTE: handle this.$el, this.$ref,etc
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
