const CONFIG = require("./config");
const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const fs = require("fs")




 async function scrape(currenExecutionNumber) {
    // Create a cluster with 2 workers
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        monitor:true

    });
 
    // Define a task (in this case: screenshot of page)
    await cluster.task(async ({ page, data: url }) => {
        await page.goto("https://www.mockaroo.com/users/sign_in", {waitUntil:"networkidle0"});
        await page.type("#user_email",CONFIG.username);
        await page.type("#user_password",CONFIG.password);
        await page.click("input.btn.btn-success")
        await page.waitFor(3000);
        await page.goto(url);
        
        
        const pathData ="./data/"+"/"+ Date.now();

        await page._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: pathData
            });
        await page.click("#download");
        await page.waitFor(10000);
    });
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });
    // Add some pages to queue
    for(page of CONFIG.schemas){
        await cluster.queue(page);
    }

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
}


async function main(){
    let cont = 0;
    while(cont<CONFIG.timesExecuted){
        console.log(`---------- Ciclo ${cont+1} iniciando`)
        await scrape(cont+1);
        console.log(`---------- Ciclo ${cont+1} terminado`)
        cont++
        
    }
    
}

main();


