# kubeadm master shell

```
# bin/sh 

# 以root用户登录

# 安装docker 19.03
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce-19.03.2
systemctl enable docker.service
systemctl start docker.service

# 安装nvidia-container-toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.repo | sudo tee /etc/yum.repos.d/nvidia-docker.repo

yum install -y nvidia-container-toolkit
systemctl restart docker

# 安装nvidia-docker
yum install nvidia-docker2
# reload the Docker daemon configuration
pkill -SIGHUP dockerd
systemctl restart docker

# 修改docker默认运行时为nvidia
# 设置bip是为了ukey的便捷使用，可能和calico插件192.168.0.0/16有冲突
cat << EOF > /etc/docker/daemon.json
{   
    "bip": "192.168.100.1/24", 
    "exec-opts": ["native.cgroupdriver=systemd"],
    "default-runtime":"nvidia",
    "runtimes": {
        "nvidia": {
            "path": "nvidia-container-runtime",
            "runtimeArgs": []
        }
    },
    "storage-driver": "overlay2",
    "insecure-registries": ["harbor.cloudwalk.work","10.128.2.6"]
}
EOF

# 环境设置
# 1. 禁用防火墙
systemctl stop firewalld
systemctl disable firewalld

# 2. 禁用SELINUX
setenforce 0
sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config

# 3. iptables 设置
cat << EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness=0
EOF

modprobe br_netfilter && sudo sysctl -p /etc/sysctl.d/k8s.conf

# 4. kube-proxy开启ipvs的前置条件
cat << EOF > /etc/sysconfig/modules/ipvs.modules
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
EOF

chmod 755 /etc/sysconfig/modules/ipvs.modules && sudo bash /etc/sysconfig/modules/ipvs.modules && sudo lsmod | grep -e ip_vs -e nf_conntrack_ipv4
yum -y install ipset && sudo yum -y install ipvsadm

# 5. 关闭swap
swapoff -a

# 安装 k8s
yum install yum-plugin-ovl -y

# 添加源
cat << EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

yum makecache fast

# 安装 kubelet kubeadm kubectl 1.15.4
yum install -y kubelet-1.15.4 kubeadm-1.15.4 kubectl-1.15.4

# 设置守护进程，k8s 1.16 的kubelet支持动态修改配置文件（configmap形式），注意cpumanage最后设置
systemctl enable kubelet.service
systemctl restart docker
systemctl restart kubelet

# 初始化master节点 （使用阿里镜像）
kubeadm init --kubernetes-version=v1.15.4 --pod-network-cidr=192.168.0.0/16 --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 添加worker节点，根据master节点启动后的提示信息
#  kubeadm join ${master_ip}

###################################################
# 若想重新加入
# kubelet的cm中cpumanage=static时，kubelet起不来
#    sudo kubeadm reset
#    rm -rf /etc/kubernetes/
# master上执行：
#    kubeadm token create --print-join-command
###################################################

# 安装calico网络插件
kubectl apply -f https://docs.projectcalico.org/v3.9/manifests/calico.yaml

# 删除master的污点，使其可以调度
kubectl taint nodes --all node-role.kubernetes.io/master- 

# 安装 local-path-provisioner
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml

# 安装k8s的GPU调度工具
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/1.0.0-beta4/nvidia-device-plugin.yml

# 安装dashboard

# 安装Prometheus+node-export+dcgm监控工具










```