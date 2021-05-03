from flask import request

from kubeflow.kubeflow.crud_backend import api, decorators, logging

from ...common import form
from ...common import utils as common_utils
from .. import utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/pvcviewers", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("name")
def post_viewer(namespace):
    body = request.get_json()
    log.info("Received body: %s", body)

    name = body["name"]
    viewer = utils.load_pvcviewer_yaml_template(name=name,
                                                namespace=namespace)

    log.info("Creating PVCViewer '%s'...", viewer)
    api.create_custom_rsrc(*utils.PVCVIEWER, viewer, namespace)
    log.info("Successfully created PVCViewer %s/%s", namespace, name)

    return api.success_response("message", "PVCViewer created successfully.")


@bp.route("/api/namespaces/<namespace>/pvcs", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("name", "mode", "class", "size", "type")
def post_pvc(namespace):
    body = request.get_json()
    log.info("Received body: %s", body)

    pvc = form.pvc_from_dict(body, namespace)

    log.info("Creating PVC '%s'...", pvc)
    api.create_pvc(pvc, namespace)
    log.info("Successfully created PVC %s/%s", namespace, pvc.metadata.name)

    return api.success_response("message", "PVC created successfully.")


@bp.route("/api/namespaces/<namespace>/volumesnapshots", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("pvcName")
def post_snapshot(namespace):
    body = request.get_json()
    log.info("Received body: %s", body)

    if not body.get("snapshotName"):
        body["snapshotName"] = body["pvcName"] + common_utils.generate_uuid()

    body.get("annotations")
    if not body.get("annotations"):
        body["annotations"] = common_utils.generate_snapshot_annotations(
            body["pvcName"], namespace)

    volumesnapshot = form.volumesnapshot_from_dict(body, namespace)

    log.info("Creating VolumeSnapshot '%s'...", volumesnapshot)
    api.create_volumesnapshot(volumesnapshot, namespace)
    log.info("Successfully created PVC %s/%s",
             namespace, volumesnapshot["metadata"]["name"])

    return api.success_response(
        "message", "VolumeSnapshot created successfully.")
