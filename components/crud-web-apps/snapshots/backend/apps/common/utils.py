import datetime as dt
from kubeflow.kubeflow.crud_backend import api, helpers
from . import status

KIND = "VolumeSnapshot"
GROUP = "snapshot.storage.k8s.io"
VERSION = "v1beta1"
PLURAL = "volumesnapshots"
SNAPSHOT = [GROUP, VERSION, PLURAL]


def parse_snapshot(snapshot):
    """
    pvc: client.V1PersistentVolumeClaim

    Process the PVC and format it as the UI expects it.
    """

    parsed_snapshot = {
        "name": snapshot["metadata"]["name"],
        "namespace": snapshot["metadata"]["namespace"],
        "status": status.snapshot_status(snapshot),
        "age": {
            "uptime": helpers.get_uptime(
                snapshot["metadata"]["creationTimestamp"]),
            "timestamp": dt.datetime.strptime(
                snapshot["metadata"]["creationTimestamp"],
                "%Y-%m-%dT%H:%M:%SZ")
        },
        "restoreSize": snapshot["status"].get("restoreSize"),
        "source": snapshot["spec"].get("source"),
        "class": snapshot["spec"].get("volumeSnapshotClassName"),
    }

    return parsed_snapshot


def get_snapshotclass_name(pvc_name, namespace, label_selector=""):
    """Get the Volume Snapshot Class Name for a PVC."""
    pvc = api.get_pvc(pvc_name, namespace)
    ann = pvc["metadata"]["annotations"]
    provisioner = ann.get("volume.beta.kubernetes.io/storage-provisioner",
                          None)
    snapshotclasses = get_snapshotclasses(label_selector)
    return [snapclass_name["metadata"]["name"] for snapclass_name in
            snapshotclasses if snapclass_name["driver"] == provisioner][0]


def get_snapshotclasses(label_selector=""):
    """List snapshotclasses."""
    snapshotclasses = api.custom_api.list_cluster_custom_object(
        group=GROUP,
        version=VERSION,
        plural="volumesnapshotclasses",
        label_selector=label_selector)
    return snapshotclasses.get("items")


def get_pvc_access_mode(pvc_name, namespace):
    """Get the access mode of a PVC."""
    pvc = api.get_pvc(pvc_name, namespace)
    return pvc.spec.access_modes[0]


def list_snapshotclass_storage_provisioners(label_selector=""):
    """List the storage provisioners of the snapshotclasses."""
    return [snap_prov["driver"] for
            snap_prov in get_snapshotclasses(label_selector)]


def check_snapshot_availability(pod_name, namespace):
    """Check if snapshotclasses are available for notebook."""
    pod = api.v1_core.read_namespaced_pod(pod_name, namespace)
    snapshotclass_provisioners = list_snapshotclass_storage_provisioners()

    for volume in pod.spec.volumes:
        pvc = volume.persistent_volume_claim
        if not pvc:
            continue
        pvc_name = api.get_pvc(pvc.claim_name, namespace)

        ann = pvc_name.metadata.annotations
        provisioner = ann.get("volume.beta.kubernetes.io/storage-provisioner")
        if provisioner not in snapshotclass_provisioners:
            msg = ("Found PVC storage provisioner '%s'. "
                   "Only storage provisioners able to take snapshots "
                   "are supported."
                   % (provisioner))
            raise RuntimeError(msg)


def get_snapshotclass_provisioners_names():
    """Get the names of snapshotclass storage provisioners."""
    classes = api.storage_api.list_storage_class().items
    snapshotclass_provisioners = list_snapshotclass_storage_provisioners()
    return [stor_class.metadata.name for stor_class in classes
            if stor_class.provisioner in snapshotclass_provisioners]
