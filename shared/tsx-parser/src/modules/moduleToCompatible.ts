import type { ParseResult, Template } from "../interfaces";
import type { ParsedModule } from "./interfaces";

export function moduleToCompatible(mod: ParsedModule): ParseResult {
  const result: ParseResult = {
    source: mod.source,
    dataSources: [],
    variables: [],
    components: [],
    componentsMap: new Map(),
    errors: mod.errors,
    functions: [],
    contracts: mod.contracts,
    templates: [],
    usedHelpers: mod.usedHelpers,
  };

  if (mod.defaultExport) {
    if (mod.defaultExport.children) {
      result.components.push(...mod.defaultExport.children);
    }

    for (const binding of mod.defaultExport.bindingMap.values()) {
      if (binding.kind === "resource") {
        result.dataSources.push(binding.resource!);
      } else if (binding.kind === "state" || binding.kind === "constant") {
        result.variables.push({
          name: binding.id.name,
          value: binding.initialValue,
        });
      }
    }

    result.functions.push(...mod.internalFunctions);

    for (const comp of mod.internalComponents) {
      const tpl: Template = {
        name: comp.id!.name,
        variables: [],
        dataSources: [],
        components: [],
      };
      result.templates.push(tpl);
      if (comp.children) {
        tpl.components.push(...comp.children);
      }
      for (const binding of comp.bindingMap.values()) {
        if (binding.kind === "resource") {
          tpl.dataSources.push(binding.resource!);
        } else if (
          binding.kind === "state" ||
          binding.kind === "constant" ||
          binding.kind === "param"
        ) {
          tpl.variables.push({
            name: binding.id.name,
            value: binding.initialValue,
            expose: binding.kind === "param",
          });
        }
      }
    }
  }

  return result;
}
