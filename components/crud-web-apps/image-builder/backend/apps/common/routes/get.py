from kubeflow.kubeflow.crud_backend import api, logging

from .. import utils
from . import bp

log = logging.getLogger(__name__)


@bp.route("/api/config")
def get_config():
    config = utils.load_builder_ui_config()
    return api.success_response("config", config)


@bp.route("/api/namespaces/<namespace>/workflows")
def get_workflows(namespace):
    workflows = api.list_workflows(namespace)["items"]
    contents = [utils.notebook_dict_from_k8s_obj(wf) for wf in workflows]

    return api.success_response("workflows", contents)
