import {
  apply,
  applyTemplates,
  HostTree,
  mergeWith,
  move,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';

export class TestWorkspaceFactory {
  private hostTree = new HostTree();
  private tree!: UnitTestTree;
  private runner: SchematicTestRunner;
  constructor(
    collectionPath = require.resolve('../schematics/collection.json')
  ) {
    this.runner = new SchematicTestRunner('ngx-center', collectionPath);
  }

  async create(options?: {
    name?: string;
    newProjectRoot?: string;
    version?: string;
    minimal?: boolean;
    strict?: boolean;
    packageManager?: 'npm' | 'yarn' | 'pnpm' | 'cnpm';
  }) {
    this.tree = await this.runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        {
          name: 'test-workspace',
          version: '14.0.0',
          newProjectRoot: 'projects',
          ...options,
        },
        this.hostTree
      )
      .toPromise();
    return this.tree;
  }

  async addApplication(options: { name: string; [name: string]: any }) {
    this.tree = await this.runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        options,
        this.tree
      )
      .toPromise();
    return this.tree;
  }

  async addLibrary(options: { name: string; [name: string]: any }) {
    this.tree = await this.runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'library',
        options,
        this.tree
      )
      .toPromise();
    return this.tree;
  }

  addNewFile(templatePath: string, content: string | Buffer) {
    this.hostTree.create(templatePath, content);
    return this.tree;
  }
  removeFile(filePath: string) {
    this.hostTree.delete(filePath);
    return this.tree;
  }
  getTree() {
    return this.tree;
  }
  runSchematic(schematicName: string, options?: Record<string, any>) {
    return this.runner
      .runSchematicAsync(schematicName, options, this.tree)
      .toPromise();
  }
}

export function createTestWorkspaceFactory(collectionPath?: string) {
  return new TestWorkspaceFactory(collectionPath);
}
