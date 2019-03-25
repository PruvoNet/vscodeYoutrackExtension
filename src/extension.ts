"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import * as pug from "pug";
import { ReducedIssue } from "youtrack-rest-client";
import { GitHandler } from "./gitHandler";
import { YouTrack } from "./youtrack";
import { TreeProvider } from "./treeProvider";

export function activate(context: vscode.ExtensionContext) {
  let globalIssues: ReducedIssue[];

  class TD implements vscode.TextDocumentContentProvider {
    public provideTextDocumentContent(uri: any, token: any): string {
      const compiledFunction = pug.compileFile(__dirname + "/index.pug");
      return compiledFunction({
        issues: globalIssues
      });
    }
  }

  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    250
  );
  status.command = "youtrack.list";
  status.text = "Youtrack";
  status.show();
  context.subscriptions.push(status);

  let registryJSON: any;
  fs.readFile(__dirname + "/registry.json", "utf-8", (err, data) => {
    if (!err) {
      registryJSON = JSON.parse(data);
      if (registryJSON["opened"] !== undefined) {
        status.text = registryJSON["opened"];
      }
    } else registryJSON = {};
  });

  function registryJSONUpdate() {
    fs.writeFile(
      __dirname + "/registry.json",
      JSON.stringify(registryJSON),
      err => {
        vscode.window.showErrorMessage(err.message);
      }
    );
  }

  let provider = new TD();
  let registration = vscode.workspace.registerTextDocumentContentProvider(
    "youtrack-preview",
    provider
  );
  context.subscriptions.push(registration);

  const git = new GitHandler();
  const yt = new YouTrack("youtrack");
  const treeProvider = new TreeProvider(yt);
  vscode.window.registerTreeDataProvider("youtrack", treeProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand("youtrack.branch", (issueId: string) => {
      vscode.window
        .showInputBox({
          placeHolder: issueId,
          prompt: "Enter the name to new git branch"
        })
        .then((value: string | undefined) => {
          if (value) {
            git.currentBranch().then((branchName: string) => {
              registryJSON["parentBranch"] = branchName.trim();
              registryJSON["opened"] = issueId;
              registryJSON["currentBranch"] = value;
              registryJSONUpdate();
              status.text = issueId;
              git.branch(value);
              yt.setIssueInProgress(issueId).catch(err =>
                vscode.window.showErrorMessage(err)
              );
            });
          }
        });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("youtrack.closeIssue", () => {
      git
        .checkout(registryJSON["parentBranch"])
        .then(() => git.merge(registryJSON["currentBranch"]))
        .then(() => git.deleteBranch(registryJSON["currentBranch"]))
        .then(() => yt.setIssueFixed(registryJSON["currentBranch"]))
        .then(() => {
          delete registryJSON["parentBranch"];
          delete registryJSON["opened"];
          delete registryJSON["currentBranch"];
          registryJSONUpdate();
          status.text = "Youtrack";
        });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("youtrack.list", () => {
      yt.getIssues()
        .then(issues => {
          globalIssues = issues;
          return vscode.commands.executeCommand(
            "vscode.previewHtml",
            vscode.Uri.parse("youtrack-preview://test"),
            vscode.ViewColumn.Two,
            "Youtrack Issue List"
          );
        })
        .catch(err => {
          vscode.window.showErrorMessage(err);
        });
    })
  );
}
