from kubeflow.kubeflow.crud_backend import api, logging

from ...common import utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/snapshots")
def get_snapshots(namespace):
    """Return the list of Snapshots."""
    snapshots = api.list_snapshots(namespace)
    content = [utils.parse_snapshot(snapshot)
               for snapshot in snapshots["items"]]

    return api.success_response("snapshots", content)
