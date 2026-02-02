const radioStations = [
    // ========== NORTH AMERICA - EAST ==========
    {
        name: "WKCR-FM",
        url: "https://wkcr.streamguys1.com/live.m3u", 
        city: "New York",
        timezone: "America/New_York",
        category: "favorite",
        genres: "Free Jazz, Avant-Garde, Classical, New Music, American Roots, Salsa, Experimental"
    },
    {
        name: "n10.as",
        url: "https://n10as.out.airtime.pro/n10as_a",
        city: "Montréal",
        timezone: "America/Toronto",
        category: "favorite",
        genres: "Experimental, Electronic, Ambient, Sound Art"
    },
    {
        name: "WBGO Jazz 88",
        url: "https://ais-sa8.cdnstream1.com/3629_128.mp3",
        city: "Newark",
        timezone: "America/New_York",
        category: "favorite",
        genres: "Jazz, Blues, Soul, R&B, Bebop, Latin Jazz"
    },
    {
        name: "New Sounds - WQXR-HD2",
        url: "https://q2stream.wqxr.org/q2",
        city: "New York",
        timezone: "America/New_York",
        genres: "New Music, Contemporary Classical, World, Electronic"
    },
    {
        name: "WNYC-FM",
        url: "https://fm939.wnyc.org/wnycfm",
        city: "New York",
        timezone: "America/New_York",
        category: "favorite",
        genres: "Public Radio, News, Talk, Cultural Programming"
    },
    {
        name: "WQXR",
        url: "https://stream.wqxr.org/wqxr.mp3", //Should I instead use "https://stream.wqxr.org/wqxr"?
        city: "New York",
        timezone: "America/New_York",
        genres: "Classical, Opera, Symphonic"
    },
    {
        name: "WFMU",
        url: "https://stream0.wfmu.org/freeform-high.aac",
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Freeform, Experimental, Garage Rock, Noise, Outsider Music, Eclectic"
    },
    {
        name: "WFMU's Sheena's Jungle Room",
        url: "https://stream0.wfmu.org/sheena", 
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Exotica, Lounge, Surf, Garage, Psych"
    },
    {
        name: "WXYC",
        url: "https://audio-mp3.ibiblio.org/wxyc.mp3", 
        city: "Chapel Hill",
        timezone: "America/New_York",
        genres: "Freeform, Indie Rock, Hip Hop, Electronic, Cyclic"
    },
    {
        name: "The Lot Radio",
        url: "https://thelot.out.airtime.pro/thelot_a",
        city: "Brooklyn",
        timezone: "America/New_York",
        category: "favorite",
        genres: "Eclectic, Underground, Electronic, Disco, House, Community"
    },
    
    // ========== NORTH AMERICA - SOUTH ==========
    {
        name: "WWOZ",
        url: "https://wwoz-sc.streamguys1.com/wwoz-hi.mp3",
        city: "New Orleans",
        timezone: "America/Chicago",
        category: "favorite",
        genres: "New Orleans Jazz, Zydeco, Cajun, Swamp Pop, Blues, R&B, Funk, Soul"
    },
    
    // ========== NORTH AMERICA - MIDWEST ==========
    {
        name: "WFMT Classical Music",
        url: "https://wfmt-live.streamguys1.com/wfmt128-mp3",
        city: "Chicago",
        timezone: "America/Chicago",
        genres: "Classical, Folk, Opera, Live Studio Performances"
    },
    {
        name: "WBEZ",
        url: "https://stream.wbez.org/wbez128.mp3",
        city: "Chicago",
        timezone: "America/Chicago",
        genres: "NPR News, Talk, Storytelling"
    },
    {
        name: "KGRA",
        url: "https://www.radioking.com/play/kgra-digital-broadcasting/508184",
        city: "Independence",
        timezone: "America/Chicago",
        genres: "Paranormal, UFOlogy, Alternative Talk, Conspiracies, Fringe Science"
    },
    
    // ========== NORTH AMERICA - MOUNTAIN ==========
    {
        name: "KBYU-FM Classical 89",
        url: "https://radio.byub.org/classical89/classical89_mp3",
        city: "Salt Lake City",
        timezone: "America/Denver",
        genres: "Classical, Opera, Choral, Chamber Music, Symphonic"
    },
    {
        name: "KUER-FM",
        url: "https://kuer.streamguys1.com/high_icy",
        city: "Salt Lake City",
        timezone: "America/Denver",
        genres: "NPR News, Jazz (Nightly), Indie Rock (HD2), Public Radio, Storytelling"
    },
    {
        name: "KUVO Jazz",
        url: "https://kuvo-ice.streamguys1.com/kuvo-mp3-128",
        city: "Denver",
        timezone: "America/Denver",
        genres: "Jazz, Blues, Latin Jazz, Soul, Public Radio"
    },
    
    // ========== NORTH AMERICA - WEST COAST ==========
    {
        name: "KCSM Jazz 91.1",
        url: "https://ice7.securenetsystems.net/KCSM2",
        city: "San Mateo",
        timezone: "America/Los_Angeles",
        genres: "Jazz, Bebop, Big Band, Latin Jazz, Blues"
    },
    {
        name: "dublab",
        url: "https://dublab.out.airtime.pro/dublab_a",
        city: "Los Angeles",
        timezone: "America/Los_Angeles",
        genres: "Future Roots, Ambient, Experimental, Psych, Electronic, Indie"
    },
    {
        name: "KFJC",
        url: "https://netcast.kfjc.org/", 
        city: "Los Altos Hills",
        timezone: "America/Los_Angeles",
        genres: "Psychedelic, Surf, Experimental, Noise, Lo-Fi, Drone, Metal"
    },
    
    // ========== CANADA ==========
    {
        name: "CBC Music Toronto",
        url: "https://cbcliveradio-lh.akamaihd.net/i/CBCR2_TOR@383180/master.m3u8",
        city: "Toronto",
        timezone: "America/Toronto",
        category: "favorite",
        genres: "Eclectic, Canadian, Indie, Jazz, Classical, Folk, World"
    },
    {
        name: "CBC Radio One Toronto",
        url: "https://cbcliveradio-lh.akamaihd.net/i/CBCR1_TOR@118420/master.m3u8",
        city: "Toronto",
        timezone: "America/Toronto",
        category: "favorite",
        genres: "Public Radio, News, Talk, Arts, Culture"
    },
    {
        name: "CKUA Radio",
        url: "https://ckua.streamon.fm/listen-hls.m3u8",
        city: "Edmonton",
        timezone: "America/Edmonton",
        genres: "Eclectic, Jazz, Blues, Folk, Classical, World, Roots"
    },
    {
        name: "CJSW",
        url: "https://cjsw.leanstream.co/CJSWFM-MP3",
        city: "Calgary",
        timezone: "America/Edmonton",
        genres: "Freeform, Indie, Punk, Electronic, World, Experimental"
    },
    {
        name: "CITR",
        url: "https://live.citr.ca/live.mp3",
        city: "Vancouver",
        timezone: "America/Vancouver",
        category: "favorite",
        genres: "Freeform, Indie, Electronic, Punk, Talk, Community"
    },
    {
        name: "ICI Musique Montréal",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CBFXFM_SRC.mp3",
        city: "Montréal",
        timezone: "America/Toronto",
        genres: "French Canadian, Classical, Jazz, World, Folk, French-language Chanson"
    },
    
    // ========== BRAZIL ==========
    {
        name: "Rádio MEC FM",
        url: "https://radiomecfm-stream.ebc.com.br/ebc/radiomecfm/playlist.m3u8",
        city: "Rio de Janeiro",
        timezone: "America/Sao_Paulo",
        genres: "Classical, Choro, Instrumental Brazilian, Bossa Nova, Chamber Music"
    },
    {
        name: "Rádio USP FM",
        url: "https://stream.radio.usp.br:8443/uspfm.mp3",
        city: "São Paulo",
        timezone: "America/Sao_Paulo",
        category: "favorite",
        genres: "Eclectic, Brazilian, Jazz, Rock, World, MPB, University"
    },
    {
        name: "Rádio Cultura FM São Paulo",
        url: "https://stream-ice.culturafm.com.br:8443/culturafm.aac",
        city: "São Paulo",
        timezone: "America/Sao_Paulo",
        genres: "Classical, Opera, Chamber Music, Symphonic"
    },
    {
        name: "Nova Brasil FM Recife",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_REC.mp3",
        city: "Recife",
        timezone: "America/Recife",
        genres: "MPB (Música Popular Brasileira), Brazilian Pop, Samba, Adult Contemporary"
    },
    {
        name: "Rádio Eldorado São Paulo",
        url: "https://ice.fabricahost.com.br/radioeldoradofm",
        city: "São Paulo",
        timezone: "America/Sao_Paulo",
        genres: "News, Classical, Jazz, MPB, Culture"
    },

    // ========== EUROPE - UK ==========
    {
        name: "BBC Radio 3",
        url: "https://as-hls-ww-live.akamaized.net/pool_23461179/live/ww/bbc_radio_three/bbc_radio_three.isml/bbc_radio_three-audio%3d96000.norewind.m3u8",
        city: "London",
        timezone: "Europe/London",
        genres: "Classical, Contemporary Classical, Opera, Jazz, World Music, Drama, Arts"
    },
    {
        name: "BBC Radio 6 Music",
        url: "https://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d96000.norewind.m3u8",
        city: "London",
        timezone: "Europe/London",
        genres: "Alternative, Indie, Funk, Soul, Dance, Reggae, Experimental"
    },
    {
        name: "BBC Radio 2",
        url: "https://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d96000.norewind.m3u8",
        city: "London",
        timezone: "Europe/London",
        genres: "Adult Contemporary, Pop, Soul, Country, Folk, Soft Rock"
    },
    {
        name: "NTS Radio 1",
        url: "https://stream-relay-geo.ntslive.net/stream",
        city: "London",
        timezone: "Europe/London",
        genres: "Eclectic, Underground, Electronic, Hip Hop"
    },
    {
        name: "NTS Radio 2",
        url: "https://stream-relay-geo.ntslive.net/stream2",
        city: "London",
        timezone: "Europe/London",
        genres: "Eclectic, Underground"
    },
    {
        name: "NTS Sweat",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape24",
        city: "London",
        timezone: "Europe/London",
        genres: "Club, Baile Funk, Reggaeton, Dance"
    },
    {
        name: "NTS Low Key",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape2",
        city: "London",
        timezone: "Europe/London",
        genres: "Lo-Fi Hip Hop, R&B, Ambient"
    },
    {
        name: "NTS Poolside",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape4",
        city: "London",
        timezone: "Europe/London",
        genres: "Balearic, Boogie, Sophisti-Pop"
    },
    {
        name: "NTS Feelings",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape27",
        city: "London",
        timezone: "Europe/London",
        genres: "Sweet Soul, Gospel, Boogie"
    },
    {
        name: "NTS The Tube",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape26",
        city: "London",
        timezone: "Europe/London",
        genres: "Post-Punk, Industrial, Minimal Wave"
    },
    {
        name: "NTS Rap House",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape22",
        city: "London",
        timezone: "Europe/London",
        genres: "Rap, Hip Hop, Trap"
    },
    {
        name: "NTS Slow Focus",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape",
        city: "London",
        timezone: "Europe/London",
        genres: "Ambient, Drone"
    },
    {
        name: "NTS Expansions",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape3",
        city: "London",
        timezone: "Europe/London",
        genres: "Jazz, Fusion, Spiritual Jazz"
    },
    {
        name: "NTS Island Time",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape21",
        city: "London",
        timezone: "Europe/London",
        genres: "Reggae, Dub, Dancehall"
    },
    {
        name: "NTS Memory Lane",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape6",
        city: "London",
        timezone: "Europe/London",
        genres: "Psychedelic, Folk, Oldies"
    },
    {
        name: "NTS 4 To The Floor",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape5",
        city: "London",
        timezone: "Europe/London",
        genres: "House, Techno"
    },
    {
        name: "NTS Field Recordings",
        url: "https://stream-mixtape-geo.ntslive.net/mixtape23",
        city: "London",
        timezone: "Europe/London",
        genres: "Field Recordings, Ambient"
    },
    {
        name: "Resonance FM",
        url: "https://stream.resonance.fm/resonance",
        city: "London",
        timezone: "Europe/London",
        genres: "Sound Art, Experimental, Community, Avant-Garde, Spoken Word, Field Recordings"
    },
    {
        name: "Noods Radio",
        url: "https://noodsradio.out.airtime.pro/noodsradio_a",
        city: "Bristol",
        timezone: "Europe/London",
        genres: "Underground, Electronic, Post-Punk, Industrial, Techno, Ambient"
    },
    {
        name: "Soho Radio",
        url: "https://s2.radio.co/s2c3cc784b/listen",
        city: "London",
        timezone: "Europe/London",
        category: "favorite",
        genres: "Eclectic, Electronic, Indie, Soul, Jazz, Community"
    },
    {
        name: "Worldwide FM",
        url: "https://worldwidefm.out.airtime.pro/worldwidefm_a",
        city: "London",
        timezone: "Europe/London",
        genres: "Global, Jazz, Soul, Electronic, World"
    },
    {
        name: "Balamii",
        url: "https://balamii.out.airtime.pro/balamii_a",
        city: "London",
        timezone: "Europe/London",
        genres: "Grime, UK Bass, Electronic, Club"
    },
    
    // ========== EUROPE - FRANCE ==========
    {
        name: "TSF Jazz",
        url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Jazz, Swing, Bossa Nova, Soul, Blues"
    },
    {
        name: "FIP",
        url: "https://icecast.radiofrance.fr/fip-hifi.aac",
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Eclectic, World, Jazz, Rock, Electronic, Soul"
    },
    {
        name: "FIP POP",
        url: "https://icecast.radiofrance.fr/fippop-midfi.mp3",
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Pop, Rock, Chanson"
    },
    {
        name: "FIP Hip Hop",
        url: "https://icecast.radiofrance.fr/fiphiphop-midfi.mp3",
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Hip Hop, Rap, R&B"
    },
    {
        name: "FIP autour du jazz",
        url: "https://direct.fipradio.fr/live/fip-webradio2.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Jazz"
    },
    {
        name: "FIP autour du monde",
        url: "https://direct.fipradio.fr/live/fip-webradio4.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "World Music"
    },
    {
        name: "FIP autour du groove",
        url: "https://direct.fipradio.fr/live/fip-webradio3.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Funk, Soul, Groove, R&B"
    },
    {
        name: "FIP Sacré français !",
        url: "https://icecast.radiofrance.fr/fipsacrefrancais-midfi.mp3",
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "French Chanson, French Pop"
    },
    {
        name: "Tout nouveau, tout FIP",
        url: "https://direct.fipradio.fr/live/fip-webradio5.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "New Releases, Eclectic"
    },
    {
        name: "FIP autour de l'électro",
        imageFilename: "fip-electro",
        url: "https://direct.fipradio.fr/live/fip-webradio8.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Electronic, Electro"
    },
    
    // ========== EUROPE - GERMANY ==========
    {
        name: "BR-Klassik",
        url: "https://dispatcher.rndfnk.com/br/brklassik/live/mp3/high",
        city: "Munich",
        timezone: "Europe/Berlin",
        genres: "Classical, Film Scores, Jazz (Late Night), Contemporary Classical"
    },
    {
        name: "dublab DE",
        url: "https://dublabde.out.airtime.pro:8000/dublabde_a", 
        city: "Cologne",
        timezone: "Europe/Berlin",
        genres: "Electronic, Ambient, Experimental, Jazz, Krautrock"
    },
    {
        name: "Refuge Worldwide",
        url: "https://streaming.radio.co/s3699c5e49/listen",
        city: "Berlin",
        timezone: "Europe/Berlin",
        genres: "Community, Electronic, Social Issues, Talk, Global Club, Ambient"
    },
    {
        name: "Cashmere Radio",
        url: "https://cashmereradio.out.airtime.pro/cashmereradio_a",
        city: "Berlin",
        timezone: "Europe/Berlin",
        genres: "Experimental, Ambient, Electronic, Sound Art"
    },
    
    // ========== EUROPE - NETHERLANDS ==========
    {
        name: "Red Light Radio",
        url: "https://redlightradio.out.airtime.pro:8443/redlightradio_a",
        city: "Amsterdam",
        timezone: "Europe/Amsterdam",
        category: "favorite",
        genres: "Underground, Electronic, Disco, House, Experimental"
    },
    
    // ========== EUROPE - SWITZERLAND ==========
    {
        name: "Radio Swiss Jazz",
        url: "https://stream.srg-ssr.ch/m/rsj/mp3_128",
        city: "Bern",
        timezone: "Europe/Zurich",
        genres: "Jazz, Soul, Blues, Standards, Swing, Bebop"
    },
    {
        name: "Radio Swiss Pop",
        url: "https://stream.srg-ssr.ch/m/rsp/mp3_128",
        city: "Bern",
        timezone: "Europe/Zurich",
        genres: "Pop, Soft Rock, Adult Contemporary, Oldies"
    },
    {
        name: "Radio Swiss Classic",
        url: "https://stream.srg-ssr.ch/m/rsc_de/mp3_128",
        city: "Bern",
        timezone: "Europe/Zurich",
        genres: "Classical, Baroque, Romantic, Chamber Music"
    },
    
    // ========== EUROPE - PORTUGAL ==========
    {
        name: "Antena 2",
        url: "https://radiocast.rtp.pt/antena280a.mp3",
        city: "Lisbon",
        timezone: "Europe/Lisbon",
        genres: "Classical, Culture, Early Music, Opera, Avant-Garde"
    },
    {
        name: "Antena 2 Jazz In",
        url: "https://radiocast.rtp.pt/antena2jazzin80a.mp3",
        city: "Lisbon",
        timezone: "Europe/Lisbon",
        genres: "Jazz, Smooth Jazz, Vocal Jazz, Bossa Nova"
    },
    
    // ========== EUROPE - BELGIUM ==========
    {
        name: "Kiosk Radio",
        url: "https://kioskradio.stream.laut.fm/kioskradio",
        city: "Brussels",
        timezone: "Europe/Brussels",
        genres: "Eclectic, Electronic, DJ Sets, Community, World, House, Disco"
    },
    
    // ========== MIDDLE EAST ==========
    {
        name: "Radio Alhara",
        url: "https://n0c.radiojar.com/4xqhqqjtdzzuv?rj-ttl=5",
        city: "Bethlehem",
        timezone: "Asia/Jerusalem",
        category: "favorite",
        genres: "Palestinian, Arabic, Electronic, Talk, Community"
    },
];
