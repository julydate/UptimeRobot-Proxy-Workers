// Website you intended to retrieve for users.
const upstream = 'stats.uptimerobot.com'

// Custom pathname for the upstream website.
const upstream_path = '/y9wlqUkQK'

// Website you intended to retrieve for users using mobile devices.
const upstream_mobile = 'stats.uptimerobot.com'

// Custom domain for the UptimeRobot RSS website.
const rss_domain = 'rss.uptimerobot.com'

// Custom pathname for the UptimeRobot RSS website.
const rss_path = 'u1670178-c194c09553de8b8107de0032f7e05956'

// Countries and regions where you wish to suspend your service.
// const blocked_region = ['CN', 'KP', 'SY', 'PK', 'CU']
const blocked_region = []

// IP addresses which you wish to block from using your service.
const blocked_ip_address = ['0.0.0.0', '127.0.0.1']

// Whether to use HTTPS protocol for upstream address.
const https = true

// Whether to disable cache.
const disable_cache = true

// Replace texts.
const replace_dict = {
    '$upstream': '$custom_domain',
    '//google.com': ''
}

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
})

async function fetchAndApply(request) {
    const region = request.headers.get('cf-ipcountry').toUpperCase();
    const ip_address = request.headers.get('cf-connecting-ip');
    const user_agent = request.headers.get('user-agent');

    let response = null;
    let url = new URL(request.url);
    let url_hostname = url.hostname;

    if (https == true) {
        url.protocol = 'https:';
    } else {
        url.protocol = 'http:';
    }

    if (await device_status(user_agent)) {
        var upstream_domain = upstream;
    } else {
        var upstream_domain = upstream_mobile;
    }

    url.host = upstream_domain;
    if (url.pathname == upstream_path) {
        let headers = new Headers;
        headers.append('Location', '/');
        response = new Response('Redirect to Homepage.', {
            status: 307,
            headers: headers
        });
        return response;
    } else if (url.pathname == '/') {
        url.pathname = upstream_path;
    } else if (url.pathname == '/rss') {
        upstream_domain = rss_domain;
        url.host = upstream_domain;
        url.pathname = rss_path;
    } else {
        url.pathname = url.pathname;
    }

    if (blocked_region.includes(region)) {
        response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
            status: 403
        });
    } else if (blocked_ip_address.includes(ip_address)) {
        response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
            status: 403
        });
    } else {
        let method = request.method;
        let request_headers = request.headers;
        let new_request_headers = new Headers(request_headers);

        new_request_headers.set('Host', upstream_domain);
        new_request_headers.set('Referer', url.protocol + '//' + url_hostname);

        let original_response = await fetch(url.href, {
            method: method,
            headers: new_request_headers
        })

        connection_upgrade = new_request_headers.get("Upgrade");
        if (connection_upgrade && connection_upgrade.toLowerCase() == "websocket") {
            return original_response;
        }

        let original_response_clone = original_response.clone();
        let original_text = null;
        let response_headers = original_response.headers;
        let new_response_headers = new Headers(response_headers);
        let status = original_response.status;

		if (disable_cache) {
			new_response_headers.set('Cache-Control', 'no-store');
	    }

        new_response_headers.set('access-control-allow-origin', '*');
        new_response_headers.set('access-control-allow-credentials', true);
        new_response_headers.delete('content-security-policy');
        new_response_headers.delete('content-security-policy-report-only');
        new_response_headers.delete('clear-site-data');

		if (new_response_headers.get("x-pjax-url")) {
            new_response_headers.set("x-pjax-url", response_headers.get("x-pjax-url").replace("//" + upstream_domain, "//" + url_hostname));
        }

        const content_type = new_response_headers.get('content-type');
        if (content_type != null && content_type.includes('text/html') && content_type.includes('UTF-8')) {
            original_text = await replace_response_text(original_response_clone, upstream_domain, url_hostname);
        } else if (content_type != null && content_type.includes('text/javascript')) {
            original_text = await replace_response_js(original_response_clone);
        } else {
            original_text = original_response_clone.body
        }

        response = new Response(original_text, {
            status,
            headers: new_response_headers
        })
    }
    return response;
}

async function replace_response_text(response, upstream_domain, host_name) {
    let text = await response.text()
    var i, j;
    for (i in replace_dict) {
        j = replace_dict[i]
        if (i == '$upstream') {
            i = upstream_domain
        } else if (i == '$custom_domain') {
            i = host_name
        }

        if (j == '$upstream') {
            j = upstream_domain
        } else if (j == '$custom_domain') {
            j = host_name
        }
        let re = new RegExp(i, 'g')
        text = text.replace(re, j);
    }
    return text;
}
async function replace_response_js(response) {
    let text = await response.text()
    let rejs1 = new RegExp('pageUrl.\\+', 'g');
    let rejs2 = new RegExp('pageUrl\\+', 'g');
    text = text.replace(rejs1, 'pageUrl' + ' + \'' + upstream_path + '\' +');
    text = text.replace(rejs2, 'pageUrl' + '+\'' + upstream_path + '\'+');
    return text;
}

async function device_status(user_agent_info) {
    var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < agents.length; v++) {
        if (user_agent_info.indexOf(agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}