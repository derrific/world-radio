const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const station = event.queryStringParameters.station;

    if (station !== 'wkcr') {
        return { statusCode: 400, body: JSON.stringify({ error: "Station not supported" }) };
    }

    try {
        const now = new Date();
        const startStr = now.toISOString();
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endStr = tomorrow.toISOString();

        const url = `https://spinitron.com/WKCR/calendar-feed?start=${startStr}&end=${endStr}&timeslot=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Spinitron API failed: ${response.status}`);
        }

        const data = await response.json();
        const shows = [];

        data.forEach(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const durationMins = (endDate - startDate) / 60000;
            
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            const timeRange = `${startDate.toLocaleTimeString('en-US', timeOptions)} - ${endDate.toLocaleTimeString('en-US', timeOptions)}`;

            shows.push({
                title: event.title,
                desc: timeRange, 
                start: startDate.getTime(),
                duration: durationMins,
                // --- NEW: Grab the specific show URL ---
                url: event.url ? `https://spinitron.com${event.url}` : null
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