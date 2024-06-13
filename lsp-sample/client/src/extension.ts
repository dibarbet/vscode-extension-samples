/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, window, Position, commands } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	Trace,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	const channel = window.createOutputChannel('TESTING');

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		outputChannel: channel,
		traceOutputChannel: channel,
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	client.setTrace(Trace.Verbose);

	workspace.onDidChangeTextDocument(async e => {
		if (e.document.languageId === 'plaintext' && e.contentChanges.length > 0)
		{
			channel.appendLine("Client workspace.onDidChangeTextDocument triggered: " + e.contentChanges[0].text);
			await client.sendRequest('custom/request', { content: e.contentChanges[0].text, caller: 'workspace.onDidChangeTextDocument' });
		}
		
	});

	client.getFeature('textDocument/didChange').onNotificationSent(async e => {
		channel.appendLine("Client didChange onNotificationSent triggered: " + e.params.contentChanges[0].text);
		await client.sendRequest('custom/request', { content: e.params.contentChanges[0].text, caller: 'onNotificationSent' });
	});

	commands.registerCommand('extension.sayHello', () => {
		window.activeTextEditor!.edit(editBuilder => {
			editBuilder.insert(new Position(0, 0), "Hello World!");
		});
	});
	

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

// Result ordering:
// Client workspace.onDidChangeTextDocument triggered: 1
// Client didChange onNotificationSent triggered: 1
// Server custom request for workspace.onDidChangeTextDocument triggered: 1
// Server didChange triggered: 1
// Server custom request for onNotificationSent triggered: 1
