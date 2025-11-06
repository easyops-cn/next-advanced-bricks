import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { validateGlobalApi } from "./validations.js";
import type { BindingInfo, ParsedModule } from "./interfaces.js";

const IdentifierUseMap = new Map<string, BindingInfo["kind"]>([
  ["useQuery", "query"],
  ["usePathParams", "pathParams"],
  ["useApp", "app"],
  ["useAuth", "auth"],
  ["useHistory", "history"],
  ["useLocation", "location"],
]);

export function parseIdentifierUse(
  decl: NodePath<t.VariableDeclarator>,
  callee: NodePath<t.Identifier>,
  args: NodePath<t.Node>[],
  state: ParsedModule
): null | false | [t.Identifier, BindingInfo] {
  for (const [useName, kind] of IdentifierUseMap) {
    if (validateGlobalApi(callee, useName)) {
      const declId = decl.get("id");
      if (!declId.isIdentifier()) {
        state.errors.push({
          message: `${useName}() must be assigned to an identifier, received ${declId.type}`,
          node: declId.node,
          severity: "error",
        });
        break;
      }
      if (args.length > 0) {
        state.errors.push({
          message: `${useName}() does not accept any arguments, received ${args.length}`,
          node: args[0].node,
          severity: "warning",
        });
      }
      return [declId.node, { id: declId.node, kind }];
    }
  }
  return null;
}
