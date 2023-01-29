
import * as vscode from 'vscode';
import * as OpenCC from 'opencc-js';
export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel('OpenCCTranslator');
	function translate(text: string, from: OpenCC.Locale, to: OpenCC.Locale): string {
		const c = OpenCC.Converter({ from: from, to: to });

		return text.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+/g, s => {
			const r = c(s);
			output.appendLine(`[${from}=>${to}](${s})=>(${r})`);
			return r;
		});
	}
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.chs2cht', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(builder => {
				builder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end),
					translate(document.getText(), 'cn', 'tw'));
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.cht2chs', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(builder => {
				builder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end),
					translate(document.getText(), 'cn', 'tw'));
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.chs2cht_selection', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(builder => {
				editor.selections.forEach(selection => {
					builder.replace(selection, translate(document.getText(selection), 'cn', 'tw'));
				});
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.cht2chs_selection', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(builder => {
				editor.selections.forEach(selection => {
					builder.replace(selection, translate(document.getText(selection), 'tw', 'cn'));
				});
			});
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
