module github.com/kubeflow/kubeflow/components/tensorboard-controller

go 1.12

require (
	github.com/go-logr/logr v0.3.0
	github.com/gogo/protobuf v1.3.1
	github.com/kubeflow/kubeflow/components/common v0.0.0-00010101000000-000000000000
	github.com/onsi/ginkgo v1.14.1 // indirect
	github.com/onsi/gomega v1.10.2 // indirect
	k8s.io/api v0.20.1
	k8s.io/apimachinery v0.20.1
	k8s.io/client-go v11.0.1-0.20190409021438-1a26190bd76a+incompatible
	k8s.io/klog v1.0.0 // indirect
	sigs.k8s.io/controller-runtime v0.8.0
)

replace github.com/kubeflow/kubeflow/components/common => ../common
