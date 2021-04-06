import {
  externalSchematic,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';

export class RunNgGenerateApplication implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      return externalSchematic('@schematics/angular', 'application', {
        // projectRoot: 'temp',
        name: `${this.options.name}`,
        style: 'scss',
        skipInstall: true,
      });
    };
  }
}
