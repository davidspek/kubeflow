import { Injectable } from '@angular/core';
import { BackendService, SnackBarService } from 'kubeflow';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  WorkflowResponseObject,
  BWABackendResponse,
  Config,
  WorkflowFormObject,
  WorkflowProcessedObject,
} from '../types';

@Injectable({
  providedIn: 'root',
})
export class BWABackendService extends BackendService {
  constructor(public http: HttpClient, public snackBar: SnackBarService) {
    super(http, snackBar);
  }

  // GET
  public getWorkflows(namespace: string): Observable<WorkflowResponseObject[]> {
    const url = `api/namespaces/${namespace}/workflows`;

    return this.http.get<BWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: BWABackendResponse) => {
        return resp.workflows;
      }),
    );
  }

  public getConfig(): Observable<Config> {
    const url = `api/config`;

    return this.http.get<BWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => {
        return data.config;
      }),
    );
  }

  // POST
  public createWorkflow(workflow: WorkflowFormObject): Observable<string> {
    const url = `api/namespaces/${workflow.namespace}/workflows`;

    return this.http.post<BWABackendResponse>(url, workflow).pipe(
      catchError(error => this.handleError(error)),
      map(_ => {
        return 'posted';
      }),
    );
  }

  // DELETE
  public deleteWorkflow(namespace: string, name: string) {
    const url = `api/namespaces/${namespace}/workflows/${name}`;

    return this.http
      .delete<BWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }
}
