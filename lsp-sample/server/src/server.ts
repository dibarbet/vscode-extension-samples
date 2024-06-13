/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReportKind,
	type DocumentDiagnosticReport,
	DidChangeTextDocumentNotification,
	TextDocumentRegistrationOptions
} from 'vscode-languageserver/node';


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
		}
	};
	return result;
});

connection.onInitialized(() => {
});


connection.onDidChangeTextDocument((change) => {
	connection.console.log("Server didChange triggered: " + change.contentChanges[0].text);
});

connection.onRequest('custom/request', (params) => {
	connection.console.log(`Server custom request for ${params.caller} triggered: ${params.content}`);
});

// Listen on the connection
connection.listen();
