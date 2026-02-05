/**
 * Default settings for time periods and sources
 */
export const TIME_PERIODS = {
    PERIOD_1640: {
        id: "1640",
        label: "1640",
        areasFile: "areas-1640",
        bordersFile: "borders-1640",
        pointsFile: "points-1640"
    },
    PERIOD_1760: {
        id: "1760",
        label: "1760",
        areasFile: "areas-1760",
        bordersFile: "borders-1760",
        pointsFile: "points-1760"
    }
}

export const SOURCES = [
    {
        title: "Адміністративно-територіальний устрій Правобережної України / М. Крикун, 1993",
        link: "https://chtyvo.org.ua/authors/Krykun_Mykola/Administratyvno-terytorialnyi_ustrii_Pravoberezhnoi_Ukrainy_v_XV-XVIII_st_Kordony_voievodstv_u_svitl/"
    },
    {
        title: "Воєводства Правобережної України у XVI-XVIII століттях / М. Крикун, 2012",
        link: "https://chtyvo.org.ua/authors/Krykun_Mykola/Voievodstva_Pravoberezhnoi_Ukrainy_u_XVI-XVIII_stolittiakh_Statti_i_materialy/"
    },
    {
        title: "Кордони й повітовий поділ Волинського воєводства у XVI-XVIII ст. / М. Крикун, 1990",
        link: "https://chtyvo.org.ua/authors/Krykun_Mykola/Kordony_i_povitovyi_podil_Volynskoho_voievodstva_v_KhVI-_KhVIII_st/"
    },
    {
        title: "Брацлавське воєводство у XVI-XVIII століттях / М. Крикун, 2008",
        link: "http://history.org.ua/LiberUA/978-966-8197-52-9/978-966-8197-52-9.pdf"
    },
    {
        title: "Повітовий поділ Подільського воєводства в останній чверті XVI-XVIII ст. / М. Крикун, 1997",
        link: "https://chtyvo.org.ua/authors/Krykun_Mykola/Povitovyi_podil_Podilskoho_voievodstva_v_ostannii_chverti_XVI-XVIII_st/"
    },
    {
        title: "Міста Руського та Белзького воєводств (15-18 ст.) / Б. Смерека",
        link: "https://www.arcgis.com/apps/MapSeries/index.html?appid=df89c504bd664a0fb98ab10d78605590"
    },
    {
        title: "Religie i wyznania w Koronie w XVIII wieku",
        link: "https://hgisb.kul.lublin.pl/azm/pmapper-4.2.0/map_default.phtml?config=wyznaniowa&language=pl&resetsession=ALL"
    },
    {
        title: "Чернігово-Сіверщина у складі Речі Посполитої (1618-1648 рр.) / П. Кулаковський, 2006",
        link: "https://chtyvo.org.ua/authors/Kulakovskyi_Petro/Chernihovo-Siverschyna_u_skladi_Rechi_Pospolytoi_1618-1648_rr/"
    },
    {
        title: "Берестейский повет до и после реформы 1565—1566 гг.: к истории административно-территориальных единиц в Великом Княжестве Литовском / А. Дзярнович, 2009",
        link: "http://history.org.ua/LiberUA/Book/litva1/4.pdf"
    },
    {
        title: "Любецьке староство (XVI - середина XVII ст.) / І. Кондратьєв, 2014",
        link: "https://shron1.chtyvo.org.ua/Kondratiev_Ihor/Liubetske_starostvo_XVI_-_seredyna_XVII_st.pdf"
    },
    {
        title: "Arcanum Maps",
        link: "https://maps.arcanum.com/en/"
    },
    {
        title: "Конфігурація та устрій Вольностей Війська Запорозького Низового за часів Нової Січі / В. І. Мільчев",
        link: "https://old.istznu.org/dc/file.php?host_id=1&path=/page/issues/20/20/milchev.pdf"
    },
    {
        title: "Територія та кордони Запорозьких земель / Т. А. Балабушевич, 1994",
        link: "https://shron1.chtyvo.org.ua/Balabushevych_Tetiana/Terytoriia_ta_kordony_zaporozkykh_zemel_16671775_pp.pdf"
    }
]

/**
 * Geographical names for consistency
 */
export const KINGDOM_NAME_MAP = {
    Poland: "Річ Посполита",
    Moldavia: "Молдавське князівство",
    Hungary: "Угорське королівство (Габсбурзька монархія)",
    Transylvania: "Трансильванське князівство",
    Russia: "Російська імперія",
    Turkey: "Османська імперія"
}

export const COUNTIES_NAME_MAP = {
    Rus: "Руське воєводство",
    Belz: "Белзьке воєводство",
    Brest: "Берестейське воєводство",
    Volyn: "Волинське воєводство",
    Podil: "Подільське воєводство",
    Bratslav: "Брацлавське воєводство",
    Kyiv: "Київське воєводство",
    Chernihiv: "Чернігівське воєводство",
    Hetmanate: "Гетьманщина",
    Slobozhanshchyna: "Слобідські козацькі полки",
    Zaporizhzhia: "Військо Запорозьке Низове"
}

/**
 * Flags and coat of arms icons
 */
export const FLAG_ICONS = [
    {
        name: KINGDOM_NAME_MAP.Poland,
        lang: "польською",
        iconUrl: new URL('../assets/icons/poland.png', import.meta.url).href,
    },
    {
        name: KINGDOM_NAME_MAP.Hungary,
        lang: "угорською",
        iconUrl: new URL('../assets/icons/habsburg.png', import.meta.url).href,
    },
    {
        name: KINGDOM_NAME_MAP.Moldavia,
        lang: "румунською",
        iconUrl: new URL('../assets/icons/moldavia.png', import.meta.url).href,
    },
    {
        name: KINGDOM_NAME_MAP.Transylvania,
        lang: "угорською",
        iconUrl: new URL('../assets/icons/transylvania.png', import.meta.url).href,
    },
    {
        name: KINGDOM_NAME_MAP.Turkey,
        lang: "османською",
        iconUrl: new URL('../assets/icons/turkey.png', import.meta.url).href,
    },
    {
        name: KINGDOM_NAME_MAP.Russia,
        lang: "російською",
        iconUrl: new URL('../assets/icons/russia.png', import.meta.url).href,
    }
]

/**
 * Base styles to avoid repetition
 */
export const STYLES = {
    BaseBorderStyle: {
        weight: 3,
        opacity: 0.5,
        color: '#000',
    },

    BaseFeatureStyle: {
        weight: 1.5,
        opacity: 0.5,
        color: '#000',
        dashArray: '4, 4',
        fillOpacity: 0.1
    },

    HoverFeatureStyle: {
        weight: 5,
        color: '#000',
        opacity: 0.8,
        fillOpacity: 0.3
    },

    BaseMarkerStyle: {
        radius: 8,
        fillColor: "#fff",
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1
    },

    FeatureFillColors: {
        Purple: "#8A2BE2",
        DarkPurple: "#663399",
        Brown: "#A52A2A",
        Crimson: "#DC143C",
        Cyan: "#008B8B",
        Pink: "#FF1493",
        Green: "#006400",
        Olive: "#808000",
        Blue: "#1E90FF",
        Gold: "#FFD700",
        Orange: "#FFA500",
        OrangeRed: "#FF4500",
        Default: "#666"
    },

    MarkerFillColors: {
        LEVEL1: "#ff4f4f",
        LEVEL2: "#ff4f4f",
        LEVEL3: "#fff64f"
    }
}