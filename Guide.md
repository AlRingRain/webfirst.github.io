## Prepare
sudo su  
cat /etc/redhat-release  
yum install -y vim zip unzip epel-release jq  

>System version: centos7  
>Open server port 12400~12409  

## Disk Settings
lsblk  

```
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
vda    253:0    0   40G  0 disk
vdb    253:16   0  100G  0 disk
```

file -s /dev/vdb  
mkfs -t ext4 /dev/vdb  
mkdir /data  
mount /dev/vdb /data  

cp /etc/fstab /etc/fstab.orig  
blkid  

	/dev/vda1: UUID="1114fe9e-2309-4580-b183-d778e6d97397" TYPE="ext4"
	/dev/vdb: UUID="abd3b221-43ae-48ad-861b-b8ac453b71dc" TYPE="ext4"

vim /etc/fstab  

	UUID=abd3b221-43ae-48ad-861b-b8ac453b71dc  /data  ext4  defaults,nofail  0  2

umount /data  
mount -a  

## Create Folder
mkdir admin_server app_server app2_server socket_server socket2_server qc_server web-admin app app-admin cert uploads temp mysql redis  

## Close SELinux
getenforce  
vim /etc/sysconfig/selinux  

	set SELINUX=enforcing to SELINUX=disabled

setenforce 0  

## OpenJDK
yum install -y java-1.8.0-openjdk  
yum install -y java-1.8.0-openjdk-devel  

## MySql
yum localinstall -y https://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm  
rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022  
yum install -y mysql-community-server -y  

vim /etc/my.cnf  

	character_set_server=utf8mb4
	skip_name_resolve=1
	max_connections=800
	max_connect_errors=1000
	group_concat_max_len=102400
	lower_case_table_names=1
	sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION

systemctl start mysqld  
systemctl enable mysqld  

grep 'temporary password' /var/log/mysqld.log  
mysql -u root -p'X)0PTtpedu/b'  

	ALTER USER 'root'@'localhost' IDENTIFIED BY 'e44YWPAn@A@G&9';
	GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'e44YWPAn@A@G&9' WITH GRANT OPTION;
	FLUSH PRIVILEGES;
	exit

systemctl stop mysqld  
chown mysql:mysql /data/mysql  
cp -R -p /var/lib/mysql/* /data/mysql/  

## Redis
yum install -y redis  
systemctl start redis  
systemctl enable redis  
systemctl stop redis  
chown -hR redis:redis /data/redis  
cp -R -p /var/lib/redis/* /data/redis  

## Nginx, nginx/1.22.0
rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm  
yum -y install nginx  
systemctl enable nginx  

>put nginx.conf to /etc/nginx/conf.d/

## SSL certificate
yum -y install certbot python2-certbot-nginx  
certbot --nginx  

## Initialize database
gzzbjkj_client: utf8mb4, utf8mb4_general_ci  
zubajie_server: utf8, utf8_general_ci  

## Upload
**Configuration**: application-prod.yml  

```
domain-name: 'Boost.com'
domain-url: https://${domain-name}
project-url: ${domain-url}${server.servlet.context-path}

user-id-prefix: 'boost_'
country: 'USA'
currency: 'USD'
currency-symbol: '$'
hot-line: ''

mysql-domain-name: 'localhost:3306'
mysql-username: 'root'
mysql-password: '123456'

#-------------------------------------------------------------------------------------------------

  cdb:
    sms: 'twilio'
    sms-w-l: ''
    run-pos-task: true
    run-task: true
    bajie-ptids:
      - 'BJCD0000000000000000000000000001'

#-------------------------------------------------------------------------------------------------

  twilio:
    account-sid: ''
    auth-token: ''
    phone-number: ''

  google:
    clientId: 'web'
    androidClientId: ${cdb-api.google.clientId}
    iOSClientId: 'ios'
    clientSecret: ''
    redirectUri: ${domain-url}

  facebook:
    appId: ''
    secret: ''

  #firebase:
    autoLoad: true
    keyPath: /data/cert/firebase.json
    databaseUrl: https://${firebase.json.project_id}.firebaseio.com

  stripe:
    publishableKey: 'pk'
    secretKey: 'sk'
    webhookSecret: 
    accountCountry: ${country}
    paymentMethods: "card"
    successUrl: ${domain-url}
    cancelUrl: ${domain-url}
```

**Sevice**: app-api-prod, web-api-prod, socket-api-prod, qc-api-prod, registerserver, chargeservice01  
**Web**: /data/web-admin, /data/app/content

```
/data/web-admin/index.html

<title>Boost</title>
```

```
/data/web-admin/config/index.js

window.SITE_CONFIG['baseUrl'] = 'https://domainName/cdb-web-api/v1'
window.SITE_CONFIG['version'] = '2305241708' //version number: /data/web-admin/2305241708

window.SITE_CONFIG['appName'] = 'Boost'
window.SITE_CONFIG['appShortName'] = 'Boost'
window.SITE_CONFIG['appBigData'] = 'Boost'
window.SITE_CONFIG['appBigDataManage'] = 'Boost'
window.SITE_CONFIG['appBigDataManageDrive'] = 'Boost'
window.SITE_CONFIG['appBigDataWatermark'] = 'Boost'

window.SITE_CONFIG['goolgmapKey'] = 'AIzaSyBuwzyOxgruOOVn8VDTqkouTS5iNKV9QiU'

window.SITE_CONFIG['officialWebsite'] = 'http://domainName/'

window.SITE_CONFIG['servertTimezone'] = 8 //UTC+8
```


**Cert**: /data/cert/firebase.json  
**Script**:  bootStarter.sh, del_log.sh  

## Copy files
cp /data/temp/application-prod.yml /data/admin_server/;  
cp /data/temp/application-prod.yml /data/app2_server/;  
cp /data/temp/application-prod.yml /data/app_server/;  
cp /data/temp/application-prod.yml /data/socket2_server/;  
cp /data/temp/application-prod.yml /data/socket_server/;  
cp /data/temp/application-prod.yml /data/qc_server/;  

> Modify the port in the configuration file

chmod 471 bootStarter.sh del_log.sh

cp /data/temp/del_log.sh /data/;  

cp /data/temp/bootStarter.sh /data/admin_server/;  
cp /data/temp/bootStarter.sh /data/app2_server/;  
cp /data/temp/bootStarter.sh /data/app_server/;  
cp /data/temp/bootStarter.sh /data/socket2_server/;  
cp /data/temp/bootStarter.sh /data/socket_server/;  
cp /data/temp/bootStarter.sh /data/qc_server/;  

cp /data/temp/web-api-prod.jar /data/admin_server/;  
cp /data/temp/app-api-prod.jar /data/app2_server/;  
cp /data/temp/app-api-prod.jar /data/app_server/;  
cp /data/temp/socket-api-prod.jar /data/socket2_server/;  
cp /data/temp/socket-api-prod.jar /data/socket_server/;  
cp /data/temp/qc-api-prod.jar /data/qc_server/;  

## Scheduled task
crontab -e  

	0 */12 * * * sh /data/del_log.sh  
	0 0 1 */1 * certbot renew  

## Boot start-up
chmod +x /etc/rc.d/rc.local  
vim /etc/rc.d/rc.local  

	/data/registerserver/start.sh  
	/data/chargeservice01/start.sh  
	/data/qc_server/bootStarter.sh start  
	/data/socket_server/bootStarter.sh start  
	/data/socket2_server/bootStarter.sh start  
	/data/app_server/bootStarter.sh start  
	/data/app2_server/bootStarter.sh start  
	/data/admin_server/bootStarter.sh start  

## Time zone settings
date  
tzselect  
cp /usr/share/zoneinfo/xxx/xxx /etc/localtime  

## Login
>Backend link: https://domainname/web-admin/

**Account**: root  
**Password**: 888888  

**Account**: admin  
**Password**: 888888  

## Payment Config
**Examples of stripe**

```sql
INSERT INTO `gzzbjkj_client`.`cdb_daili_payment_config` (`p_daili_id`, `p_currency_type`, `p_payment_type`, `p_config`, `p_refund_way`, `p_open`, `p_enable`, `p_add_id`, `p_auto_refund`, `p_refund_day`) VALUES ('BJCD0000000000000000000000000001', 'USD', 'STRIPE_CARD', '{\"currency\": \"USD\", \"cancel-url\": \"\", \"secret-key\": \"secret-key\", \"success-url\": \"\", \"webhook-secret\": \"\", \"account-country\": \"\", \"payment-methods\": \"card\", \"publishable-key\": \"publishable-key\"}', 1, 1, 1, '1', 1, 90);
INSERT INTO `gzzbjkj_client`.`cdb_daili_payment_config` (`p_daili_id`, `p_currency_type`, `p_payment_type`, `p_config`, `p_refund_way`, `p_open`, `p_enable`, `p_add_id`, `p_auto_refund`, `p_refund_day`) VALUES ('BJCD0000000000000000000000000001', 'USD', 'APPLE_PAY', '{\"currency\": \"USD\", \"cancel-url\": \"\", \"secret-key\": \"secret-key\", \"success-url\": \"\", \"webhook-secret\": \"\", \"account-country\": \"\", \"payment-methods\": \"card\", \"publishable-key\": \"publishable-key\"}', 1, 1, 1, NULL, 1, 90);
INSERT INTO `gzzbjkj_client`.`cdb_daili_payment_config` (`p_daili_id`, `p_currency_type`, `p_payment_type`, `p_config`, `p_refund_way`, `p_open`, `p_enable`, `p_add_id`, `p_auto_refund`, `p_refund_day`) VALUES ('BJCD0000000000000000000000000001', 'USD', 'GOOGLE_PAY', '{\"currency\": \"USD\", \"cancel-url\": \"\", \"secret-key\": \"secret-key\", \"success-url\": \"\", \"webhook-secret\": \"\", \"account-country\": \"\", \"payment-methods\": \"card\", \"publishable-key\": \"publishable-key\"}', 1, 1, 1, NULL, 1, 90);
```

---