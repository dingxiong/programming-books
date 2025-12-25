# SSO

## Use google single signon

The are many ways to use google signon. It has basically two steps.

1. create google client id and secret in google cloud console. Note, make sure
   add both `http:localhost` and `http:localhost:<port number>` to
   `Authorized JavaScript origins`, otherwise you will see 401 error. I
   struggled a few hours on this part.
2. Use some library to get the JWT and user info

For the second step, there are many approaches. The native approaches is
following
[google identity service](https://developers.google.com/identity/gsi/web/guides/overview)
that uses google js library to fetch `id_token` and sends it to backend service
for further login.

Meanwhile, different frameworks provide different utility modules to handle
google login. In python, [authlib](https://github.com/lepture/authlib) is the
most popular library for sso. It has Flask, Django, starlette and other
integration as well. See
<https://developers.google.com/identity/protocols/oauth2/openid-connect#createxsrftoken>

Some pitfalls for google oauth2 secret

1. Quote from
   <https://developers.google.com/identity/protocols/oauth2#expiration>

   > A Google Cloud Platform project with an OAuth consent screen configured
   > for an external user type and a publishing status of "Testing" is issued a
   > refresh token expiring in 7 days. so for testing, token will expire in 7
   > days.

2. See `fastapi-google-signin-example`

## Buzzfeed sso

Buzzfeed sso is a proxy that you set it up and then you can use it to
authenticate multiple websites.

### Configurations

This part confused me a lot in the beginning. sso-proxy uses a lot of packages
and libraries to glue various components together to load the configuration
file. Let's see the evils inside!

As an end user, I only need to define a config map which contains a yaml file
`upstream_configs.yml` that lists the backend services as below

```
apiVersion: v1
kind: ConfigMap
...
data:
  upstream_configs.yml: |-
    - service: hello-world
      default:
        from: hello-world.tryevergreen.com
        to: http://hello-world.default.svc.cluster.local
    - service: one-off-master-staging
      default:
        from: staging-oneoff.tryevergreen.com
        to: http://one-off-master.staging-oneoff.svc.cluster.local:8004
        options:
          flush_interval: 100ms
...
```

Then in the deployment spec, I configure the volume and environment variable

```
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - image: buzzfeed/sso:v2.1.0
          env:
            - name: UPSTREAM_CONFIGS
              value: /sso/upstream_configs.yml
          volumeMounts:
            - name: upstream-configs
              mountPath: /sso
      volumes:
        - name: upstream-configs
          configMap:
            name: upstream-configs
```

So from this setup, you naturally think that there is a stage in the `main`
function that reads environment variable `UPSTREAM_CONFIGS` and gets the file
path and then unmarshals the yaml file to a golang struct. You are basically
right. The configuration is done by this line
[config, err := proxy.LoadConfig()](https://github.com/buzzfeed/sso/blob/348c2fccafbd795569f2119013fc6cba8032f183/cmd/sso-proxy/main.go#L22)
But if you search `UPSTREAM_CONFIGS` in the repo, you will be disappointed
because at nowhere this variable is looked up! OK! Don't panic. Let's follow
the entry point. The `LoadConfig` function has these
[two lines](https://github.com/buzzfeed/sso/blob/a1b1b74c2e6448f9e05efdbcf3e2b6920fe0c6a5/internal/proxy/configuration.go#L436-L437)

```
	conf := config.NewConfig()
	err := conf.Load(env.NewSource())
```

Let's read `env.NewSource()` first. It turns out that sso uses a package called
`go-micro` which is a framework to build micro services in go. From the
description there, you understand that this magic env store splits any
environment variable by underscore and then construct a nested configuration
tree. In our case, it will generate
`{"upstream": {"configs": "/sso/upstream_configs.yml"}}`. It iterates
[all environment variables](https://github.com/go-micro/go-micro/blob/master/config/source/env/env.go#L26),
so you cannot find where `UPSTREAM_CONFIGS` is read in sso repo. After
`conf.Load(env.NewSource())`, `conf` contains a dictionary
`{"upstream": {"configs": "/sso/upstream_configs.yml"}}`.

Then let's read a few lines below

```
decoder, err := mapstructure.NewDecoder(&mapstructure.DecoderConfig{
...
err = decoder.Decode(conf.Map())
```

sso uses package `mapstructure` to convert the dictionary above to the
[Configuration struct](https://github.com/buzzfeed/sso/blob/a1b1b74c2e6448f9e05efdbcf3e2b6920fe0c6a5/internal/proxy/configuration.go#L129).

Let's come back to `main`
[function](https://github.com/buzzfeed/sso/blob/348c2fccafbd795569f2119013fc6cba8032f183/cmd/sso-proxy/main.go#L47)

```
	err = proxy.SetUpstreamConfigs(
		&config.UpstreamConfigs,
		config.SessionConfig.CookieConfig,
		&config.ServerConfig,
	)
```

This part is the core part that reads the config yaml file and populates the
upstream services. The core function down the call chain is
[this](https://github.com/buzzfeed/sso/blob/348c2fccafbd795569f2119013fc6cba8032f183/internal/proxy/proxy_config.go#L290),
which unmarshals the yaml file to a `ServiceConfig` struct. When I read about
this part, I keep asking myself: where are `from` and `to` fields in
`UpstreamConfig`? Actually, they are hidden inside
[RouteConfig](https://github.com/buzzfeed/sso/blob/348c2fccafbd795569f2119013fc6cba8032f183/internal/proxy/proxy_config.go#L46)
because it has annotation `yaml:",inline"` :(

```
	RouteConfig RouteConfig `yaml:",inline"`
```

So now, I understand all the pieces of how config yaml is read and mapped to
the `Configuration` struct. What a pity that I spent about two hours jumping
around!

Another thing to note is how `mapstructure` maps a string value to a slice. See
[here](https://github.com/buzzfeed/sso/blob/a1b1b74c2e6448f9e05efdbcf3e2b6920fe0c6a5/internal/proxy/configuration.go#L446).

## internal vs external provider url

Sample of sso-proxy provider configuration is as follows,

```
- name: PROVIDER_URL_EXTERNAL
  value: https://sso-auth.tryevergreen.com
- name: PROVIDER_URL_INTERNAL
  value: http://sso-auth.sso.svc.cluster.local
```

The relevant code is
[here](https://github.com/buzzfeed/sso/blob/d473b35b00baac74a835ba081feec40bba93d4b0/internal/proxy/providers/sso.go#L71).
You see that the internal url wil be used for `redeem`, `refresh`, `validate`
and `profile` endpoints. If not specified, internal url will reuse exernal url.

## How to build & test

```
docker buildx build --platform linux/amd64 --push -t dingxiong/sso:0.0.3 .
```
