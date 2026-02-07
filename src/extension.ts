import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: "fulkamp" },
      {
        provideDocumentSymbols(document) {
          const symbols: vscode.DocumentSymbol[] = [];

          for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;

            // @decorator → module
            const decorator = line.match(/^\s*@([\w-]+)/);
            if (decorator) {
              symbols.push(
                new vscode.DocumentSymbol(
                  `@${decorator[1]}`,
                  "",
                  vscode.SymbolKind.Module,
                  new vscode.Range(i, 0, i, line.length),
                  new vscode.Range(i, 0, i, line.length)
                )
              );
              continue;
            }

            // non-indented first word → function/object
            const topLevel = line.match(/^([a-zA-Z_][\w./-]*)\b/);
            if (topLevel) {
              symbols.push(
                new vscode.DocumentSymbol(
                  topLevel[1],
                  "",
                  vscode.SymbolKind.Function,
                  new vscode.Range(i, 0, i, line.length),
                  new vscode.Range(i, 0, i, line.length)
                )
              );
            }
          }

          return symbols;
        }
      }
    )
  );
}
