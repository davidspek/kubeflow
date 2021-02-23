from kubeflow.kubeflow.crud_backend import api, logging

from . import bp

log = logging.getLogger(__name__)


@bp.route(
    "/api/namespaces/<namespace>/workflows/<workflow>", methods=["DELETE"]
)
def delete_workflow(workflow, namespace):
    log.info(f"Deleting Notebook '{namespace}/{workflow}'")
    api.delete_notebook(workflow, namespace)

    return api.success_response(
        "message", f"Image build task {workflow} successfully deleted."
    )
