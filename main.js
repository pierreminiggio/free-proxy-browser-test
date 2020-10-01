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

/**
 * @param {?string} proxy 
 * @param {boolean} show 
 * 
 * @returns {Promise<Browser>}
 */
async function createBrowser(proxy, show) {
    return new Promise(async (resolve, rejects) => {
        let launchParameters = {headless: ! show}
        if (proxy) {
            launchParameters.args = ['--proxy-server=socks5://' + proxy]
        }
        puppeteer.launch(launchParameters).then(browser => {
            resolve(browser)
        }).catch(error => {
            rejects(error)
        })
    })  
}

async function letsGo() {
    await letsGoWithProxies(await fetchProxies())
}

async function letsGoWithProxies(proxies) {
    const id = Math.floor(Math.random() * proxies.length)
    const browser = await createBrowser(proxies[id], true)
    const ipCheckerPage = await browser.newPage()
    try {
        await ipCheckerPage.goto('https://api.myip.com')
    } catch(e) {
        proxies.splice(id, 1)
        console.error('Proxy marche pas :\'(')
        console.error(e)
        browser.close()
        letsGoWithProxies(proxies)
    }
}

letsGo()
