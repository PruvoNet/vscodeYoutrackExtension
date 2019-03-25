'use strict';

import * as vscode from "vscode";
import * as childProcess from "child_process";

export class GitHandler {
    branch(branchName: string) {
        childProcess.exec(
            'git checkout -b "' + branchName + '"',
            {
                cwd: vscode.workspace.rootPath
            },
            (err, stdout, stderr) => {
                if (err) {
                    vscode.window.showErrorMessage("Git create branch error:" + err);
                    return;
                }
                vscode.window.showInformationMessage(stderr);
            }
        );
    }

    currentBranch(): Promise<string> {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                "git symbolic-ref --short HEAD",
                {
                    cwd: vscode.workspace.rootPath
                },
                (err, stdout, stderr) => {
                    if (err) {
                        reject(err);
                    } else resolve(stdout);
                }
            );
        });
    }

    checkout(branchName: string) {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                "git checkout " + branchName,
                {
                    cwd: vscode.workspace.rootPath
                },
                (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage("Git checkout error:" + err);
                        reject(err);
                    } else resolve();
                }
            );
        });
    }

    merge(branchName: string) {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                "git merge " + branchName,
                {
                    cwd: vscode.workspace.rootPath
                },
                (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage("Git merge error:" + err);
                        reject(err);
                    } else resolve();
                }
            );
        });
    }

    deleteBranch(branchName: string) {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                'git branch -d "' + branchName + '"',
                {
                    cwd: vscode.workspace.rootPath
                },
                (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage("Git delete branch error:" + err);
                        reject(err);
                    } else resolve();
                }
            );
        });
    }
}