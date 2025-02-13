构件 `visual-builder.pre-generated-config`

## Examples

### Basic

```yaml preview minHeight="500px"
brick: eo-content-layout
context:
  - name: mockList
    value:
      - DNS: 8.8.8.8
        NTP: ntp.example.com
        RPO: 1 hour
        RTO: "2024-08-16 16:00:00"
        _agentHeartBeat: 1692200062
        _agentStatus: 正常
        _environment: 生产
        _mac: "00:11:22:33:44:55"
        _occupiedU: 2
        _startU: 1
        _uuid: 123e4567-e89b-12d3-a456-426614174000
        age: "2022-01-01 00:00:00"
        agentVersion: 2.1.0
        aliveDate: "2024-08-15"
        annotations:
          - key: environment
            value: production
          - key: owner
            value: IT Department
        appServicePort: "3306,5432"
        applicant: John Doe
        asset_belong_to: 鞋类
        asset_id: AS123456
        businessIP: 192.168.1.10
        charset: UTF-8
        cloud_type: aliyun
        cpu:
          architecture: x86_64
          brand: Intel(R) Xeon(R) CPU E5-2620 v4 @ 2.10GHz
          cpu_pieces: "2"
          hz: 2.10GHz
          logical_cores: 20
          physical_cores: 10
        cpuHz: 3600
        cpuModel: Intel Xeon E5-2620 v4
        cpuNumber: 8
        cpus: 8
        creat_time: "2021-08-16 15:35:36"
        create_time: "2024-08-15"
        crontabs:
          - content: echo 'Cron job 1' >> /var/log/cron.log
            index: "1"
            time: 0 1 * * *
            user: root
          - content: echo 'Cron job 2' >> /var/log/cron.log
            index: "2"
            time: 0 2 * * *
            user: user1
        customer: CustomerA
        date: "2024-08-15"
        deviceId: "0001"
        device_model: Dell PowerEdge R740
        disk:
          - device: /dev/sda1
            fstype: ext4
            mountpoint: /
            provider: ""
            size: 102400
          - device: /dev/sdb1
            fstype: xfs
            mountpoint: /data
            provider: ""
            size: 512000
        diskSize: 500
        diskTotal: 500GB
        env: 开发环境
        eth:
          - broadcast: 192.168.1.255
            ip: 192.168.1.10
            mac: "00:11:22:33:44:55"
            mask: 255.255.255.0
            name: eth0
            speed: 1000
            status: UP
          - broadcast: ""
            ip: ""
            mac: "00:11:22:33:44:56"
            mask: ""
            name: eth1
            speed: 0
            status: DOWN
        filesystem:
          - filesystem: ext4
            mountPoint: /
            size: 102400
          - filesystem: xfs
            mountPoint: /data
            size: 512000
        hardDevices:
          - major: 8
            minor: 0
            mountPoints: /mnt/data
            name: sda
            readyOnly: "0"
            size: 500
            type: disk
          - major: 8
            minor: 16
            mountPoints: /mnt/backup
            name: sdb
            readyOnly: "0"
            size: 500
            type: disk
        host_price: 1200.5
        host_spec: "16GB RAM, 2x Intel Xeon E5-2620 v4"
        hostname: db-server-01
        hosts:
          - hostname: host1
            ip: 192.168.1.10
          - hostname: host2
            ip: 192.168.1.11
        installedPatch:
          - articleId: KB123456
            installedTime: "2024-08-15 10:00:00"
          - articleId: KB654321
            installedTime: "2024-08-14 14:30:00"
        ip: 192.168.1.10
        iptables:
          - chain: INPUT
            destination: ""
            isIPv6: false
            module: ""
            options: ""
            protocol: tcp
            source: 192.168.1.0/24
            target: ACCEPT
          - chain: OUTPUT
            destination: "2001:db8::/32"
            isIPv6: true
            module: ""
            options: ""
            protocol: udp
            source: ""
            target: DROP
        isSinglePower: false
        is_database: true
        k8sProxyVersion: 1.21.0
        k8sVersion: 1.26.3
        labels:
          - key: environment
        location: Hangzhou
        maintenanceExpireYearsNumber: 3
        maintenanceState: 维保中
        maintenance_time_end: "2025-08-16"
        maintenance_time_start: "2023-08-16"
        maintenance_window: "2024-08-16 22:00:00"
        memSize: 16
        memo: This is a test host for Aliyun.
        nodeLabels:
          - key: kubernetes.io/role
            value: worker
          - key: beta.kubernetes.io/os
            value: linux
        nodeName: node1
        nodeStatus: Ready
        openstack_server_id: os-server-12345
        osArchitecture: x86_64
        osDistro: Ubuntu 20.04
        osRelease: 4.19.128-microsoft-standard
        osSystem: Linux
        osVersion: CentOS 7.9
        outer_ip: 192.168.1.10
        producer: Dell
        product: ProductA
        propertyid: ALY-001
        provider: Aliyun
        pv:
          Free_PE: "1000"
          PE_Size: 4M
          PV_Name: sda1
          PV_Size: 100G
          PV_UUID: 1234-abcd-5678-efgh
          Total_PE: "25600"
          VG_Name: data_vg
        remote_ip: 192.168.1.10
        resourceType: X86虚拟机
        samplerVersion: 1.0.0
        service:
          - cwd: /var/lib/mysql
            exe: /usr/sbin/mysqld
            listening_ip: 192.168.1.10
            listening_port: 3306
            name: mysql
            pname: mysqld
            username: mysql
          - cwd: /var/lib/postgresql
            exe: /usr/lib/postgresql/12/bin/postgres
            listening_ip: 192.168.1.10
            listening_port: 5432
            name: postgresql
            pname: postgres
            username: postgres
        sn: TXK123456789
        status: 运营中
        taints:
          - effect: NoSchedule
            key: diskType
            value: SSD
          - effect: PreferNoSchedule
            key: memoryType
            value: DDR4
        ticket_num: TICKET-12345
        time_sync: 是
        time_zone: Asia/Shanghai
        type: 物理机
        uptime: "2024-08-16 14:00:00"
        usbkey:
          key: USB-KEY12345
          key_sn: USB123456789
        use: 数据库服务器
        version: 1.2.3
        vg:
          - Free_PE: "10240"
            PE_Size: 4.00 MB
            Total_PE: "25600"
            VG_Name: VolGroup00
            VG_Size: 100.00 GB
            VG_UUID: 3e6e6-86e6f
          - Free_PE: "20480"
            PE_Size: 4.00 MB
            Total_PE: "51200"
            VG_Name: VolGroup01
            VG_Size: 200.00 GB
            VG_UUID: 3e6e7-86e7f
        vmName: VM-001
        vmType: kvm
        vmware_host: 否
        windowsFirewallRules:
          - action: Allow
            direction: Inbound
            edgeTraversal: Disabled
            enabled: true
            group: Security
            localIp: 192.168.1.10
            localPort: "80"
            name: Rule1
            profile: Domain
            protocol: TCP
            remoteIp: 192.168.1.0/24
            remotePort: "*"
          - action: Block
            direction: Outbound
            edgeTraversal: Enabled
            enabled: false
            group: Firewall
            localIp: 192.168.1.10
            localPort: "53"
            name: Rule2
            profile: Public
            protocol: UDP
            remoteIp: 0.0.0.0/0
            remotePort: "53"
      - DNS: 8.8.4.4
        NTP: ntp.example.com
        RPO: 2 hours
        RTO: "2024-08-16 17:00:00"
        _agentHeartBeat: 1692200062
        _agentStatus: 异常
        _environment: 测试
        _mac: "00:11:22:33:44:66"
        _occupiedU: 3
        _startU: 4
        _uuid: 123e4567-e89b-12d3-a456-426614174001
        age: "2021-06-01 00:00:00"
        agentVersion: 2.1.1
        aliveDate: "2024-08-14"
        annotations:
          - key: environment
            value: development
          - key: owner
            value: DevOps Team
        appServicePort: "80,443"
        applicant: Jane Smith
        asset_belong_to: 体育
        asset_id: AS678901
        businessIP: 192.168.1.11
        charset: UTF-8
        cloud_type: tencent
        cpu:
          architecture: x86_64
          brand: AMD EPYC 7502 32-Core Processor
          cpu_pieces: "1"
          hz: 2.50GHz
          logical_cores: 64
          physical_cores: 32
        cpuHz: 3000
        cpuModel: AMD EPYC 7402
        cpuNumber: 12
        cpus: 12
        creat_time: "2022-08-16 15:35:36"
        create_time: "2024-08-14"
        crontabs:
          - content: echo 'Cron job 3' >> /var/log/cron.log
            index: "1"
            time: 0 3 * * *
            user: root
          - content: echo 'Cron job 4' >> /var/log/cron.log
            index: "2"
            time: 0 4 * * *
            user: user2
          - content: echo 'Cron job 5' >> /var/log/cron.log
            index: "3"
            time: 0 5 * * *
            user: user3
        customer: CustomerB
        date: "2024-08-16"
        deviceId: "0002"
        device_model: HP ProLiant DL380 Gen10
        disk:
          - device: /dev/sda1
            fstype: ext4
            mountpoint: /
            provider: ""
            size: 128000
          - device: /dev/sdb1
            fstype: xfs
            mountpoint: /data
            provider: ""
            size: 1024000
        diskSize: 1000
        diskTotal: 1TB
        env: 预发布环境
        eth:
          - broadcast: 10.0.0.255
            ip: 10.0.0.10
            mac: "00:11:22:33:44:57"
            mask: 255.0.0.0
            name: eth0
            speed: 1000
            status: UP
          - broadcast: 10.0.1.255
            ip: 10.0.1.10
            mac: "00:11:22:33:44:58"
            mask: 255.255.255.0
            name: eth1
            speed: 1000
            status: UP
        filesystem:
          - filesystem: ext4
            mountPoint: /
            size: 128000
          - filesystem: xfs
            mountPoint: /data
            size: 1024000
        hardDevices:
          - major: 8
            minor: 0
            mountPoints: /mnt/data
            name: sda
            readyOnly: "0"
            size: 1000
            type: disk
          - major: 8
            minor: 16
            mountPoints: /mnt/backup
            name: sdb
            readyOnly: "0"
            size: 1000
            type: disk
          - major: 8
            minor: 32
            mountPoints: /mnt/temp
            name: sdc
            readyOnly: "0"
            size: 500
            type: disk
        host_price: 1500.75
        host_spec: "32GB RAM, 2x Intel Xeon E5-2650 v4"
        hostname: web-server-01
        hosts:
          - hostname: host3
            ip: 192.168.1.20
          - hostname: host4
            ip: 192.168.1.21
          - hostname: host5
            ip: 192.168.1.22
        installedPatch:
          - articleId: KB987654
            installedTime: "2024-08-14 09:00:00"
          - articleId: KB456789
            installedTime: "2024-08-13 16:00:00"
        ip: 192.168.1.20
        iptables:
          - chain: FORWARD
            destination: ""
            isIPv6: false
            module: ""
            options: ""
            protocol: icmp
            source: ""
            target: REJECT
          - chain: INPUT
            destination: ""
            isIPv6: false
            module: ""
            options: ""
            protocol: tcp
            source: 10.0.0.0/8
            target: ACCEPT
        isSinglePower: true
        is_database: false
        k8sProxyVersion: 1.20.2
        k8sVersion: 1.25.5
        labels:
          - key: department
        location: Guangzhou
        maintenanceExpireYearsNumber: 2
        maintenanceState: 未配置
        maintenance_time_end: "2026-02-16"
        maintenance_time_start: "2023-02-16"
        maintenance_window: "2024-08-16 23:00:00"
        memSize: 32
        memo: This is a test host for Tencent Cloud.
        nodeLabels:
          - key: kubernetes.io/role
            value: master
          - key: beta.kubernetes.io/os
            value: linux
        nodeName: node2
        nodeStatus: Ready
        openstack_server_id: os-server-67890
        osArchitecture: x86_64
        osDistro: Windows Server 2019
        osRelease: 4.19.128-microsoft-standard
        osSystem: Windows
        osVersion: Ubuntu 20.04
        outer_ip: 10.0.0.10
        producer: HP
        product: ProductB
        propertyid: TEN-002
        provider: Tencent
        pv:
          Free_PE: "5000"
          PE_Size: 4M
          PV_Name: sda2
          PV_Size: 50G
          PV_UUID: 1234-abcd-5678-efgh
          Total_PE: "12800"
          VG_Name: web_vg
        remote_ip: 192.168.1.11
        resourceType: X86物理机
        samplerVersion: 1.0.1
        service:
          - cwd: /var/lib/nginx
            exe: /usr/sbin/nginx
            listening_ip: 10.0.0.10
            listening_port: 80
            name: nginx
            pname: nginx
            username: nginx
          - cwd: /var/lib/apache2
            exe: /usr/sbin/apache2
            listening_ip: 10.0.0.10
            listening_port: 443
            name: apache
            pname: apache2
            username: www-data
        sn: HPK987654321
        status: 测试机
        taints:
          - effect: NoSchedule
            key: diskType
            value: HDD
          - effect: PreferNoSchedule
            key: memoryType
            value: DDR3
        ticket_num: TICKET-67890
        time_sync: 否
        time_zone: Asia/Shanghai
        type: 虚拟机
        uptime: "2024-08-16 13:00:00"
        usbkey:
          key: USB-KEY98765
          key_sn: USB987654321
        use: Web服务器
        version: 1.2.4
        vg:
          - Free_PE: "15360"
            PE_Size: 4.00 MB
            Total_PE: "38400"
            VG_Name: VolGroup02
            VG_Size: 150.00 GB
            VG_UUID: 3e6e8-86e8f
        vmName: VM-002
        vmType: docker
        vmware_host: 是
        windowsFirewallRules:
          - action: Allow
            direction: Inbound
            edgeTraversal: Disabled
            enabled: true
            group: Security
            localIp: 192.168.1.20
            localPort: "443"
            name: Rule3
            profile: Domain
            protocol: TCP
            remoteIp: 192.168.1.0/24
            remotePort: "*"
          - action: Allow
            direction: Outbound
            edgeTraversal: Enabled
            enabled: true
            group: Firewall
            localIp: 192.168.1.20
            localPort: "123"
            name: Rule4
            profile: Public
            protocol: UDP
            remoteIp: 0.0.0.0/0
            remotePort: "123"
  - name: attrList
    value:
      - id: product
        name: 所属产品
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: osSystem
        name: 操作系统类型
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: create_time
        name: 录入时间
        candidates:
          - display: text
            formatter:
              format: relative
              type: date
            type: date
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date
            type: date
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 2
      - id: hosts
        name: hosts文件
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: hostname
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: hostname
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: _occupiedU
        name: 占用U数
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: _uuid
        name: uuid
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: status
        name: 运营状态
        enum:
          - 运营中
          - 未上线
          - 维修中
          - 报废
          - 已下线
          - 备用
          - 故障中
          - 下线隔离中
          - 开发机
          - 测试机
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                下线隔离中: gray
                备用: grayblue
                已下线: gray
                开发机: blue
                报废: red
                故障中: red
                未上线: gray
                测试机: cyan
                维修中: orange
                运营中: green
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                下线隔离中: gray
                备用: grayblue
                已下线: gray
                开发机: blue
                报废: red
                故障中: red
                未上线: gray
                测试机: cyan
                维修中: orange
                运营中: green
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                下线隔离中: gray
                备用: grayblue
                已下线: gray
                开发机: blue
                报废: red
                故障中: red
                未上线: gray
                测试机: cyan
                维修中: orange
                运营中: green
              variant: background
            type: enum
            visualWeight: 2
      - id: time_sync
        name: 是否时间同步
        enum:
          - 是
          - 否
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                否: red
                是: green
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                否: red
                是: green
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                否: red
                是: green
              variant: background
            type: enum
            visualWeight: 2
      - id: memSize
        name: 内存大小
        candidates:
          - display: text
            formatter:
              format: unit
              originalUnit: KiB
              type: number
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            formatter:
              format: unit
              originalUnit: MiB
              type: number
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            formatter:
              format: unit
              originalUnit: GiB
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            formatter:
              format: unit
              originalUnit: GiB
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: _startU
        name: 起始U位
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: ip
        name: IP
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: cpus
        name: 总物理核心数
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: diskTotal
        name: 磁盘容量
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: vmType
        name: 虚拟化类型
        enum:
          - physical
          - lxc
          - kvm
          - docker
          - vcenter
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                docker: green
                kvm: blue
                lxc: gray
                physical: gray
                vcenter: gray
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                docker: green
                kvm: blue
                lxc: gray
                physical: gray
                vcenter: gray
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                docker: green
                kvm: blue
                lxc: gray
                physical: gray
                vcenter: gray
              variant: background
            type: enum
            visualWeight: 2
      - id: osDistro
        name: 操作系统发行版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: customer
        name: 所属客户
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: producer
        name: 服务器厂商
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: openstack_server_id
        name: OpenStack私有云虚拟机标识
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: _environment
        name: 主机环境
        enum:
          - 无
          - 开发
          - 测试
          - 预发布
          - 生产
          - 灾备
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                开发: cyan
                无: gray
                测试: geekblue
                灾备: red
                生产: green
                预发布: orange
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                开发: cyan
                无: gray
                测试: geekblue
                灾备: red
                生产: green
                预发布: orange
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                开发: cyan
                无: gray
                测试: geekblue
                灾备: red
                生产: green
                预发布: orange
              variant: background
            type: enum
            visualWeight: 2
      - id: asset_id
        name: 固资编号
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: iptables
        name: iptables
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: chain
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: protocol
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: use
        name: 用途
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: aliveDate
        name: 有效日期
        candidates:
          - display: text
            formatter:
              format: relative
              type: date
            type: date
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date
            type: date
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 2
      - id: osArchitecture
        name: 操作系统架构
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: resourceType
        name: 计算资源类型
        enum:
          - X86虚拟机
          - X86物理机
          - 小型机
          - 其他
          - ARM物理机
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                ARM物理机: green
                X86物理机: gray
                X86虚拟机: purple
                其他: orange
                小型机: blue
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                ARM物理机: green
                X86物理机: gray
                X86虚拟机: purple
                其他: orange
                小型机: blue
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                ARM物理机: green
                X86物理机: gray
                X86虚拟机: purple
                其他: orange
                小型机: blue
              variant: background
            type: enum
            visualWeight: 2
      - id: maintenanceState
        name: 维保状态
        enum:
          - 未配置
          - 已到期
          - 维保中
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                已到期: red
                未配置: gray
                维保中: green
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                已到期: red
                未配置: gray
                维保中: green
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                已到期: red
                未配置: gray
                维保中: green
              variant: background
            type: enum
            visualWeight: 2
      - id: hostname
        name: 主机名
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: eth
        name: 网卡信息
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: osVersion
        name: 操作系统
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: NTP
        name: NTP服务器
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: pv
        name: pv信息
        candidates:
          - display: text
            field: PV_Name
            type: struct
            visualWeight: 0
          - display: link
            field: PV_Name
            type: struct
            visualWeight: 1
          - display: tag
            field: PV_Name
            style:
              color: var(--text-color-default)
              variant: outline
            type: struct
            visualWeight: 2
          - display: text
            field: VG_Name
            type: struct
            visualWeight: -1
      - id: outer_ip
        name: 外网ip
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: appServicePort
        name: 应用服务端口监控
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: service
        name: 服务信息
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: device_model
        name: 型号
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: sn
        name: 设备SN
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: time_zone
        name: 时区
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: usbkey
        name: usbkey
        candidates:
          - display: text
            field: key
            type: struct
            visualWeight: 0
          - display: link
            field: key
            type: struct
            visualWeight: 1
          - display: tag
            field: key_sn
            type: struct
            visualWeight: 2
      - id: disk
        name: 磁盘信息
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: device
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: device
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: applicant
        name: 申请人
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: agentVersion
        name: agent版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: host_spec
        name: 主机规格
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: ticket_num
        name: 工单号
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: DNS
        name: DNS服务器
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: samplerVersion
        name: sampler版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: installedPatch
        name: 已安装的补丁信息
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: articleId
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: articleId
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: businessIP
        name: 业务IP
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: annotations
        name: 注解
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: nodeLabels
        name: k8s标签
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: nodeStatus
        name: k8s节点状态
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: filesystem
        name: 文件系统
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: filesystem
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: filesystem
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: labels
        name: 标签
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: taints
        name: 污点
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: key
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: isSinglePower
        name: 是否单电源
        candidates:
          - display: text
            "false":
              style:
                color: var(--text-color-default)
              text: "N"
            "true":
              style:
                color: var(--text-color-default)
              text: "Y"
            type: boolean
            visualWeight: -1
          - display: icon
            "false":
              icon: xmark
              style:
                color: var(--color-error)
            "true":
              icon: check
              style:
                color: var(--color-success)
            type: boolean
            visualWeight: 0
          - display: icon+text
            "false":
              icon: xmark
              style:
                color: var(--color-error)
              text: "No"
            "true":
              icon: check
              style:
                color: var(--color-success)
              text: "Yes"
            type: boolean
            visualWeight: 1
          - display: icon+text
            "false":
              icon: check
              style:
                color: var(--color-success)
                fontWeight: bold
              text: Dual PSU
            "true":
              icon: check
              style:
                color: var(--color-error)
                fontWeight: bold
              text: Single PSU
            type: boolean
            visualWeight: 2
      - id: _agentHeartBeat
        name: agent心跳
        candidates:
          - display: text
            formatter:
              format: relative
              type: date-time
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date-time
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            formatter:
              format: accurate
              type: date-time
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date-time
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: maintenance_window
        name: 维护窗口
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: diskSize
        name: 磁盘大小
        candidates:
          - display: text
            formatter:
              format: unit
              originalUnit: GB
              type: number
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            formatter:
              format: unit
              originalUnit: GB
              type: number
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            formatter:
              format: unit
              originalUnit: GB
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            formatter:
              format: unit
              originalUnit: GB
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: windowsFirewallRules
        name: windows防火墙策略
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: version
        name: 版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: cpuNumber
        name: 总逻辑核心数
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: cpuHz
        name: CPU频率
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: vmName
        name: 虚拟化实例名称
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: osRelease
        name: 操作系统内核发行版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: deviceId
        name: 设备ID
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: uptime
        name: 启动时长
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: RTO
        name: RTO
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: _mac
        name: 物理地址
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: memo
        name: 备注
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
      - id: provider
        name: 供应商
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: age
        name: 启动时间
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: k8sProxyVersion
        name: Kube-Proxy版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: location
        name: 地域
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: RPO
        name: RPO
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: remote_ip
        name: 远程管理IP
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: propertyid
        name: 资产编号
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: maintenance_time_end
        name: 维保结束时间
        candidates:
          - display: text
            formatter:
              format: relative
              type: date
            type: date
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date
            type: date
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 2
      - id: is_database
        name: 是否数据库主机
        candidates:
          - display: text
            "false":
              style:
                color: var(--text-color-default)
              text: "N"
            "true":
              style:
                color: var(--text-color-default)
              text: "Y"
            type: boolean
            visualWeight: -1
          - display: icon
            "false":
              icon: xmark
              style:
                color: var(--color-error)
            "true":
              icon: check
              style:
                color: var(--color-success)
            type: boolean
            visualWeight: 0
          - display: icon+text
            "false":
              icon: xmark
              style:
                color: var(--color-error)
              text: "No"
            "true":
              icon: check
              style:
                color: var(--color-success)
              text: "Yes"
            type: boolean
            visualWeight: 1
          - display: icon+text
            "false":
              icon: xmark
              style:
                color: var(--color-error)
                fontWeight: bold
              text: Not Database Host
            "true":
              icon: check
              style:
                color: var(--color-success)
                fontWeight: bold
              text: Database Host
            type: boolean
            visualWeight: 2
      - id: asset_belong_to
        name: 资产主体
        enum:
          - 鞋类
          - 体育
          - 鞋体公用
          - 物流
          - 新业务
          - 公共
          - 意礴
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                体育: orange
                公共: red
                意礴: cyan
                新业务: purple
                物流: green
                鞋体公用: blue
                鞋类: gray
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                体育: orange
                公共: red
                意礴: cyan
                新业务: purple
                物流: green
                鞋体公用: blue
                鞋类: gray
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                体育: orange
                公共: red
                意礴: cyan
                新业务: purple
                物流: green
                鞋体公用: blue
                鞋类: gray
              variant: background
            type: enum
            visualWeight: 2
      - id: hardDevices
        name: 硬盘信息
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: name
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: cloud_type
        name: 云类型
        enum:
          - aliyun
          - tencent
          - openstack
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                aliyun: blue
                openstack: geekblue
                tencent: cyan
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                aliyun: blue
                openstack: geekblue
                tencent: cyan
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                aliyun: blue
                openstack: geekblue
                tencent: cyan
              variant: background
            type: enum
            visualWeight: 2
      - id: host_price
        name: 主机价格
        candidates:
          - display: text
            formatter:
              currency: CNY
              decimals: 2
              format: currency
              thousandsSeparator: true
              type: number
            style:
              color: var(--text-color-secondary)
              size: medium
            type: float
            visualWeight: -1
          - display: text
            formatter:
              currency: CNY
              decimals: 2
              format: currency
              thousandsSeparator: true
              type: number
            style:
              color: var(--text-color-default)
              size: medium
            type: float
            visualWeight: 0
          - display: text
            formatter:
              currency: CNY
              decimals: 2
              format: currency
              thousandsSeparator: true
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: float
            visualWeight: 1
          - display: text
            formatter:
              currency: CNY
              decimals: 2
              format: currency
              thousandsSeparator: true
              type: number
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: float
            visualWeight: 2
      - id: maintenance_time_start
        name: 维保开始时间
        candidates:
          - display: text
            formatter:
              format: relative
              type: date
            type: date
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date
            type: date
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 2
      - id: cpuModel
        name: CPU型号
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: vmware_host
        name: 是否为vmware宿主机
        enum:
          - 是
          - 否
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                否: gray
                是: blue
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                否: gray
                是: blue
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                否: gray
                是: blue
              variant: background
            type: enum
            visualWeight: 2
      - id: vg
        name: vg信息
        candidates:
          - display: text
            field: VG_Name
            type: struct
            visualWeight: 0
          - display: link
            field: VG_Name
            type: struct
            visualWeight: 1
          - display: tag
            field: VG_Name
            style:
              color: var(--text-color-default)
              variant: outline
            type: struct
            visualWeight: 2
          - display: text
            field: VG_UUID
            type: struct
            visualWeight: -1
      - id: date
        name: 日期
        candidates:
          - display: text
            formatter:
              format: relative
              type: date
            type: date
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date
            type: date
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date
            type: date
            visualWeight: 2
      - id: maintenanceExpireYearsNumber
        name: 已使用年数
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: integer
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: integer
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: integer
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: integer
            visualWeight: 2
      - id: k8sVersion
        name: k8s版本
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: charset
        name: 当前字符集
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: cpu
        name: CPU信息
        candidates:
          - display: text
            field: brand
            type: struct
            visualWeight: 0
          - display: link
            field: brand
            type: struct
            visualWeight: 1
          - display: tag
            field: brand
            style:
              color: var(--color-brand)
              variant: outline
            type: struct
            visualWeight: 2
          - display: text
            field: architecture
            type: struct
            visualWeight: -1
      - id: _agentStatus
        name: agent状态
        enum:
          - 未安装
          - 异常
          - 正常
          - 已卸载
          - 维护中
        candidates:
          - display: tag
            style:
              background: gray
              variant: default
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                已卸载: orange
                异常: red
                未安装: gray
                正常: green
                维护中: blue
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                已卸载: orange
                异常: red
                未安装: gray
                正常: green
                维护中: blue
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                已卸载: orange
                异常: red
                未安装: gray
                正常: green
                维护中: blue
              variant: background
            type: enum
            visualWeight: 2
      - id: env
        name: 环境
        enum:
          - 开发环境
          - 预发布环境
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: enum
            visualWeight: -1
          - display: tag
            style:
              palette:
                开发环境: blue
                预发布环境: gray
              variant: default
            type: enum
            visualWeight: 0
          - display: tag
            style:
              palette:
                开发环境: blue
                预发布环境: gray
              variant: outline
            type: enum
            visualWeight: 1
          - display: tag
            style:
              palette:
                开发环境: blue
                预发布环境: gray
              variant: background
            type: enum
            visualWeight: 2
      - id: creat_time
        name: 创建时间
        candidates:
          - display: text
            formatter:
              format: relative
              type: date-time
            type: date-time
            visualWeight: -1
          - display: text
            formatter:
              format: accurate
              type: date-time
            type: date-time
            visualWeight: 0
          - display: text
            formatter:
              format: full
              type: date-time
            type: date-time
            visualWeight: 1
          - display: text
            formatter:
              format: full
              type: date-time
            type: date-time
            visualWeight: 2
      - id: type
        name: 主机类型
        candidates:
          - display: text
            style:
              color: var(--text-color-secondary)
              size: medium
            type: string
            visualWeight: -1
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
      - id: crontabs
        name: 定时任务
        candidates:
          - countOnly: true
            display: text
            type: struct-list
            visualWeight: -1
          - countOnly: true
            display: link
            type: struct-list
            visualWeight: 0
          - display: tag
            field: index
            maxItems: 2
            style:
              variant: default
            type: struct-list
            visualWeight: 1
          - display: tag
            field: index
            maxItems: 2
            style:
              variant: outline
            type: struct-list
            visualWeight: 2
      - id: nodeName
        name: 节点名称
        candidates:
          - display: text
            style:
              color: var(--text-color-default)
              size: medium
            type: string
            visualWeight: 0
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: medium
            type: string
            visualWeight: 1
          - display: text
            style:
              color: var(--text-color-default)
              fontWeight: bold
              size: large
            type: string
            visualWeight: 2
children:
  - brick: visual-builder.pre-generated-config
    properties:
      previewUrl: /preview/
      mockList: <% CTX.mockList %>
      attrList: |
        <%
          [
            "hostname",
            "ip",
            "status",
            "_agentStatus",
            "memSize",
            "diskSize",
            "osVersion",
            "create_time",
            "maintenance_time_start",
            "maintenance_time_end",
          ].map((attr) => CTX.attrList.find(a => a.id === attr)).filter(Boolean)
        %>
    events:
      change:
        - target: visual-builder\.pre-generated-config-preview
          multiple: true
          properties:
            attrList: <% EVENT.detail %>
  - brick: h2
    properties:
      textContent: 预览
      style:
        margin: 0
  - brick: visual-builder.pre-generated-config-preview
    properties:
      mockList: <% CTX.mockList %>
      container: table
      previewUrl: /preview/
  - brick: visual-builder.pre-generated-config-preview
    properties:
      mockList: <% CTX.mockList %>
      container: descriptions
      previewUrl: /preview/
```
