import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
   context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
         { language: "fulkamp" },
         {
            provideDocumentSymbols(document) {
               const symbols: vscode.DocumentSymbol[] = [];
               let currentBlock: vscode.DocumentSymbol | null = null;

               for (let i = 0; i < document.lineCount; i++) {
                  const line = document.lineAt(i).text;

                  // 1️⃣ Decorator → parent block
                  const decorator = line.match(/^\s*@([\w-]+)/);
                  if (decorator) {
                     const block = new vscode.DocumentSymbol(
                        `${decorator[1]}`,
                        "",
                        vscode.SymbolKind.Class,
                        new vscode.Range(i, 0, i, line.length),
                        new vscode.Range(i, 0, i, line.length),
                     );

                     symbols.push(block);
                     currentBlock = block;
                     continue;
                  }

                  // 2️⃣ Top-level non-indented line → child of decorator
                  const child = line.match(/^([a-zA-Z_][\w./-]*)\b/);
                  if (child && currentBlock) {
                     currentBlock.children.push(
                        new vscode.DocumentSymbol(
                           child[1],
                           "",
                           vscode.SymbolKind.Constructor,
                           new vscode.Range(i, 0, i, line.length),
                           new vscode.Range(i, 0, i, line.length),
                        ),
                     );
                  }
               }

               return symbols;
            },
         },
      ),
   );
}
