
import * as vscode from 'vscode';
import * as OpenCC from 'opencc-js';
export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel('OpenCCTranslator');

	function translateRange(editor: vscode.TextEditor, ranges: vscode.Range[], from: OpenCC.Locale, to: OpenCC.Locale) {
		vscode.window.withProgress({
			title: 'Translating...',
			location: vscode.ProgressLocation.Notification,
			cancellable: true
		}, async (p, ce) => {
			const c = OpenCC.Converter({ from: from, to: to });
			let i = 0;
			const t = ranges.length;
			for (const r of ranges) {
				if (ce.isCancellationRequested) {
					break;
				}
				i++;
				await new Promise<void>(e => setTimeout(e));
				const text = editor.document.getText(r);
				const lines = text.split(/\b/g);
				const l = lines.length;
				let lastReport = 0;
				for (let li = 0; li < l; li++) {
					let n = performance.now();
					if ((n - lastReport) > 100) {
						lastReport = n;
						if (ce.isCancellationRequested) {
							break;
						}
						p.report({
							message: `Selection:(${i}/${t}) Line:${Math.round(((li + 1) / l) * 100)}%`
						});
						await new Promise<void>(e => setTimeout(e));
					}
					if (/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(lines[li])) {
						lines[li] = lines[li].replace(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+/g, s => {
							const r = c(s);
							return r;
						});
					}
				}
				editor.edit(builder => {
					builder.replace(r, lines.join(''));
				});


			}
		});
	}
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.chs2cht', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			translateRange(editor, [new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end)], 'cn', 'tw');


		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.cht2chs', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			translateRange(editor, [new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end)], 'tw', 'cn');

		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.chs2cht_selection', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			translateRange(editor, editor.selections.map(x => new vscode.Range(x.start, x.end)), 'cn', 'tw');

		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-opencc.cht2chs_selection', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			translateRange(editor, editor.selections.map(x => new vscode.Range(x.start, x.end)), 'tw', 'cn');

		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
