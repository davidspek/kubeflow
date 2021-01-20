module github.com/kubeflow/kubeflow/components/admission-webhook

go 1.12

replace (
	k8s.io/api => k8s.io/api v0.0.0-20190222213804-5cb15d344471
	k8s.io/apimachinery => k8s.io/apimachinery v0.0.0-20190221213512-86fb29eff628
	k8s.io/client-go => k8s.io/client-go v10.0.0+incompatible
)

require (
	github.com/docker/docker v0.7.3-0.20190327010347-be7ac8be2ae0 // indirect
	github.com/ghodss/yaml v1.0.0 // indirect
	github.com/globalsign/mgo v0.0.0-20181015135952-eeefdecb41b8 // indirect
	github.com/go-openapi/analysis v0.17.2 // indirect
	github.com/go-openapi/errors v0.17.2 // indirect
	github.com/go-openapi/loads v0.17.2 // indirect
	github.com/go-openapi/runtime v0.17.2 // indirect
	github.com/go-openapi/validate v0.18.0 // indirect
	github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b // indirect
	github.com/google/btree v1.0.0 // indirect
	github.com/gregjones/httpcache v0.0.0-20190212212710-3befbb6ad0cc // indirect
	github.com/mattbaird/jsonpatch v0.0.0-20171005235357-81af80346b1a
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.1 // indirect
	github.com/natefinch/lumberjack v2.0.0+incompatible // indirect
	github.com/onsi/gomega v1.10.2
	github.com/peterbourgon/diskv v2.0.1+incompatible // indirect
	github.com/philhofer/fwd v1.0.0 // indirect
	github.com/pquerna/ffjson v0.0.0-20180717144149-af8b230fcd20 // indirect
	github.com/tinylib/msgp v1.1.0 // indirect
	github.com/ugorji/go v0.0.0-20171019201919-bdcc60b419d1 // indirect
	golang.org/x/net v0.0.0-20201110031124-69a78807bb2b
	gonum.org/v1/netlib v0.0.0-20190331212654-76723241ea4e // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/yaml.v1 v1.0.0-20140924161607-9f9df34309c0 // indirect
	k8s.io/api v0.20.1
	k8s.io/apimachinery v0.20.1
	k8s.io/client-go v10.0.0+incompatible
	k8s.io/klog v0.3.0
	sigs.k8s.io/controller-runtime v0.8.0
	sigs.k8s.io/structured-merge-diff v0.0.0-20190302045857-e85c7b244fd2 // indirect
	sigs.k8s.io/testing_frameworks v0.1.1 // indirect
)
