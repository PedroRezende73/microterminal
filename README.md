#microterminal

antes de iniciar no Windows (Power Shell como admin)
New-NetFirewallRule -DisplayName "Liberar porta 5000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000
netsh interface portproxy add v4tov4 listenport=5000 listenaddress=0.0.0.0 connectport=5000 connectaddress=172.24.5.134
