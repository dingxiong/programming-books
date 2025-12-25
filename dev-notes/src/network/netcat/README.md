# Netcat

## Pitfalls

### Different parameters

There are two programs: `nc`, `ncat`. They are basically the same thing but
with different implementation. So when searching document online, make sure you
are reading the right one. The trap I once got into is that one online page
tells me that `nc -l 8000` listens for TCP packets for port 8000. But actually,
it did not work. I need to use `nc -l -p 8000`.

### Service ip vs pod ip

In kubernetes, you can use `nc` to test connectivity between two different pods
to verify firewall rules. (This is super useful when you are dealing with AWS
security groups!)

In one pod, you run `nc -l -p 8010`. On another pod, you can run
`nc 172.31.66.141 8010`. The ip address here is the pod's ip. Everything works
fine: whatever you typed here will show up in the first pod. However, then you
think: OK. pod ip works, could I use the service ip?

```
k get svc sleep
NAME    TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE
sleep   ClusterIP   10.100.180.201   <none>        80/TCP
```

You run `nc 10.100.180.201 8010` and type a few messages. Noting happens! This
is because service ip only forward packet to certain port. In this case it
is 80. We can directly test port 80:

```
# nc 10.100.180.201 80
dfa
dfads
HTTP/1.1 400 Bad Request
content-length: 11
content-type: text/plain
date: Wed, 15 Feb 2023 17:05:05 GMT
server: istio-envoy
connection: close

Bad Request
```

As you see after typing some nonsense messages `dfa`, `dfads`, the server yells
back: "what is this bullshit. It is not http protocal!".
