from kubernetes import client
from . import utils


def snapshot_from_dict(body, namespace):
    """
    body: json object (frontend json data).

    Convert the PVC json object that is sent from the backend to a python
    client PVC instance.
    """
    if body["annotations"] == {}:
        annotations = {"access_mode":
                       utils.get_pvc_access_mode(body["pvc_name"])}
    snapshot_resource = {
        "apiVersion": "snapshot.storage.k8s.io/v1beta1",
        "kind": "VolumeSnapshot",
        "metadata": {
            "name": body["name"],
            "annotations": annotations,
            "labels": body["labels"]
        },
        "spec": {
            "volumeSnapshotClassName":
                utils.get_snapshotclass_name(body["pvc_name"]),
            "source": {"persistentVolumeClaimName": body["pvc_name"]}
        }
    }

    return snapshot_resource
