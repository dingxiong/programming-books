# Iptables

You can find numerous iptables tutorials online.

## Inside k8s

NAT table Pod-to-Service packets get intercepted by the PREROUTING chain

Here is the iptable from an AWS EKS ec2 instance.

```
[ec2-user@ip-172-31-61-34 ~]$ sudo iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
KUBE-SERVICES  all  --  anywhere             anywhere             ctstate NEW /* kubernetes service portals */
KUBE-EXTERNAL-SERVICES  all  --  anywhere             anywhere             ctstate NEW /* kubernetes externally-visible service portals */
KUBE-FIREWALL  all  --  anywhere             anywhere

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
KUBE-FORWARD  all  --  anywhere             anywhere             /* kubernetes forwarding rules */
KUBE-SERVICES  all  --  anywhere             anywhere             ctstate NEW /* kubernetes service portals */

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
KUBE-SERVICES  all  --  anywhere             anywhere             ctstate NEW /* kubernetes service portals */
KUBE-FIREWALL  all  --  anywhere             anywhere

Chain KUBE-EXTERNAL-SERVICES (1 references)
target     prot opt source               destination
REJECT     tcp  --  anywhere             anywhere             /* data/airflow: has no endpoints */ ADDRTYPE match dst-type LOCAL tcp dpt:32584 reject-with icmp-port-unreachable

Chain KUBE-FIREWALL (2 references)
target     prot opt source               destination
DROP       all  --  anywhere             anywhere             /* kubernetes firewall for dropping marked packets */ mark match 0x8000/0x8000
DROP       all  -- !ip-127-0-0-0.us-east-2.compute.internal/8  ip-127-0-0-0.us-east-2.compute.internal/8  /* block incoming localnet connections */ ! ctstate RELATED,ESTABLISHED,DNAT

Chain KUBE-FORWARD (1 references)
target     prot opt source               destination
DROP       all  --  anywhere             anywhere             ctstate INVALID
ACCEPT     all  --  anywhere             anywhere             /* kubernetes forwarding rules */ mark match 0x4000/0x4000
ACCEPT     all  --  anywhere             anywhere             /* kubernetes forwarding conntrack pod source rule */ ctstate RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             anywhere             /* kubernetes forwarding conntrack pod destination rule */ ctstate RELATED,ESTABLISHED

Chain KUBE-KUBELET-CANARY (0 references)
target     prot opt source               destination

Chain KUBE-PROXY-CANARY (0 references)
target     prot opt source               destination

Chain KUBE-SERVICES (3 references)
target     prot opt source               destination
REJECT     tcp  --  anywhere             ip-10-100-109-33.us-east-2.compute.internal  /* devops/jenkinszip:http has no endpoints */ tcp dpt:webcache reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-192-135.us-east-2.compute.internal  /* spinnaker/spin-deck: has no endpoints */ tcp dpt:cslistener reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-193-242.us-east-2.compute.internal  /* monitoring/prometheus-kube-prometheus-prometheus:web has no endpoints */ tcp dpt:websm reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-125-144.us-east-2.compute.internal  /* spinnaker/spin-rosco: has no endpoints */ tcp dpt:simplifymedia reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-3-44.us-east-2.compute.internal  /* spinnaker/spin-redis: has no endpoints */ tcp dpt:6379 reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-90-84.us-east-2.compute.internal  /* spinnaker/spin-igor: has no endpoints */ tcp dpt:radan-http reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-153-132.us-east-2.compute.internal  /* spinnaker/spin-clouddriver: has no endpoints */ tcp dpt:afs3-prserver reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-102-112.us-east-2.compute.internal  /* data/airflow: has no endpoints */ tcp dpt:vat reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-247-73.us-east-2.compute.internal  /* kube-system/aws-load-balancer-webhook-service: has no endpoints */ tcp dpt:https reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-131-198.us-east-2.compute.internal  /* spinnaker/spin-orca: has no endpoints */ tcp dpt:us-srv reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-179-223.us-east-2.compute.internal  /* devops/jenkinszip-agent:agent-listener has no endpoints */ tcp dpt:50000 reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-156-48.us-east-2.compute.internal  /* spinnaker/spin-gate: has no endpoints */ tcp dpt:8084 reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-90-212.us-east-2.compute.internal  /* spinnaker/spin-gate-public: has no endpoints */ tcp dpt:http reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-51-18.us-east-2.compute.internal  /* elastic-system/elastic-webhook-server:https has no endpoints */ tcp dpt:https reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-179-244.us-east-2.compute.internal  /* spinnaker/spin-front50: has no endpoints */ tcp dpt:webcache reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-119-202.us-east-2.compute.internal  /* spinnaker/spin-deck-public: has no endpoints */ tcp dpt:http reject-with icmp-port-unreachable
REJECT     tcp  --  anywhere             ip-10-100-5-109.us-east-2.compute.internal  /* spinnaker/spin-echo: has no endpoints */ tcp dpt:8089 reject-with icmp-port-unreachable
```
