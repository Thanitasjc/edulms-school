export function isModuleEnabled(enabledModules: string[], moduleKey: string): boolean {
  return enabledModules.includes(moduleKey);
}
