from kubernetes import client
from . import utils
from kubeflow.kubeflow.crud_backend import api


def handle_storage_class(vol):
    """
    vol: dict (send from the frontend)

    If the fronend sent the special values `{none}` or `{empty}` then the
    backend will need to set the corresponding storage_class value that the
    python client expects.
    """
    if "class" not in vol:
        return None
    if vol["class"] == "{none}":
        return ""
    if vol["class"] == "{empty}":
        return None
    else:
        return vol["class"]


def pvc_from_dict(body, namespace):
    """
    body: json object (frontend json data)

    Convert the PVC json object that is sent from the backend to a python
    client PVC instance.
    """
    if body["type"] == "empty":
        return client.V1PersistentVolumeClaim(
            metadata=client.V1ObjectMeta(name=body["name"],
                                         namespace=namespace),
            spec=client.V1PersistentVolumeClaimSpec(
                access_modes=[body["mode"]],
                storage_class_name=handle_storage_class(body),
                resources=client.V1ResourceRequirements(
                    requests={"storage": body["size"]}
                ),
            ),
        )
    elif body["type"] == "snapshot":
        return client.V1PersistentVolumeClaim(
            metadata=client.V1ObjectMeta(name=body["name"],
                                         namespace=namespace),
            spec=client.V1PersistentVolumeClaimSpec(
                access_modes=[body["mode"]],
                data_source=client.V1TypedLocalObjectReference(
                    api_group="snapshot.storage.k8s.io",
                    kind="VolumeSnapshot",
                    name=body["snapshot"],
                ),
                storage_class_name=handle_storage_class(body),
                resources=client.V1ResourceRequirements(
                    requests={"storage": body["size"]}
                ),
            ),
        )


def volumesnapshot_from_dict(body, namespace):
    """
    body: json object (frontend json data)

    Convert the VolumeSnapshot json object that is sent from the backend to a
    properly formatted custom object json body.
    """
    return {
        "apiVersion": "snapshot.storage.k8s.io/v1beta1",
        "kind": "VolumeSnapshot",
        "metadata": {
            "name": body["snapshotName"],
            "namespace": namespace,
            "annotations": body["annotations"],
            "labels": body.get("labels")
        },
        "spec": {
            "volumeSnapshotClassName": api.get_volumesnapshotclass(
                body["pvcName"], namespace),
            "source": {"persistentVolumeClaimName": body["pvcName"]}
        }
    }
