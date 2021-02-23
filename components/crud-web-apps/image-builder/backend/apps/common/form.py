import json

from werkzeug.exceptions import BadRequest

from kubeflow.kubeflow.crud_backend import logging

from . import utils

log = logging.getLogger(__name__)


def get_form_value(body, defaults, body_field, defaults_field=None):
    """
    Get the value to set by respecting the readOnly configuration for
    the field.
    If the field does not exist in the configuration then just use the form
    value.
    """
    if defaults_field is None:
        defaults_field = body_field

    user_value = body.get(body_field, None)
    if defaults_field not in defaults:
        return user_value

    readonly = defaults[defaults_field].get("readOnly", False)
    default_value = defaults[defaults_field]["value"]

    if readonly:
        if body_field in body:
            raise BadRequest(
                "'%s' is readonly but a value was provided: %s"
                % (body_field, user_value),
            )

        log.info("Using default value for '%s': %s", body_field, default_value)
        return default_value

    # field is not readonly
    if user_value is None:
        raise BadRequest("No value provided for: %s" % body_field)

    log.info("Using provided value for '%s': %s", body_field, user_value)
    return user_value


# Image YAML processing
def set_base_image(argo_workflow, body, defaults):
    """
    If the image is set to readOnly, use only the value from the config
    """
    image_body_field = "baseImage"
    is_custom_image = body.get("customImage", False)
    if is_custom_image:
        image_body_field = "customImage"

    docker_parameters = argo_workflow["spec"]["templates"][0]["steps"][0][0]["arguments"]["parameters"]
    baseImage = get_form_value(body, defaults, image_body_field, "baseImage")
    docker_parameters[0]["value"] = baseImage


def set_pip_packages(argo_workflow, body, defaults):
    """A comma separated string of pip packages to install"""
    docker_parameters = argo_workflow["spec"]["templates"][0]["steps"][0][0]["arguments"]["parameters"]

    pipPackages = get_form_value(body, defaults, "pipPackages")

    docker_parameters[1]["value"] = pipPackages


def set_conda_packages(argo_workflow, body, defaults):
    """A comma separated string of pip packages to install"""
    docker_parameters = argo_workflow["spec"]["templates"][0]["steps"][0][0]["arguments"]["parameters"]

    condaPackages = get_form_value(body, defaults, "condaPackages")

    docker_parameters[0]["value"] = condaPackages


def set_image_destination(argo_workflow, body, defaults):
    """The name and image tag for the image being built"""
    kaniko_parameters = argo_workflow["spec"]["templates"][0]["steps"][1][0]["arguments"]["parameters"]

    imageDestination = get_form_value(body, defaults, "imageDestination")

    kaniko_parameters[0]["value"] = imageDestination


def set_secret_name(argo_workflow, body, defaults):
    """The name of the secret containing the registry credentials"""
    secret_volume = argo_workflow["spec"]["volumes"][0]["name"]
    volume_secret_name = argo_workflow["spec"]["volumes"][0]["secret"]["secretName"]
    volume_secret_mount = argo_workflow["spec"]["templates"][2]["container"]["volumeMounts"][1]["name"]

    secretName = get_form_value(body, defaults, "secretName")

    secret_volume = secretName
    volume_secret_name = secretName
    volume_secret_mount = secretName
