import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createCssSelectorForTs, TsChange } from 'cyia-code-util';
import { createSourceFile, ScriptTarget } from 'typescript';

export default function (): Rule {
  return (tree: Tree, context: SchematicContext) => {
    let dir = tree.getDir('/');
    let list = dir.subfiles.filter((item) => item.startsWith('webpack.config'));
    for (let i = 0; i < list.length; i++) {
      const filePath = list[i];
      let file = tree.read(filePath)?.toString()!;
      let sf = createSourceFile('', file, ScriptTarget.Latest, true);
      let selector = createCssSelectorForTs(sf);
      console.log(selector.queryAll('ExpressionStatement').length);

      selector
        .queryAll('ExpressionStatement[expression*=jsonpFunction]')
        .find((removeNode) => {
          let change = new TsChange(sf);
          let deleteChange = change.deleteNode(removeNode);
          let recorder = tree.beginUpdate(filePath);
          recorder.remove(deleteChange.start, deleteChange.length);
          tree.commitUpdate(recorder);
          return true;
        });
    }
  };
}
