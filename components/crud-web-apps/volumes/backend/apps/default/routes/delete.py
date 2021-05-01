from werkzeug import exceptions

from kubeflow.kubeflow.crud_backend import api, logging

from ...common import utils as common_utils
from .. import utils as viewer_utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/pvcs/<pvc>", methods=["DELETE"])
def delete_pvc(pvc, namespace):
    """
    Delete a PVC, even if it is only mounted on PVCViewer Pods.
    Get list of PVCViewers that use the requested PVC. If no other Pods
    are using that PVC then delete the Viewer Pods as well as the PVC.
    """
    pods = common_utils.get_pods_using_pvc(pvc, namespace)
    non_viewer_pods = [p for p in pods if not viewer_utils.is_viewer_pod(p)]
    if non_viewer_pods:
        pod_names = [p.metadata.name for p in non_viewer_pods]
        raise exceptions.Conflict("Cannot delete PVC '%s' because it is being"
                                  " used by pods: %s" % (pvc, pod_names))

    viewers = [viewer_utils.get_viewer_owning_pod(p) for p in pods]
    if viewers:
        [delete_pvcviewer(v, namespace) for v in viewers]

    log.info("Deleting PVC %s/%s...", namespace, pvc)
    api.delete_pvc(pvc, namespace)
    log.info("Successfully deleted PVC %s/%s", namespace, pvc)

    return api.success_response("message",
                                "PVC %s successfully deleted." % pvc)


@bp.route("/api/namespaces/<namespace>/pvcviewers/<pvcviewer>", methods=["DELETE"])
def delete_pvcviewer(pvcviewer, namespace):
    """
    Delete a PVCViewer.
    """
    log.info("Deleting PVCViewer %s/%s...", namespace, pvcviewer)
    api.delete_custom_rsrc(*viewer_utils.PVCVIEWER, pvcviewer, namespace)
    log.info("Successfully deleted PVCViewer %s/%s", namespace, pvcviewer)

    return api.success_response("message",
                                "PVCViewer %s successfully deleted."
                                % pvcviewer)
