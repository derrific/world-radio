const radioStations = [
    {
        name: "KBYU-FM Classical 89",
        url: "https://radio.byub.org/classical89/classical89_mp3",
        city: "Provo/Salt Lake City",
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
        name: "KGRA",
        url: "https://www.radioking.com/play/kgra-digital-broadcasting/508184",
        city: "Independence, Missouri",
        timezone: "America/Chicago",
        genres: "Paranormal, UFOlogy, Alternative Talk, Conspiracies, Fringe Science"
    },
    {
        name: "WQXR-FM",
        url: "https://stream.wqxr.org/wqxr",
        city: "New York",
        timezone: "America/New_York",
        genres: "Classical, Opera, Baroque, Romantic, Symphonic"
    },
    {
        name: "WKCR-FM",
        url: "https://wkcr.streamguys1.com/live.m3u", 
        city: "New York",
        timezone: "America/New_York",
        genres: "Free Jazz, Avant-Garde, Classical, New Music, American Roots, Salsa, Experimental"
    },
    {
        name: "WBGO Jazz 88",
        url: "https://ais-sa8.cdnstream1.com/3629_128.mp3",
        city: "Newark/New York",
        timezone: "America/New_York",
        genres: "Jazz, Blues, Soul, R&B, Bebop, Latin Jazz"
    },
    {
        name: "WWOZ",
        url: "https://wwoz-sc.streamguys1.com/wwoz-hi.mp3",
        city: "New Orleans",
        timezone: "America/Chicago",
        genres: "New Orleans Jazz, Zydeco, Cajun, Swamp Pop, Blues, R&B, Funk, Soul"
    },
    {
        name: "TSF Jazz",
        url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Jazz, Swing, Bossa Nova, Soul, Blues"
    },
    {
        name: "BBC Radio 3",
        url: "https://as-hls-ww-live.akamaized.net/pool_23461179/live/ww/bbc_radio_three/bbc_radio_three.isml/bbc_radio_three-audio%3d96000.norewind.m3u8",//Was "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/dash/nonuk/pc_hd_abr_v2/aks/bbc_radio_three.mpd",
        city: "London",
        timezone: "Europe/London",
        genres: "Classical, Contemporary Classical, Opera, Jazz, World Music, Drama, Arts"
    },
    {
        name: "BBC Radio 6 Music",
        url: "https://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d96000.norewind.m3u8",//Was "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/dash/nonuk/pc_hd_abr_v2/aks/bbc_6music.mpd",
        city: "London",
        timezone: "Europe/London",
        genres: "Alternative, Indie, Funk, Soul, Dance, Reggae, Experimental"
    },
    {
        name: "BBC Radio 2",
        url: "https://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d96000.norewind.m3u8",//Was "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/dash/nonuk/pc_hd_abr_v2/aks/bbc_radio_two.mpd",
        city: "London",
        timezone: "Europe/London",
        genres: "Adult Contemporary, Pop, Soul, Country, Folk, Soft Rock"
    },
    {
        name: "BR-Klassik",
        url: "https://dispatcher.rndfnk.com/br/brklassik/live/mp3/high",
        city: "Munich",
        timezone: "Europe/Berlin",
        genres: "Classical, Film Scores, Jazz (Late Night), Contemporary Classical"
    },
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
    {
        name: "Rádio MEC FM",
        url: "https://radiomecfm-stream.ebc.com.br/ebc/radiomecfm/playlist.m3u8",
        city: "Rio de Janeiro",
        timezone: "America/Sao_Paulo",
        genres: "Classical, Choro, Instrumental Brazilian, Bossa Nova, Chamber Music"
    },
    {
        name: "TMC Recife",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RT_REC.mp3",
        city: "Recife",
        timezone: "America/Recife",
        genres: "News, Sports, Debates, Interviews"
    },
    {
        name: "Nova Brasil FM Recife",
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_REC.mp3",
        city: "Recife",
        timezone: "America/Recife",
        genres: "MPB (Música Popular Brasileira), Brazilian Pop, Samba, Adult Contemporary"
    },
    {
        name: "WFMT Classical Music",
        url: "https://wfmt-live.streamguys1.com/wfmt128-mp3",
        city: "Chicago",
        timezone: "America/Chicago",
        genres: "Classical, Folk, Opera, Live Studio Performances"
    },
    {
        name: "Rádio Cultura Brasil",
        url: "https://stm8.painelvox.com:8052/;",
        city: "São Paulo",
        timezone: "America/Sao_Paulo",
        genres: "MPB, Brazilian Pop, Samba, Instrumental"
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
        name: "FIP autour de l’électro",
        imageFilename: "fip-electro",
        url: "https://direct.fipradio.fr/live/fip-webradio8.mp3", 
        city: "Paris",
        timezone: "Europe/Paris",
        genres: "Electronic, Electro"
    },
    {
        name: "KUVO Jazz",
        url: "https://kuvo-ice.streamguys1.com/kuvo-mp3-128",
        city: "Denver",
        timezone: "America/Denver",
        genres: "Jazz, Blues, Latin Jazz, Soul, Public Radio"
    },
    {
        name: "KCSM Jazz 91.1",
        url: "https://ice7.securenetsystems.net/KCSM2",
        city: "San Mateo, CA",
        timezone: "America/Los_Angeles",
        genres: "Jazz, Bebop, Big Band, Latin Jazz, Blues"
    },
    {
        name: "RNZ Concert",
        url: "https://radionz.co.nz/Concert_aac128", 
        city: "Wellington",
        timezone: "Pacific/Auckland",
        genres: "Classical, Contemporary Classical, Opera, Jazz, Arts News"
    },
    {
        name: "WFMU",
        url: "https://wfmu.org/wfmu.pls", 
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Freeform, Experimental, Garage Rock, Noise, Outsider Music, Eclectic"
    },
    {
        name: "WFMU's Ubu",
        url: "https://wfmu.org/wfmu_ubu.pls", 
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Avant-Garde, Experimental, Sound Art, Noise"
    },
    {
        name: "WFMU's Sheena's Jungle Room",
        url: "https://stream0.wfmu.org/sheena", 
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Exotica, Lounge, Surf, Garage, Psych"
    },
    {
        name: "WFMU's Rock'n'Soul Radio",
        url: "https://relay2.wfmu.org:80/rocknsoul-live.mp3", 
        city: "Jersey City",
        timezone: "America/New_York",
        genres: "Rock 'n' Soul, Garage, R&B, Oldies"
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
        name: "dublab",
        url: "https://dublab.out.airtime.pro/dublab_a",
        city: "Los Angeles",
        timezone: "America/Los_Angeles",
        genres: "Future Roots, Ambient, Experimental, Psych, Electronic, Indie"
    },
    {
        name: "dublab DE",
        url: "https://dublabde.out.airtime.pro:8000/dublabde_a", 
        city: "Cologne",
        timezone: "Europe/Berlin",
        genres: "Electronic, Ambient, Experimental, Jazz, Krautrock"
    },
    {
        name: "Resonance FM",
        url: "https://stream.resonance.fm/resonance",
        city: "London",
        timezone: "Europe/London",
        genres: "Sound Art, Experimental, Community, Avant-Garde, Spoken Word, Field Recordings"
    },
    {
        name: "KFJC",
        url: "https://netcast.kfjc.org/", 
        city: "Los Altos Hills",
        timezone: "America/Los_Angeles",
        genres: "Psychedelic, Surf, Experimental, Noise, Lo-Fi, Drone, Metal"
    },
    {
        name: "WZBC",
        url: "https://amber.streamguys.com:4860", 
        city: "Newton, MA",
        timezone: "America/New_York",
        genres: "No Commercial Potential, Modern Rock, Experimental, Noise, Industrial"
    },
    {
        name: "WXYC",
        url: "https://audio-mp3.ibiblio.org/wxyc.mp3", 
        city: "Chapel Hill",
        timezone: "America/New_York",
        genres: "Freeform, Indie Rock, Hip Hop, Electronic, Cyclic"
    },
    {
        name: "Kiosk Radio",
        url: "https://kioskradio.stream.laut.fm/kioskradio",
        city: "Brussels",
        timezone: "Europe/Brussels",
        genres: "Eclectic, Electronic, DJ Sets, Community, World, House, Disco"
    },
    {
        name: "Noods Radio",
        url: "https://noodsradio.out.airtime.pro/noodsradio_a",
        city: "Bristol",
        timezone: "Europe/London",
        genres: "Underground, Electronic, Post-Punk, Industrial, Techno, Ambient"
    },
    {
        name: "Refuge Worldwide",
        url: "https://streaming.radio.co/s3699c5e49/listen",
        city: "Berlin",
        timezone: "Europe/Berlin",
        genres: "Community, Electronic, Social Issues, Talk, Global Club, Ambient"
    },
    {
        name: "WBEZ",
        url: "https://stream.wbez.org/wbez128.mp3",
        city: "Chicago",
        timezone: "America/Chicago",
        genres: "NPR News, Talk, Storytelling"
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
        genres: "Public Radio, News, Talk, Cultural Programming"
    },
    {
        name: "93.9 HD2 | WQXR-FM - WNYC-HD2 (Classical)",
        url: "https://stream.wqxr.org/wqxr.mp3", //Was "https://stream.wqxr.org/wqxr",
        city: "New York",
        timezone: "America/New_York",
        genres: "Classical, Opera, Symphonic"
    },
    {
        name: "WNYC's New Standards",
        url: "https://tjc.wnyc.org/js-stream",
        city: "New York",
        timezone: "America/New_York",
        genres: "American Songbook, Jazz, Vocal Jazz, Pop Standards"
    },
];