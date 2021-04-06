import { SchematicContext, Tree } from "@angular-devkit/schematics";
import { RunSchematics } from "../../types";

export function useClass<T extends Type<RunSchematics>>(useClass: T, options: any) {
  return new useClass(options).run();
}
