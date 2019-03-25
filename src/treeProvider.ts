"use strict";

import * as vscode from "vscode";
import * as path from "path";
import { YouTrack } from "./youtrack";

export class TreeProvider implements vscode.TreeDataProvider<YoutrackIssue> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    YoutrackIssue | undefined
  > = new vscode.EventEmitter<YoutrackIssue | undefined>();
  readonly onDidChangeTreeData: vscode.Event<YoutrackIssue | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(private youtrack: YouTrack) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: YoutrackIssue): vscode.TreeItem {
    return element;
  }

  getChildren(element?: YoutrackIssue): Thenable<YoutrackIssue[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return this.youtrack.getIssues().then(issues => {
        return issues.map(issue => {
          return new YoutrackIssue(
            `${issue.project!.name}-${issue.numberInProject}`,
            issue.description || issue.summary || "",
            vscode.TreeItemCollapsibleState.None
          );
        });
      });
    }
  }
}

export class YoutrackIssue extends vscode.TreeItem {
  constructor(
    private readonly issueId: string,
    private readonly issueDescription: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(`${issueId} - ${issueDescription}`, collapsibleState);
  }

  get tooltip(): string {
    return this.issueId;
  }

  get description(): string {
    return this.issueDescription;
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "resources", "light", "edit.svg"),
    dark: path.join(__filename, "..", "..", "resources", "dark", "edit.svg")
  };

  contextValue = "youtrackIssue";
}
