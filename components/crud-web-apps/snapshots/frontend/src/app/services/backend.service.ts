import { Injectable } from '@angular/core';
import { BackendService, SnackBarService } from 'kubeflow';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnapshotResponseObject, SWABackendResponse, SnapshotPostObject } from '../types';

@Injectable({
  providedIn: 'root',
})
export class SWABackendService extends BackendService {
  constructor(public http: HttpClient, public snackBar: SnackBarService) {
    super(http, snackBar);
  }

  public getSnapshots(namespace: string): Observable<SnapshotResponseObject[]> {
    const url = `api/namespaces/${namespace}/snapshots`;

    return this.http.get<SWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: SWABackendResponse) => {
        return resp.snapshots;
      }),
    );
  }

  // POST
  public createSnapshot(namespace: string, snapshot: SnapshotPostObject) {
    const url = `api/namespaces/${namespace}/snapshots`;

    return this.http
      .post<SWABackendResponse>(url, snapshot)
      .pipe(catchError(error => this.handleError(error)));
  }

  // DELETE
  public deleteSnapshot(namespace: string, snapshot: string) {
    const url = `api/namespaces/${namespace}/snapshots/${snapshot}`;

    return this.http
      .delete<SWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }
}
