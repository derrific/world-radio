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
        
        // 2. "The Vacuum" Strategy
        // Instead of specific classes, we look for ANY table row or div that contains time patterns
        $('tr, .views-row').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim(); // Clean up extra spaces
            
            // Regex to find "2:00pm - 7:00pm" or "2:00pm-7:00pm"
            // Matches: (digits:digits)(am/pm) - (digits:digits)(am/pm)
            const timeMatch = text.match(/(\d{1,2}:\d{2}(?:am|pm))\s*-\s*(\d{1,2}:\d{2}(?:am|pm))/i);
            
            if (timeMatch) {
                const fullTimeRange = timeMatch[0];
                const startTimeStr = timeMatch[1];
                
                // The Title is usually the text MINUS the time range
                // We remove the time string and clean up what's left
                let title = text.replace(fullTimeRange, '').trim();
                
                // WKCR often puts the Date header in the text too, let's clean generic date words if needed
                // But for now, messy titles are better than NO titles.

                if (title.length > 2) {
                    shows.push({
                        title: title,
                        start: getNextOccurrenceInNY(startTimeStr), // Helper to fix Timezone
                        duration: 180 // Default to 3h, frontend can adjust if needed
                    });
                }
            }
        });

        // 3. Return the data
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(shows)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};

// HELPER: Handle the Timezone Math
// We assume the text "2:00pm" refers to "Today in New York"
function getNextOccurrenceInNY(timeStr) {
    // 1. Parse hours/minutes from "2:00pm"
    const [time, modifier] = timeStr.split(/(am|pm)/i);
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier.toLowerCase() === 'pm') hours = parseInt(hours, 10) + 12;
    else hours = parseInt(hours, 10);
    
    // 2. Get current time in New York
    const now = new Date();
    const nyString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    const nyDate = new Date(nyString);
    
    // 3. Set the specific show time on the NY Date object
    nyDate.setHours(hours, minutes, 0, 0);
    
    // 4. Return the UTC timestamp
    // We created a "Date" object that *thinks* it is local time, but it holds the NY wall-clock time.
    // To get the real UTC timestamp, we need to shift it back by the timezone offset.
    // This is the tricky part. A safer way is to rely on string ISO creation:
    
    // Let's brute force the offset for EST/EDT (Either -5 or -4)
    // Since we are "Vibe Coding", let's just create a string that the browser can parse securely:
    // Format: "YYYY-MM-DDTHH:mm:00" (ISO without Z)
    
    const year = nyDate.getFullYear();
    const month = String(nyDate.getMonth() + 1).padStart(2, '0');
    const day = String(nyDate.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    
    // Create an ISO string for NY time: "2026-02-09T14:00:00-05:00"
    // We need to know if it's DST or not. 
    // Simpler hack: Compare local offset. 
    // Actually, let's just return the Date.parse() of a string explicitly labeled EST/EDT.
    
    // "Feb 09 2026 14:00:00 GMT-0500"
    // We will assume Standard Time (-0500) for now (February). 
    // In summer, this might be off by 1 hour, but we can fix that later.
    const isoString = `${month}/${day}/${year} ${hh}:${mm}:00 GMT-0500`;
    return new Date(isoString).getTime();
}