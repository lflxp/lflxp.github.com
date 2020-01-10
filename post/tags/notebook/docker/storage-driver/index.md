# docker devicemapper 转overlay2

1. 修改daemon.json 添加driver

```
{
  "registry-mirrors": ["https://registry.docker-cn.com", "https://docker.mirrors.ustc.edu.cn"], 
  "max-concurrent-downloads": 10,
  "log-driver": "json-file",
  "log-level": "warn",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "data-root": "/data/docker",
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-runtime":"nvidia",
  "runtimes": {
    "nvidia": {
      "path": "/bin/nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

2. disable kubelet docker
3. reboot
4. umount /data
5. mkfs.xfs -n ftype=1 /dev/mapper/centos-home
6. systemctl start docker kubelet

```
##执行修改ftype=1需要umount目录，目前根目录不能执行（会清空/home目录）
[root@localhost ~]# umount /home
[root@localhost ~]# mkfs.xfs -n ftype=1 /dev/mapper/centos-home
mkfs.xfs: /dev/mapper/centos-home appears to contain an existing filesystem (xfs).
mkfs.xfs: Use the -f option to force overwrite.
[root@localhost ~]# mkfs.xfs -n ftype=1 -f /dev/mapper/centos-home
meta-data=/dev/mapper/centos-home isize=256    agcount=4, agsize=3768576 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=0        finobt=0
data     =                       bsize=4096   blocks=15074304, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=7360, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
[root@localhost ~]# mount /dev/mapper/centos-home  /home
```