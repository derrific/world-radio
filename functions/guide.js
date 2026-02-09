const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
    const station = event.queryStringParameters.station;

    // We only support WKCR for now (Adding others later is easy)
    if (station !== 'wkcr') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Station not supported yet" })
        };
    }

    try {
        // 1. Fetch the official WKCR schedule page
        const response = await fetch('https://www.cc-seas.columbia.edu/wkcr/schedule');
        const html = await response.text();
        const $ = cheerio.load(html);

        const shows = [];
        const today = new Date();
        
        // 2. Parse the HTML
        // WKCR structure is usually: <div class="view-content"> ... <div class="item-list">
        // We look for the text pattern: "Time - Time: Show Name"
        
        // We will grab all text from the schedule rows
        $('.views-row').each((i, el) => {
            const timeRange = $(el).find('.date-display-single').text().trim(); 
            // Example: "2:00pm - 7:00pm"
            
            const title = $(el).find('.views-field-title .field-content').text().trim();
            // Example: "Sunday Profiles"
            
            const dateStr = $(el).find('.date-display-heading').text().trim();
            // Example: "Sunday, February 9, 2026" (Note: scraping depends on their exact layout)
            
            // NOTE: WKCR's page structure is tricky. 
            // Often they list the DATE in a heading above the rows.
            // For this V1 scraper, let's try a robust fallback:
            // We just want "What is on TODAY/NOW?"
            
            if (timeRange && title) {
                // Parse Start Time to UTC
                const times = timeRange.split(' - ');
                if (times.length === 2) {
                    shows.push({
                        station: 'WKCR',
                        title: title,
                        time_display: timeRange,
                        start_time: times[0], // "2:00pm"
                        raw_date: dateStr || "Today" // We might need to improve date parsing later
                    });
                }
            }
        });

        // 3. Clean up and format for our Frontend
        // We need to convert "2:00pm" into a real timestamp for your timeline
        const finalSchedule = shows.map(show => {
            return {
                title: show.title,
                desc: show.time_display, // Use the time string as description for now
                start: normalizeTime(show.start_time), // Helper function below
                duration: 180 // Default to 3 hours if we can't parse end time easily
            };
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalSchedule)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Helper: Convert "2:00pm" to a rough Timestamp for today
function normalizeTime(timeStr) {
    const now = new Date();
    const [time, modifier] = timeStr.split(/(am|pm)/i);
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') hours = '00';
    if (modifier.toLowerCase() === 'pm') hours = parseInt(hours, 10) + 12;
    
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    return date.getTime();
}