const fetch = require('node-fetch');

async function huntForDescription() {
    console.log("🕵️‍♀️ Hunting for 'Honky Tonkin' description...");

    const now = new Date();
    const start = now.toISOString();
    const future = new Date(now);
    future.setDate(future.getDate() + 7); // Look 7 days ahead to ensure we find it
    const end = future.toISOString();

    const url = `https://spinitron.com/WKCR/calendar-feed?start=${start}&end=${end}&timeslot=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();
        
        // Find the specific show
        const show = data.find(s => s.title.includes("Honky Tonkin"));

        if (show) {
            console.log("\n🎉 Found the show! Here is EVERYTHING the API tells us about it:");
            console.log(JSON.stringify(show, null, 2));
            
            if (show.description || (show.text && show.text.length > 0)) {
                console.log("\n✅ YES! We have a description field.");
            } else {
                console.log("\n❌ NO. The 'text' and 'description' fields are empty.");
                console.log("This means the calendar feed is 'lightweight' and doesn't send descriptions.");
            }
        } else {
            console.log("\n❌ Could not find 'Honky Tonkin' in the next 7 days.");
        }

    } catch (e) {
        console.error(e);
    }
}

huntForDescription();