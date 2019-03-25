"use strict";

import * as vscode from "vscode";
import { Youtrack, ReducedIssue } from "youtrack-rest-client";

export class YouTrack {
  constructor(private configurationRoot: string) {}

  public setIssueInProgress(issueId: string): Promise<void> {
    return this.getYouTrack()
      .issues.executeCommand({
        query: "State In Progress",
        issues: [
          {
            id: issueId
          }
        ]
      })
      .then(() => Promise.resolve());
  }

  public setIssueFixed(issueId: string): Promise<void> {
    return this.getYouTrack()
      .issues.executeCommand({
        query: "State Fixed",
        issues: [
          {
            id: issueId
          }
        ]
      })
      .then(() => Promise.resolve());
  }

  public getIssues(): Promise<ReducedIssue[]> {
    const config = vscode.workspace.getConfiguration(this.configurationRoot);
    return this.getYouTrack().issues.search(config.get("filter", ""));
  }

  private getYouTrack() {
    const config = vscode.workspace.getConfiguration(this.configurationRoot);
    return new Youtrack({
      token: config.get("token", ""),
      baseUrl: config.get("baseUrl", "")
    });
  }
}
