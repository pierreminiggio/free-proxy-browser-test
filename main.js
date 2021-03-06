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
    const browser = await letsGoWithProxies(await fetchProxies())
}

/**
 * @param {string[]} proxies
 * 
 * @returns {Promise<import('puppeteer').Browser>} 
 */
async function letsGoWithProxies(proxies) {
    return new Promise(async resolve => {
        const id = Math.floor(Math.random() * proxies.length)
        const proxy = proxies[id]
        console.log('Test de ' + proxy + ' ...')
        const browser = await createBrowser(proxy, false)
        const ipCheckerPage = await browser.newPage()
        try {
            await ipCheckerPage.goto('https://api.myip.com')
            const bodyHTML = await ipCheckerPage.evaluate(() => document.body.innerHTML)
            console.log(JSON.parse(bodyHTML))
            console.log(proxy + ' MARCHE !!!')
            resolve(browser)
        } catch(e) {
            proxies.splice(id, 1)
            console.log('Proxy ' + proxy + ' marche pas :\'(')
            browser.close()
            proxies.length ? letsGoWithProxies(proxies) : letsGo()
        }
    })
}

letsGo()
