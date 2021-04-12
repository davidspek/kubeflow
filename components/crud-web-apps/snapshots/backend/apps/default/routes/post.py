from flask import request

from kubeflow.kubeflow.crud_backend import api, decorators, logging

from ...common import form
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/snapshots", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("snapshot_name", "pvc_name",
                                 "labels", "annotations")
def post_snapshot(namespace):
    body = request.get_json()
    log.info("Received body: %s", body)

    snapshot = form.snapshot_from_dict(body, namespace)

    log.info("Creating Snapshot '%s'...", snapshot)
    api.create_snapshot(snapshot, namespace)
    log.info("Successfully created Snapshot %s/%s",
             namespace, snapshot["metadata"]["name"])

    return api.success_response("message", "Snapshot created successfully.")
