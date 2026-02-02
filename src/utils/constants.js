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
    }
]

/**
 * Base styles to avoid repetition
 */

export const STYLES = {
    BaseBorderStyle: {
        weight: 3,
        opacity: 0.7,
        color: '#000',
    },

    BaseFeatureStyle: {
        weight: 1.5,
        opacity: 0.7,
        color: '#000',
        dashArray: '4, 4',
        fillOpacity: 0.2
    },

    HoverFeatureStyle: {
        weight: 5,
        color: '#000',
        fillOpacity: 0.5
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
        BRACLAWSKIE: "#770c94",
        RUSKIE: "#2563EB",
        BELZKIE: "#6d940c",
        KIJOWSKIE: "#2c781d",
        KIJOWSKIE_1667: "#4cc533",
        PODOLSKIE: "#ca7900",
        WOLYNSKIE: "#eb2581",
        BRZESKOLITEWSKIE: "#eba925",
        CZERNIHOWSKIE: "#5a25eb",
        DEFAULT: "gray"
    },

    MarkerFillColors: {
        LEVEL1: "#ff4f4f",
        LEVEL2: "#ff4f4f",
        LEVEL3: "#fff64f"
    }
}