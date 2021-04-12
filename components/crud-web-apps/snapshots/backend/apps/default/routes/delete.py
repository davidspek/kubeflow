from kubeflow.kubeflow.crud_backend import api, logging

from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/snapshots/<snapshot>", methods=["DELETE"])
def delete_snapshot(snapshot, namespace):
    """Delete a Snapshot."""
    log.info(f"Deleting Snapshot '{namespace}/{snapshot}'")
    api.delete_snapshot(snapshot, namespace)

    return api.success_response(
        "message", f"Notebook {snapshot} successfully deleted."
    )
