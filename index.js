const puppeteer = require('puppeteer');
const $ = require('jquery');
var mongoose = require('mongoose');
var model=require('./model.js');  //model of collection 
var MONGO_OPTIONS=require('./config')  
mongoose.connect(MONGO_OPTIONS.url,MONGO_OPTIONS.db_options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected success')
});
(async() => {
    const browser = await puppeteer.launch({headless:false});
    console.log('Browser openned');
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);  // can't exit if navigation timeout long 
    const url = 'https://vnexpress.net/';
    await page.goto(url,{
        waitUntil: "networkidle2"              // no wait if load take a long time
    });
    console.log('Page loaded');
    const data = await page.evaluate(async() => {    //take data only use page.evaluate
        async function scroll(){ 
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        } 
        await scroll();  // scroll to take all news in html
        let dataElements =  document.querySelectorAll('.title-news > a');
        dataElements = [...dataElements]; // nodelist to array 
        let data = dataElements.map(i => (
            {
            link: i.getAttribute('href'),
            title: i.getAttribute('title')
        }));
        return data;
    });
    
    
    async function asyncForEach(array, callback) {             // use Async for Foreach
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }

    asyncForEach(data,async(num)=>{
        
        let http="https://";
        if ( num.link.search(http)==-1){
            num.link='https://vnexpress.net/kk';
        };
        await page.goto(num.link,{  waitUntil: "networkidle2"});
        const data2 = await page.evaluate(async() => {
            let dataElements = document.querySelectorAll('p.description,p.Normal');
            dataElements = [...dataElements];
          
            let datad= dataElements.map(i => (
            {
                x:i.textContent
            }));
            var kk='';
            datad.forEach(element => {
                kk=kk+element.x;
                k=kk+'\n';
            });
            return kk;
    
        });
        var x={};
        x.title=num.title;
        x.link=num.link;
        x.content=data2;
        model.create(x)         // create data into collection
  
    })

})();
