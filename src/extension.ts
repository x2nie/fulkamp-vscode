import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
   context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
         { language: "fulkamp" },
         {
            provideDocumentSymbols(document) {
               const rootSymbols: vscode.DocumentSymbol[] = [];

               let currentRegion: vscode.DocumentSymbol | null = null;
               let currentBlock: vscode.DocumentSymbol | null = null;

               for (let i = 0; i < document.lineCount; i++) {
                  const text = document.lineAt(i).text;
                  const line = text.trim();

                  if (!line) continue;

                  // 1️⃣ Region start  (" #region Name)
                  const regionStart = text.match(/^\s*"\s*#region\s+(.*)$/);
                  if (regionStart) {
                     const region = new vscode.DocumentSymbol(
                        regionStart[1],
                        "",
                        vscode.SymbolKind.Module,
                        document.lineAt(i).range,
                        document.lineAt(i).range,
                     );
                     rootSymbols.push(region);
                     currentRegion = region;
                     currentBlock = null;
                     continue;
                  }

                  // 2️⃣ Region end
                  if (/^\s*"\s*#endregion\b/.test(text)) {
                     currentRegion = null;
                     currentBlock = null;
                     continue;
                  }

                  // 3️⃣ Decorator
                  if (line.startsWith("@")) {
                     const name = line.slice(1).split(/\s+/)[0];
                     const block = new vscode.DocumentSymbol(
                        `${name}`,
                        "",
                        vscode.SymbolKind.Class,
                        document.lineAt(i).range,
                        document.lineAt(i).range,
                     );

                     if (currentRegion) {
                        currentRegion.children.push(block);
                     } else {
                        rootSymbols.push(block);
                     }

                     currentBlock = block;
                     continue;
                  }

                  // 4️⃣ Top-level object (seekBar / vista/buttons.png)
                  if (!text.startsWith(" ") && !text.trim().startsWith('"') && currentBlock) {
                     const name = line.split(/\s+/)[0];
                     currentBlock.children.push(
                        new vscode.DocumentSymbol(
                           name,
                           "",
                           vscode.SymbolKind.Constructor,
                           document.lineAt(i).range,
                           document.lineAt(i).range,
                        ),
                     );
                  }
               }

               return rootSymbols;
            },
         },
      ),
   );
}
