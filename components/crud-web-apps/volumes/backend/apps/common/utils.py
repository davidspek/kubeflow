from kubeflow.kubeflow.crud_backend import api, helpers
import random
import string
import json
import datetime as dt

from . import status


def parse_pvc(pvc):
    """
    pvc: client.V1PersistentVolumeClaim

    Process the PVC and format it as the UI expects it.
    """
    try:
        capacity = pvc.status.capacity["storage"]
    except Exception:
        capacity = pvc.spec.resources.requests["storage"]

    parsed_pvc = {
        "name": pvc.metadata.name,
        "namespace": pvc.metadata.namespace,
        "status": status.pvc_status(pvc),
        "age": {
            "uptime": helpers.get_uptime(pvc.metadata.creation_timestamp),
            "timestamp": pvc.metadata.creation_timestamp.strftime(
                "%d/%m/%Y, %H:%M:%S"
            ),
        },
        "capacity": capacity,
        "modes": pvc.spec.access_modes,
        "class": pvc.spec.storage_class_name,
    }

    return parsed_pvc


def parse_volumesnapshot(volumesnapshot):
    """Process the VolumeSnapshot and format it as the UI expects it."""
    try:
        modes = volumesnapshot["metadata"]["annotations"].get("access_modes")
        original_storage_class = volumesnapshot["metadata"]["annotations"].get("original_storage_class")
    except KeyError:
        modes = None
        original_storage_class = None

    parsed_volumesnapshot = {
        "name": volumesnapshot["metadata"]["name"],
        "namespace": volumesnapshot["metadata"]["namespace"],
        "status": status.volumesnapshot_status(volumesnapshot),
        "age": {
            "uptime": helpers.get_uptime(
                volumesnapshot["metadata"]["creationTimestamp"]),
            "timestamp": dt.datetime.strptime(
                volumesnapshot["metadata"]["creationTimestamp"],
                "%Y-%m-%dT%H:%M:%SZ"
            ),
        },
        "restoreSize": volumesnapshot["status"]["restoreSize"],
        "modes": modes,
        "originalStorageClass": original_storage_class,
        "snapshotClassName": volumesnapshot["spec"]["volumeSnapshotClassName"],
        "source":
        volumesnapshot["spec"]["source"]["persistentVolumeClaimName"],
    }

    return parsed_volumesnapshot


def get_pods_using_pvc(pvc, namespace):
    """
    Return a list of Pods that are using the given PVC
    """
    pods = api.list_pods(namespace)
    mounted_pods = []

    for pod in pods.items:
        pvcs = get_pod_pvcs(pod)
        if pvc in pvcs:
            mounted_pods.append(pod)

    return mounted_pods


def get_pod_pvcs(pod):
    """
    Return a list of PVC name that the given Pod
    is using. If it doesn't use any, then an empty list will
    be returned.
    """
    pvcs = []
    if not pod.spec.volumes:
        return []

    vols = pod.spec.volumes
    for vol in vols:
        # Check if the volume is a pvc
        if not vol.persistent_volume_claim:
            continue

        pvcs.append(vol.persistent_volume_claim.claim_name)

    return pvcs


def generate_snapshot_annotations(pvc_name, namespace):
    """Generate the annotations added to a snapshot resource."""
    pvc = api.get_pvc(pvc_name, namespace)
    annotations = {
        "access_modes": json.dumps(pvc.spec.access_modes),
        "original_storage_class": json.dumps(pvc.spec.storage_class_name)
    }
    return annotations


def generate_uuid():
    """Generate a 8 character UUID for snapshot names and versioning."""
    alphabet = string.ascii_lowercase + string.digits
    return '-' + ''.join(random.choices(alphabet, k=8))
