const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
    const station = event.queryStringParameters.station;

    // Only run for WKCR
    if (station !== 'wkcr') {
        return { statusCode: 400, body: JSON.stringify({ error: "Station not supported" }) };
    }

    try {
        const response = await fetch('https://www.cc-seas.columbia.edu/wkcr/schedule');
        const html = await response.text();
        const $ = cheerio.load(html);
        const shows = [];
        
        // TARGET: The class name you found in the Inspector
        $('.fc-list-item').each((i, el) => {
            const title = $(el).find('.fc-list-item-title').text().trim();
            const timeRange = $(el).find('.fc-list-item-time').text().trim(); // e.g. "2:00pm - 5:00pm"
            
            if (title && timeRange) {
                // Parse "2:00pm"
                const times = timeRange.split('-');
                if (times.length > 0) {
                    const startTimeStr = times[0].trim();
                    shows.push({
                        title: title,
                        desc: timeRange,
                        start: getNextOccurrenceInNY(startTimeStr), // Timezone Helper
                        duration: 180 // Default to 3h
                    });
                }
            }
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(shows)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

function getNextOccurrenceInNY(timeStr) {
    // Clean string
    timeStr = timeStr.toLowerCase().replace(/[^a-z0-9:]/g, '');
    let [time, modifier] = timeStr.split(/(am|pm)/);
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10) || 0;
    
    if (hours === 12) hours = 0;
    if (modifier === 'pm') hours += 12;
    
    // Create NY Time
    const now = new Date();
    const nyString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    const nyDate = new Date(nyString);
    nyDate.setHours(hours, minutes, 0, 0);
    
    // Return Timestamp
    const year = nyDate.getFullYear();
    const month = String(nyDate.getMonth() + 1).padStart(2, '0');
    const day = String(nyDate.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const isoString = `${year}-${month}-${day}T${hh}:${mm}:00-05:00`;
    return new Date(isoString).getTime();
}