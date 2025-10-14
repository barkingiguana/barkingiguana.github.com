---
title: SSH to AWS Instances using AWS SSM
introduction: (without Bastion hosts or exposed ports)
layout: post
author: Craig
---

Discuss addressing instances. Account ID, Region, Name (Instance ID). Name probalby enough but need to have a local cache. Can take a long time to find.

![Example AWS Instances spread across 2 accounts and 2 regions](/images/aws-instances.png)


Design solution:
* Get instsance IDs
* SSH via SSM + Add Keys
* Limit time for SSH access via the key
* Can this be done in parallel?
* Show conecting to RDS from local instance


--------

(0) Ensure your instance has the ec2-instance-connect package installed e.g. via sudo apt-get install ec2-instance-connect.
(1) Make sure your user is allowed to ec2-instance-connect:SendSSHPublicKey in your IAM profile.
* Consider restricting this to resources that they should have access to, rather than granting carte blanch access to every instance.
* Use the ec2:osuser condition to restrict which users they can add the SSH key to. You probably want ssm-user here, since everyone will already have access to this via the ssm client.
(2) Install the ssm bundle for the aws cli: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html.
(3) Download the SSM proxy script and put it in ~/.ssh/ssm-proxy.sh like this: `curl -o ~/.ssh/ssm-proxy.sh https://gist.githubusercontent.com/qoomon/fcf2c85194c55aee34b78ddcaa9e83a1/raw/cd8f960c80646811c32d7a5e9cffd2a0e0fd55c4/aws-ssm-ec2-proxy-command.sh; chmod u+x ~/.ssh/ssm-proxy.sh`
(4) Configure the SSH client on your laptop, in ~/.ssh/config -- here's mine, customise it as needed:
Host *
ChallengeResponseAuthentication no
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
Compression yes
ConnectionAttempts 3
ControlMaster auto
ControlPath ~/.ssh/cp.%C
ControlPersist 300
ForwardAgent no
HashKnownHosts yes
HostKeyAlgorithms ssh-ed25519-cert-v01@openssh.com,ssh-rsa-cert-v01@openssh.com,ssh-ed25519,ssh-rsa
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group-exchange-sha256
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com,hmac-sha2-512,hmac-sha2-256,umac-128@openssh.com
PubkeyAuthentication yes
ServerAliveInterval 600
Host i-* mi-*
User ssm-user
IdentitiesOnly yes
IdentityFile ~/.ssh/id_rsa
ProxyCommand ~/.ssh/ssm-proxy.sh %h %r %p ~/.ssh/id_aws.pub
(5) Ensure AWS_DEFAULT_REGION and AWS_PROFILE environment variables are set.
(6) ssh to the host by targeting the instance ID: `ssh <instance-id>`
(7) You can target instances in other regions by setting your AWS_DEFAULT_REGION environment variable: `AWS_DEFAULT_REGION=us-west-2 ssh I-beefcafe`, or you can do `ssh <instance-id>::<region>` e.g. `ssh i-beefcafe::us-west-2`
(8) :partywizard:


ssh i-04c450dc6bb4dc762


Other proxy script (use this probalbmy) https://gist.github.com/cohandv/6bacfe8b90346d0efda83a062ce67364

SSH Proxy script: https://stackoverflow.com/questions/73657528/ssh-proxycommand-using-aws-ssm-session-manager-and-bash-script-with-select-comma
(adapt this to do discovery across all accounts and regions and cache positive hits locally)

Extend: use 1Password SSH socket instead of SSH keys
