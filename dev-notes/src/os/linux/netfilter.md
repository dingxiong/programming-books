# Netfilter

Netfilter is a module inside Linux networking stack for filtering and
transforming network packets.

## Hooks

There are
[five different hooks](https://github.com/torvalds/linux/blob/420b2d431d18a2572c8e86579e78105cb5ed45b0/include/uapi/linux/netfilter.h#L41-L42).

```
enum nf_inet_hooks {
	NF_INET_PRE_ROUTING,
	NF_INET_LOCAL_IN,
	NF_INET_FORWARD,
	NF_INET_LOCAL_OUT,
	NF_INET_POST_ROUTING,
	NF_INET_NUMHOOKS,
	NF_INET_INGRESS = NF_INET_NUMHOOKS,
};
```

[Wikipedia](https://en.wikipedia.org/wiki/Netfilter) has a complete diagram
showing at which stages the hooks are called. Below is a simplified version.
Diagram source is
[here](https://www.researchgate.net/figure/Netfilter-hooks-and-packet-flow-https-doiorg-101371-journalpone0182375g005_fig5_320174686).
![netfilter diagram](netfilter.png)

Note that each network namespace has its own netfilter hooks. See
[code](https://github.com/torvalds/linux/blob/420b2d431d18a2572c8e86579e78105cb5ed45b0/include/net/net_namespace.h#L143).
However, in Kubernetes, only the host has set up the iptable rules. The pod
itself does not have any iptable rule. For example, below result is from one
AWS EKS node.

```
[ec2-user@ip-172-31-95-245 ~]$ sudo ip netns exec cni-d0be060b-9f78-cbb5-d992-eb4a2bc066e9 iptables -t nat -L
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
```

## Register a table

The source code is
[here](https://github.com/torvalds/linux/blob/420b2d431d18a2572c8e86579e78105cb5ed45b0/net/netfilter/x_tables.c#L1450-L1498).

First interesting function is `net_generic`, which extract module specific data
from `struct net`. When you call `register_pernet_subsys`, it set the value
that points by `pernet_operations.id`. That is why
[xt_pernet_id ](https://github.com/torvalds/linux/blob/420b2d431d18a2572c8e86579e78105cb5ed45b0/net/netfilter/x_tables.c#L77)
is not initialized inside netfilter module.

## Reference

- https://switch-router.gitee.io/categories/
