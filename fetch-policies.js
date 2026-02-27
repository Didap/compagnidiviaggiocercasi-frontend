import fs from 'fs';
import * as cheerio from 'cheerio';

async function fetchPolicies() {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36' };

    try {
        const pRes = await fetch('https://compagnidiviaggiocercasi.com/privacy-policy/', { headers });
        let pText = await pRes.text();
        let $ = cheerio.load(pText);
        // Find the main content div. It seems to be inside something with text.
        // .et_pb_text_inner has the content, but there are multiple.
        let contentP = [];
        $('.et_pb_text_inner').each((i, el) => {
            contentP.push($(el).html());
        });
        fs.writeFileSync('privacy.html', contentP.join('\n\n'));

        const cRes = await fetch('https://compagnidiviaggiocercasi.com/cookie-policy/', { headers });
        let cText = await cRes.text();
        $ = cheerio.load(cText);
        let contentC = [];
        $('.et_pb_text_inner').each((i, el) => {
            contentC.push($(el).html());
        });
        fs.writeFileSync('cookie.html', contentC.join('\n\n'));

        console.log("Success");
    } catch (e) {
        console.error(e);
    }
}

fetchPolicies();
