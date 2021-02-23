import os

from kubernetes import client
from werkzeug import exceptions

from kubeflow.kubeflow.crud_backend import helpers, logging

from . import status

log = logging.getLogger(__name__)

FILE_ABS_PATH = os.path.abspath(os.path.dirname(__file__))

KANIKO_ARGO_TEMPLATE_YAML = os.path.join(
    FILE_ABS_PATH, "yaml/kaniko_argo_template.yaml"
)

# The production configuration is mounted on the app's pod via a configmap
DEV_CONFIG = os.path.join(FILE_ABS_PATH, "yaml/builder_ui_config.yaml")
CONFIGS = [
    "/etc/config/builder_ui_config.yaml",
    DEV_CONFIG,
]


def load_kaniko_argo_template(**kwargs):
    """
    kwargs: the parameters to be replaced in the yaml

    Reads the yaml for the web app's custom resource, replaces the variables
    and returns it as a python dict.
    """
    return helpers.load_param_yaml(KANIKO_ARGO_TEMPLATE_YAML, **kwargs)


def load_spawner_ui_config():
    for config in CONFIGS:
        config_dict = helpers.load_yaml(config)

        if config_dict is not None:
            log.info("Using config file: %s", config)
            return config_dict["spawnerFormDefaults"]

    log.error("Couldn't find any config file.")
    raise exceptions.NotFound("Couldn't find any config file.")


def notebook_dict_from_k8s_obj(notebook):
    cntr = notebook["spec"]["template"]["spec"]["containers"][0]

    return {
        "name": notebook["metadata"]["name"],
        "namespace": notebook["metadata"]["namespace"],
        "age": helpers.get_uptime(notebook["metadata"]["creationTimestamp"]),
        "image": cntr["image"],
        "shortImage": cntr["image"].split("/")[-1],
        "cpu": cntr["resources"]["requests"]["cpu"],
        "gpus": process_gpus(cntr),
        "memory": cntr["resources"]["requests"]["memory"],
        "volumes": [v["name"] for v in cntr["volumeMounts"]],
        "status": status.process_status(notebook),
    }
