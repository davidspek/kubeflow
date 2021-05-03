from .. import authz
from . import custom_api
from . import get_pvc
from . import storage_api
from werkzeug import exceptions
import logging

log = logging.getLogger(__name__)


def list_volumesnapshotclasses(label_selector=""):
    """List snapshotclasses."""
    authz.ensure_authorized(
        "list", "snapshot.storage.k8s.io", "v1beta1",
        "volumesnapshotclasses"
    )
    return custom_api.list_cluster_custom_object(
        "snapshot.storage.k8s.io", "v1beta1",
        "volumesnapshotclasses"
    )


def list_volumesnapshotclass_storage_provisioners(label_selector=""):
    """List the storage provisioners of the snapshotclasses."""
    return [snap_prov["driver"] for snap_prov in
            list_volumesnapshotclasses(label_selector).get("items")]


def get_volumesnapshotclass(pvc, namespace):
    """Get volumesnapshotclass for a pvc."""
    snapshot_provisioners = list_volumesnapshotclass_storage_provisioners()
    pvc_resource = get_pvc(pvc, namespace)
    snapshotclasses = list_volumesnapshotclasses()
    ann = pvc_resource.metadata.annotations
    provisioner = ann.get("volume.beta.kubernetes.io/storage-provisioner")

    if provisioner in snapshot_provisioners:
        return [snapclass_name["metadata"]["name"] for snapclass_name in
                snapshotclasses["items"] if
                snapclass_name["driver"] == provisioner][0]


def check_volumesnapshotclass(pvc, namespace):
    """Check if snapshotclasses is available for pvc."""
    snapshot_provisioners = list_volumesnapshotclass_storage_provisioners()
    pvc_resource = get_pvc(pvc, namespace)
    ann = pvc_resource.metadata.annotations
    provisioner = ann.get("volume.beta.kubernetes.io/storage-provisioner")
    if provisioner not in snapshot_provisioners:
        msg = ("No snapshotclass associated with PVC '%s' "
               "storage provisioner '%s'."
               % (pvc, provisioner))
        log.error(msg)
        raise exceptions.NotFound(msg)


def get_volumesnapshotclass_provisioners_names():
    """Get the names of snapshotclass storage provisioners."""
    classes = storage_api.list_storage_class()().items
    snapshot_provisioners = list_volumesnapshotclass_storage_provisioners()
    return [stor_class.metadata.name for stor_class in classes
            if stor_class.provisioner in snapshot_provisioners]
