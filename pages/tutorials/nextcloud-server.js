import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Luke Reynolds</title>
	<meta charset="utf-8" />
	<meta name="description" content="In my desire to regain my privacy from big tech and their constant tracking, I have set up a Nextcloud server so that I can finally gain some peace of mind." />
    	<meta name="author" content="Luke Reynolds" />
    	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    	<meta name="keywords" content="Nextcloud, Ubuntu" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className={styles.main}>
	  <div>
	  	<h1 className={styles.title}>Nextcloud Server Tutorial Ubuntu 20.04</h1>
	    	<p>15/02/21</p>
            	<p>In my desire to regain my privacy from big tech and their constant tracking, I have set up a Nextcloud server so that I can finally gain somepeace of mind. It features RealVNC for remote maintenance, an NginX remote proxy</p>
	    	<p>Required: 1. A computer to use as a server (I'm using a SurfacePro 3).<br />2. A static IP and Domain name or DynamicDNS (if static IP is unavailable).<br />Access to your router's control panel.</p>
		<br />
		<br />
		<h3>Local cloud setup with remote connectivity</h3>
		
	  	<h2>Two virtual machines</h2>
		<p>I set this up using three virtual machines each acting as an independent server with a single task. Note that only two VMs are actually necessary to have a working setup; the third serves as an openvpn server so that I can manage the other two servers remotely as if I were on the LAN. If you&rsquo;re trying to set something like this up yourself and don&rsquo;t want or need that, just skip everything about the openvpn server.</p>
		<p>I set up all three VMs to run in Virtualbox. I used Virtualbox to run the VMs because it&rsquo;s easy to use and runs on a mac without hassle. Just download and install virtualbox from their website, and also download an image (<code>.iso</code>) of ubuntu server. Once virtualbox is up and running, create three new VMs. The first will act as a reverse proxy and the second as a vpn server. When prompted about the virtual disk for these, pick dynamically sized with a max of 8GB. The last VM will be the nextcloud server, so make its virtual disk dynamic with a max as big as reasonable; I used nearly all of the remaining space on the macbook&rsquo;s 1TB SSD, leaving 20GB or so so the macOS doesn&rsquo;t run into any issues if it fills up.</p>
		<p>After performing the initial setup of the VMs, go into the settings of each one and change their network adaptor mode to &ldquo;bridged&rdquo;. The relevant option will be under &ldquo;Networking&rdquo; in the VM settings. Doing this will make each of the VMs visible on the local network as independent hosts.</p>
		
	  	<h2>Nextcloud server setup</h2>
		<p>Then, start up the nextcloud server and select the ubuntu server image when prompted for a startup disk. This will load up the ubuntu live CD and go through the installation steps. The only extra step to do during the installation is to select the nextcloud snap when prompted with commonly installed snaps. After the installation is finished, nextcloud is pretty much done and ready to use on the LAN! To try it out, log in to the machine and find out its ip with <code>ifconfig</code>. Go to that ip in a web browser and you should be greeted with a nextcloud welcome page prompting you to set up an administrator account. You might as well do that while you&rsquo;re there.</p>
		
	  	<h2>Reverse proxy server setup</h2>
		<p>Next, start up the reverse proxy server and go through the motions of installing ubuntu server, this time <span class="underline">not</span> selecting any snaps when prompted. Once logged in, install <code>nginx</code> if necessary (it was already installed on my image). Then, find the ip of this server with <code>ifconfig</code> and take a note of it (I&rsquo;ll refer to it as <code>nginx-ip</code>, and the ip of the nextcloud server as <code>nextcloud-ip</code>). Then, make a file at <code>/etc/nginx/sites-available/nextcloud.conf</code> and fill it as follows; don&rsquo;t forget to replace the &rsquo;s with their real values!</p>
		<pre><code>
	  	sudo vi /etc/nginx/sites-available/nextcloud.conf
		
		server 
			The IP that you forwarded in your router (nginx proxy)
		  listen &lt;nginx-ip&gt;:80 default_server;

			The internal IP of the VM that hosts your Apache config
			set $upstream &lt;nginx-ip&gt;;
		location / 
			proxy_headers_hash_max_size 512;
			proxy_headers_hash_bucket_size 64;
			proxy_set_header Host $host;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			add_header Front-End-Https on;
				whatever the IP of your cloud server is
			proxy_pass http://&lt;nextcloud-ip&gt;;
			
		</code></pre>

		<p>Then symlink that config to <code>/etc/nginx/sites-enabled/</code> and restart nginx:</p>
		<pre><code>sudo ln -s /etc/nginx/sites-available/nextcloud.conf /etc/nginx/sites-enabled/
		sudo service nginx restart</code></pre>
		<p>And now accessing the nginx server&rsquo;s ip should redirect to the nextcloud server. Try it out (again) by going to the nginx server&rsquo;s ip in a web browser.</p>
		<p><strong>Resource</strong> <a href="https://www.techandme.se/set-up-nginx-reverse-proxy/">This guide</a> helped me construct the config to get this working.</p>
		
		<h2>RealVNC Server Setup</h2>
		<p>Lastly, boot up the final remaining VM and install ubuntu in the same way as the last one (the reverse proxy server). Once logged in, just follow the <a href="https://www.digitalocean.com/community/tutorials/how-to-set-up-an-openvpn-server-on-ubuntu-16-04">this long but easy tutorial</a> to set up openvpn. Note that that tutorial assumes you are using bash (which matters when setting up environment variables).</p>
		<p>The only caveat to note while completing the tutorial is that before doing step 11 you should generate a key for accessing the vpn.</p>
		<pre><code>cd ~/openvpn-ca
		source ./vars
		./build-key linux-client</code></pre>
		<p>(hit enter through all the prompts, then &lsquo;y&rsquo; to complete).</p>
		<p>For step 12, just scp the config to your own computer, and then you can connect to the server through the vpn with</p>
		<pre><code>sudo openvpn --config linux-client.ovpn</code></pre>
			
		<h3>Making the vpn accessible from the internet</h3>
		<p>The vpn is only really useful if it can be reached from the internet, so port forwarding needs to be set up in the router to forward internet traffic to the vpn server. To do this, just configure the router to forward UDP traffic on port 1194 to the openvpn server&rsquo;s ip address. Note that this only really makes sense if the openvpn server has a static ip, as described in the next section. Furthermore, because ISP&rsquo;s regularly change the public IP of normal routers, it probably also makes sense to set up dynamic dns to access the vpn.</p>
		
		<h2>Setting static ips for the VMs</h2>
		<p>Now, go into your router&rsquo;s management page and set static ips for each of the three VMs. I just used their current ips for simplicity; otherwise, the reverse proxy nginx config would need to be updated with the new ips. Restart the router and check that all the VMs have the assigned ips, and that they will never expire.</p>
		
		<h2>Local cloud with remote accessibility</h2>
		<p>This is all that needs to be done to have nextcloud accessible on the LAN (via an ip address) as well as remotely when connected to the vpn.</p>
		<p>To make the server more easily accessible, however, it can be exposed to the internet so that the nextcloud can be reached from anywhere in the world. The following steps detail how to do that.</p>

		<br />
		<br />

		<h1>Exposing the server to the internet</h1>
		<p>Exposing the nextcloud server to the internet makes it much more convenient. For example, with a domain name it can be made accessible through a url instead of an ip address.</p>
		<p>There are a few steps involved in making this happen: 1. Forwarding internet traffic from the router to the server 2. Setting up dynamic dns 3. Setting up ssl encryption</p>
		<h2 id="port-forwarding">Port forwarding</h2>
		<p>Back in the router&rsquo;s settings, configure port forwarding as follows: 1. Forward traffic of any kind on port 80 to the nginx server. 2. Forward TCP traffic on port 443 to the nginx server.</p>
		<p>Restart the router and now navigating to your public ip (find it with <a href="https://www.whatismyip.com/">whatismyip</a>) should take you to the nextcloud.</p>
		<h2 id="dynamic-dns">Dynamic DNS</h2>
		<p>Setting up dynamic dns will make the nextcloud accessible from a url instead of a public ip, which ISPs change regularly anyway. If you have a google domain like me, then Google provides a free dynamic dns service along with the domain; that is what I used. Setting it up on Google&rsquo;s end is pretty easy following <a href="https://support.google.com/domains/answer/6147083?hl%3Den">their instructions</a>. There are many dynamic dns services, such as no-ip etc, all of which will have a similar process to what I describe below.</p>
		<p>To set up the local end that notifies the dns servers of ip changes, log in to the nginx server. Install <code>ddclient</code>, which took me a few extra steps than expected because ubuntu server doesn&rsquo;t have the <a href="https://help.ubuntu.com/community/Repositories/Ubuntu">universe repository</a> enabled by default in ubuntu server 18.04. Fixing that is easy, though. Just edit <code>/etc/apt/sources.list</code> and duplicate the line with <code>deb &lt;url&gt; bionic main</code>, then change the <code>main</code> in the duplicated line to <code>universe</code>. After doing that update and <code>ddclient</code> should be available as normal:</p>
		<pre><code>sudo apt update &amp;&amp; sudo apt install ddclient</code></pre>
		<p>With <code>ddclient</code> installed, I set up the config as described in <a href="https://support.google.com/domains/answer/6147083?hl%3Den">Google&rsquo;s instructions</a> using the &ldquo;ddclient without Google Domains support&rdquo; config. One thing to note is that the username and password in the config should be in &lsquo;single quotes&rsquo;. Once that is done, test that the configuration works</p>
		<pre><code>sudo ddclient -daemon=0 -debug -verbose -noquiet</code></pre>
		<p>and if all is well you should be able to go to your configured domain to access the nextcloud server!</p>
		<h3 id="adding-the-nextclouds-external-url-as-a-trusted-proxy">Adding the nextcloud&rsquo;s external url as a trusted proxy</h3>
		<p>Upon reaching the nextcloud server for the first time from its now-configured url, nextcloud complained that the url was not a &ldquo;trusted proxy&rdquo;. I clicked the button provided in the prompt, and just to be safe I also followed <a href="https://docs.nextcloud.com/server/9/admin_manual/configuration_server/reverse_proxy_configuration.html">the docs&rsquo; instructions on adding a reverse proxy configuration</a>, adding a line to <code>/var/snap/nextcloud/&lt;some number here&gt;/nextcloud/config/config.php</code> containing</p>
		<pre><code>"trusted_proxies"   =&gt; ['&lt;nextcloud-ip&gt;', '&lt;your-domain.url&gt;'],</code></pre>
		<h2 id="ssl-encryption">SSL encryption</h2>
		<p>The last step that should really be done if the nextcloud will be accessed over the internet is to set up SSL encryption so that the server can be accessed through HTTPS. This will ensure that your files etc will be encrypted en route to and from the server though not <em>on</em> the server, which is fine since an account with a password is required to access it.</p>
		<p>This is actually pretty easy to do thanks to <a href="https://letsencrypt.org/">Let&rsquo;s Encrypt</a>. First, port forwarding needs to be set up on port 443 because that&rsquo;s the port used for ssl. This was already done in the port forwarding section above.</p>
		<p>The next step is to obtain ssl certificates, which is also pretty easy. The certificates need to be set up on the nginx server, because that will be the terminal for ssl connections. So log into the nginx server and install Let&rsquo;s Encrypt&rsquo;s certbot following <a href="https://certbot.eff.org/lets-encrypt/ubuntuartful-nginx">the installation instructions on the website</a>.</p>
		<p>Before running <code>certbot</code>, however, I needed to disable the reverse proxy traffic forwarding of the nginx server. To do this, just disable the proxy config and restart nginx before running certbot.</p>
		<pre><code>sudo rm /etc/nginx/sites-enabled/nextcloud.conf
		sudo service nginx restart
		sudo certbot --nginx</code></pre>
		<p>Then, reinstall the proxy config</p>
		<pre><code>sudo ln -s /etc/nginx/sites-available/nextcloud.conf /etc/nginx/sites-enabled/</code></pre>
		<p>and edit it to be like this:</p>
		<pre><code>server 
			The IP that you forwarded in your router (nginx proxy)
		  listen &lt;nginx-ip&gt;:443 ssl ipv6only=on;
		  server_name &lt;your-domain.url&gt;;
		  listen 443 ssl; 
		  ssl_certificate /etc/letsencrypt/live/&lt;your-domain.url&gt;/fullchain.pem;
		  ssl_certificate_key /etc/letsencrypt/live/&lt;your-domain.url&gt;/privkey.pem;
		  include /etc/letsencrypt/options-ssl-nginx.conf;
		  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

			The internal IP of the VM that hosts your Apache config
			set $upstream &lt;nginx-ip&gt;;
		location / 
			proxy_headers_hash_max_size 512;
			proxy_headers_hash_bucket_size 64;
			proxy_set_header Host $host;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			add_header Front-End-Https on;
				whatever the IP of your cloud server is
				Note that it's forwarding traffic to port 80 because the nextcloud server
				is only set up for http (not ssl)
        		proxy_pass http://&lt;nextcloud-ip&gt;:80;
        		
		</code></pre>

		<p>Finally, restart nginx</p>
		<pre><code>sudo service nginx restart</code></pre>
		<p>In the event that you get some mixed-content warnings from nextcloud, <a href="https://bayton.org/docs/nextcloud/nexcloud-behind-a-proxy-fixing-mixed-content-warnings-with-ssl/">this might be helpful</a>.</p>
		<p><strong>Resource</strong> The configuration and discussion in <a href="https://www.reddit.com/r/NextCloud/comments/7qsdhj/nextcloud_with_ssl_over_reverse_proxy/">this reddit post</a>, as well as the settings inserted by <code>certbot</code>, guided me toward the above working configuration.</p>
		<h3 id="setting-up-automatic-certificate-renewal">Setting up automatic certificate renewal</h3>
		<p>The ssl certificates expire every 90 days, but they can be easily and non-interactively renewed with</p>
		<pre><code>sudo certbot renew</code></pre>
		<p>So just set up a cron job to do this every other month or so.</p>
		<pre><code>sudo crontab -e</code></pre>
		<p>Adding the line</p>
		<pre><code>0 0 1 */2 * /usr/bin/certbot -q renew</code></pre>
		<p>Which will automatically renew the certificates at midnight on the first of every other month.</p>
									  
		<h2>References</h2>
		<p></p>
		<p></p>
        </div>
      </main>
    </div>
  )
}
