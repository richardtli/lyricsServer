
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const {executablePath} = require('puppeteer')

const port = process.env.PORT || 3001;


const express = require('express')
const app = express()
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;


puppeteer.use(StealthPlugin())

app.get('/:link', async(req,res)=> {
  const array = req.params.link.split('_')
  const lyrics = await getLyrics(array[0], array[1])
  res.send(lyrics)
})


async function getLyrics(artist, song) {
  const browser = await puppeteer.launch({headless: 'new', executablePath: executablePath()});
  const page = await browser.newPage();
  await page.goto(`https://www.azlyrics.com/lyrics/${artist}/${song}.html`);

  const text = await page.evaluate(() => document.body.innerText);
  let AlmostLyrics = text.slice(
    text.indexOf("on Amazon Music Unlimited (ad)"),
    text.indexOf("Submit Corrections")
  );
  let lyrics = AlmostLyrics.slice(AlmostLyrics.indexOf("\n"));
  lyrics = lyrics.slice(lyrics.indexOf("\n\n") + 3);
  while (lyrics[lyrics.length - 1] == "\n") {
    lyrics = lyrics.slice(0, lyrics.length - 1);
  }

  const lyricsArray = lyrics.split("\n");
  lyricsArray.push("Created by RL");
  await browser.close();
  return(lyricsArray);
}

async function search(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(
    `https://search.azlyrics.com/search.php?q=${query}&w=songs&p=1&x=867b247d47c7f2fa504a64291a679d00e366e09f91a5af4b136aaba352af69fc`
  );

  const songs = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".visitedlyr"), (e) => ({
      title: e.querySelector("b").innerText
    }))
  );

  await browser.close();
  console.log(songs)
}


