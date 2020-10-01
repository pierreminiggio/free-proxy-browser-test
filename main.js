const fetch = require('node-fetch')
const puppeteer = require('puppeteer')

async function fetchProxies() {
    return new Promise(resolve => {
        fetch('https://api.proxyscrape.com/?request=getproxies&proxytype=socks5&timeout=10000&country=all')
            .then(response => response.text())
            .then(text => {
                resolve(text.split('\r\n'))
            })
    })
}

async function letsGo() {
    const proxies = await fetchProxies()
    console.log(proxies)
}

letsGo()
