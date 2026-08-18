const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route
app.get('/', (req, res) => {
    res.json({
        message: "Sri Lanka News Scraper API",
        endpoints: {
            sirasa: "/api/sirasa",
            derana: "/api/derana"
        }
    });
});

// 1. SIRASA  API
app.get('/api/sirasa', async (req, res) => {
    try {
        const { data } = await axios.get('https://sinhala.newsfirst.lk/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const articles = [];

        $('a').each((i, el) => {
            const link = $(el).attr('href');
            const title = $(el).text().trim();
            const parent = $(el).closest('div, article, section');
            const image = parent.find('img').attr('src') || parent.find('img').attr('data-src');
            const description = parent.find('p').text().trim();

            if (link && title && title.length > 15 && (link.includes('/202') || link.includes('/news/'))) {
                articles.push({
                    id: articles.length + 1,
                    title: title.replace(/\s+/g, ' '),
                    description: description || "විස්තරයක් ලබා දී නොමැත.",
                    link: link.startsWith('http') ? link : `https://sinhala.newsfirst.lk${link}`,
                    image: image || null
                });
            }
        });

        const uniqueArticles = Array.from(new Map(articles.map(item => [item['link'], item])).values());
        res.json({ status: true, source: "Sirasa Newsfirst", total: uniqueArticles.length, data: uniqueArticles });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// 2. DERANA API
app.get('/api/derana', async (req, res) => {
    try {
        const { data } = await axios.get('https://sinhala.adaderana.lk/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const articles = [];

        $('a').each((i, el) => {
            const link = $(el).attr('href');
            const title = $(el).text().trim();
            const parent = $(el).closest('div, .news-story, article, .story-text');
            const image = parent.find('img').attr('src');
            const description = parent.find('p').text().trim(); // Description එක ලබා ගැනීම

            if (link && title && title.length > 10 && (link.includes('news_comments.php') || link.includes('news.php'))) {
                const fullImage = image ? (image.startsWith('http') ? image : `https://sinhala.adaderana.lk/${image}`) : null;
                articles.push({
                    id: articles.length + 1,
                    title: title.replace(/\s+/g, ' '),
                    description: description || "විස්තරයක් ලබා දී නොමැත.",
                    link: link.startsWith('http') ? link : `https://sinhala.adaderana.lk/${link}`,
                    image: fullImage
                });
            }
        });

        const uniqueArticles = Array.from(new Map(articles.map(item => [item['link'], item])).values());
        res.json({ status: true, source: "Ada Derana", total: uniqueArticles.length, data: uniqueArticles });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
