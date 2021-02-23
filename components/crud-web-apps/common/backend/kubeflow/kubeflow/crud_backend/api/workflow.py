from kubernetes import client

from .. import authz
from . import custom_api, v1_core


def get_workflow(workflow, namespace):
    authz.ensure_authorized(
        "get", "argoproj.io", "v1alpha1", "workflows", namespace
    )
    return custom_api.get_namespaced_custom_object(
        "argoproj.io", "v1alpha1", namespace, "workflows", workflow
    )


def create_workflow(workflow, namespace):
    authz.ensure_authorized(
        "create", "argoproj.io", "v1alpha1", "workflows", namespace
    )
    return custom_api.create_namespaced_custom_object(
        "argoproj.io", "v1alpha1", namespace, "workflows", workflow
    )


def list_workflows(namespace):
    authz.ensure_authorized(
        "list", "argoproj.io", "v1alpha1", "workflows", namespace
    )
    return custom_api.list_namespaced_custom_object(
        "argoproj.io", "v1alpha1", namespace, "workflows"
    )


def delete_workflow(workflow, namespace):
    authz.ensure_authorized(
        "delete", "argoproj.io", "v1alpha1", "workflows", namespace
    )
    return custom_api.delete_namespaced_custom_object(
        "argoproj.io",
        "v1alpha1",
        namespace,
        "workflows",
        workflow,
        client.V1DeleteOptions(propagation_policy="Foreground"),
    )


def list_workflow_events(workflow, namespace):
    selector = "involvedObject.kind=workflow,involvedObject.name=" + workflow

    return v1_core.list_namespaced_event(
        namespace=namespace, field_selector=selector
    )
