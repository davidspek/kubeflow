from kubeflow.kubeflow.crud_backend import api, status


def snapshot_status(snapshot):
    """
    Set the status of the snapshot
    """
    if snapshot["metadata"].get("deletionTimestamp") is not None:
        return status.create_status(
            status.STATUS_PHASE.TERMINATING, "Deleting Snapshot..."
        )

    if snapshot["status"]["readyToUse"] is True:
        return status.create_status(status.STATUS_PHASE.READY, "Ready")

        # The PVC is in Pending state, we check the Events to find out why
    evs = api.v1_core.list_namespaced_event(
        namespace=snapshot["metadata"]["namespace"],
        field_selector=api.events_field_selector(
            "VolumeSnapshot", snapshot["metadata"]["name"]
        ),
    ).items

    # If there are no events, then the PVC was just created
    if len(evs) == 0:
        return status.create_status(
            status.STATUS_PHASE.WAITING, "Creating Snapshot..."
        )

    msg = f"Pending: {evs[0].message}"
    state = evs[0].reason
    if evs[0].reason == "CreatingSnapshot":
        phase = status.STATUS_PHASE.WAITING
    elif evs[0].reason == "SnapshotContentCreationFailed":
        phase = status.STATUS_PHASE.WARNING
    elif evs[0].type == "Warning":
        phase = status.STATUS_PHASE.WARNING
    elif evs[0].type == "Normal":
        phase = status.STATUS_PHASE.READY

    return status.create_status(phase, msg, state)
