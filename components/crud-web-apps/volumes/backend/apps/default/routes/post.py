from flask import request

from kubeflow.kubeflow.crud_backend import api, decorators, logging

from ...common import form
from .. import utils as viewer_utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/pvcviewers", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("name")
def post_viewer(namespace):
    body = request.get_json()
    log.info("Received body: %s", body)

    name = body["name"]
    viewer = viewer_utils.load_pvcviewer_yaml_template(name=name,
                                                    namespace=namespace)

    log.info("Creating PVCViewer '%s'...", viewer)
    api.create_custom_rsrc(*viewer_utils.PVCVIEWER, viewer, namespace)
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
