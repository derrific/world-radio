const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const station = event.queryStringParameters.station;

    // Only run for WKCR
    if (station !== 'wkcr') {
        return { statusCode: 400, body: JSON.stringify({ error: "Station not supported" }) };
    }

    try {
        // 1. Calculate Time Range (Now to +24 Hours)
        // The API requires a start and end date to know what to send us.
        const now = new Date();
        const startStr = now.toISOString();
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endStr = tomorrow.toISOString();

        // 2. Fetch from the Secret API
        // We use the exact URL and "X-Requested-With" header you discovered.
        const url = `https://spinitron.com/WKCR/calendar-feed?start=${startStr}&end=${endStr}&timeslot=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'X-Requested-With': 'XMLHttpRequest' // <--- The Secret Handshake!
            }
        });

        if (!response.ok) {
            throw new Error(`Spinitron API failed: ${response.status}`);
        }

        const data = await response.json();
        const shows = [];

        // 3. Transform Data for Frontend
        data.forEach(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            
            // Calculate Duration in Minutes (for the width of the card)
            const durationMins = (endDate - startDate) / 60000;

            // Format a nice time string (e.g. "10:00 PM - 11:00 PM")
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            const timeRange = `${startDate.toLocaleTimeString('en-US', timeOptions)} - ${endDate.toLocaleTimeString('en-US', timeOptions)}`;

            shows.push({
                title: event.title,
                desc: timeRange, 
                start: startDate.getTime(), // Frontend needs a timestamp
                duration: durationMins
            });
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