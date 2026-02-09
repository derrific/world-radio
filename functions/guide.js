const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
    const station = event.queryStringParameters.station;

    if (station !== 'wkcr') {
        return { statusCode: 400, body: JSON.stringify({ error: "Station not supported" }) };
    }

    try {
        // 1. Fetch the WKCR Schedule
        const response = await fetch('https://www.cc-seas.columbia.edu/wkcr/schedule');
        const html = await response.text();
        const $ = cheerio.load(html);

        const shows = [];
        
        // 2. The "Surgeon" Strategy
        // We target the specific class you found: .fc-list-item-title
        // The time is usually in the sibling element: .fc-list-item-time
        
        $('.fc-list-item').each((i, el) => {
            // Get the Title
            const titleEl = $(el).find('.fc-list-item-title');
            const title = titleEl.text().trim();
            
            // Get the Time (e.g., "2:00pm - 5:00pm")
            const timeEl = $(el).find('.fc-list-item-time');
            const timeRange = timeEl.text().trim();
            
            if (title && timeRange) {
                // Parse "2:00pm"
                const times = timeRange.split('-');
                if (times.length > 0) {
                    const startTimeStr = times[0].trim();
                    
                    shows.push({
                        title: title,
                        desc: timeRange, // "2:00pm - 5:00pm"
                        start: getNextOccurrenceInNY(startTimeStr),
                        duration: 180 // Default to 3h (we can calculate real duration later)
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

// HELPER: Handle the Timezone Math (New York)
function getNextOccurrenceInNY(timeStr) {
    // 1. Clean the string (remove non-breaking spaces, etc)
    timeStr = timeStr.toLowerCase().replace(/[^a-z0-9:]/g, '');
    
    // 2. Parse hours/minutes
    let [time, modifier] = timeStr.split(/(am|pm)/);
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10) || 0;
    
    if (hours === 12) hours = 0;
    if (modifier === 'pm') hours += 12;
    
    // 3. Create NY Time
    const now = new Date();
    const nyString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    const nyDate = new Date(nyString);
    
    nyDate.setHours(hours, minutes, 0, 0);
    
    // 4. Return Timestamp
    // Hacky but effective ISO construction for EST
    const year = nyDate.getFullYear();
    const month = String(nyDate.getMonth() + 1).padStart(2, '0');
    const day = String(nyDate.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    
    // Assume Standard Time (-05:00) for Feb
    const isoString = `${year}-${month}-${day}T${hh}:${mm}:00-05:00`;
    return new Date(isoString).getTime();
}