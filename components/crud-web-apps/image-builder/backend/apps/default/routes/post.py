from flask import request

from kubeflow.kubeflow.crud_backend import (api, decorators, helpers,
                                                  logging)

from ...common import form, utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/namespaces/<namespace>/workflows", methods=["POST"])
@decorators.request_is_json_type
@decorators.required_body_params("name")
def post_pvc(namespace):
    body = request.get_json()
    log.info(f"Got body: {body}")

    argo_workflow = helpers.load_param_yaml(
        utils.KANIKO_ARGO_TEMPLATE_YAML,
        name=body["name"],
        namespace=namespace,
        serviceAccount="default-editor",
    )

    defaults = utils.load_kaniko_argo_template()

    form.set_base_image(argo_workflow, body, defaults)
    form.set_pip_packages(argo_workflow, body, defaults)
    form.set_conda_packages(argo_workflow, body, defaults)
    form.set_image_destination(argo_workflow, body, defaults)
    form.set_secret_name(argo_workflow, body, defaults)

    return api.success_response("message", "Image build job created successfully.")
