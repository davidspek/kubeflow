import os

from werkzeug import exceptions
from kubeflow.kubeflow.crud_backend import api, helpers, status, logging

from ..common import utils as common_utils

log = logging.getLogger(__name__)

KIND = "PVCViewer"
GROUP = "pvcviewer.kubeflow.org"
VERSION = "v1alpha1"
PLURAL = "pvcviewers"
PVCVIEWER = [GROUP, VERSION, PLURAL]

DEV_CONFIG = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "pvcviewer.yaml"
)

PVCVIEWER_YAML = [
    "/etc/config/pvcviewer.yaml",
    DEV_CONFIG,
]


def load_pvcviewer_yaml_template(**kwargs):
    """
    kwargs: the parameters to be replaced in the yaml

    Reads the yaml for the web app's custom resource, replaces the variables
    and returns it as a python dict.
    """
    for viewer_yaml in PVCVIEWER_YAML:
        viewer_dict = helpers.load_param_yaml(viewer_yaml, **kwargs)

        if viewer_dict is not None:
            log.info("Using config file: %s", viewer_yaml)
            return viewer_dict

    log.error("Couldn't find any config file.")
    raise exceptions.NotFound("Couldn't find any config file.")


def parse_pvc(pvc, viewers):
    """
    pvc: client.V1PersistentVolumeClaim
    viewers: dict(Key:PVC Name, Value: Viewer's Status)

    Process the PVC and format it as the UI expects it. If a Viewer is active
    for that PVC, then include this information
    """
    parsed_pvc = common_utils.parse_pvc(pvc)
    parsed_pvc["pvcviewer"] = viewers.get(pvc.metadata.name,
                                          status.STATUS_PHASE.UNINITIALIZED)
    try:
        parsed_pvc["volumesnapshotClass"] = api.get_volumesnapshotclass(
            pvc.metadata.name, pvc.metadata.namespace)
    except KeyError:
        return

    return parsed_pvc


def get_viewer_owning_pod(pod):
    """
    Return a list of PVCViewer names that own the Pod
    """
    owner_label = pod.metadata.labels.get("kind")
    if owner_label == KIND:
        return pod.metadata.labels.get("app")

    return None


def is_viewer_pod(pod):
    """
    Checks if the given Pod belongs to a PVCViewer
    """
    return get_viewer_owning_pod(pod) is not None


def get_viewers_owning_pods(pods):
    """
    Return the name of PVCViewers that own a subset of the given Pods
    """
    viewers = []
    for pod in pods:
        if not is_viewer_pod(pod):
            continue

        viewers.append(get_viewer_owning_pod(pod))

    return viewers
