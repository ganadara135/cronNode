5 * * * * /usr/bin/curl -s -o /home/ubuntu/work/cron/out -i http://localhost:8086/query -u admin:admin --data-urlencode "q=SHOW DATABASES"