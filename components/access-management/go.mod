module github.com/kubeflow/kubeflow/components/access-management

go 1.12

require (
	github.com/google/btree v1.0.0 // indirect
	github.com/gorilla/mux v1.7.2
	github.com/gregjones/httpcache v0.0.0-20190212212710-3befbb6ad0cc // indirect
	github.com/imdario/mergo v0.3.7 // indirect
	github.com/kubeflow/kubeflow/components/profile-controller v0.0.0-20191008230951-321c1d3313b6
	github.com/peterbourgon/diskv v2.0.1+incompatible // indirect
	github.com/prometheus/client_golang v0.9.2
	github.com/prometheus/common v0.2.0 // indirect
	github.com/prometheus/procfs v0.0.0-20190219184716-e4d4a2206da0 // indirect
	github.com/sirupsen/logrus v1.4.2
	istio.io/api v1.19.0-alpha.1.0.20230831152911-56a12e041c2d
	istio.io/client-go v1.8.0
	k8s.io/api v0.28.0
	k8s.io/apimachinery v0.28.0
	k8s.io/client-go v11.0.1-0.20190409021438-1a26190bd76a+incompatible
	sigs.k8s.io/controller-runtime v0.2.0
)

replace (
	git.apache.org/thrift.git => github.com/apache/thrift v0.0.0-20180902110319-2566ecd5d999
	k8s.io/api => k8s.io/api v0.0.0-20190528110122-9ad12a4af326
	k8s.io/apimachinery => k8s.io/apimachinery v0.0.0-20190221084156-01f179d85dbc
	k8s.io/client-go => k8s.io/client-go v0.0.0-20190528110200-4f3abb12cae2
)
