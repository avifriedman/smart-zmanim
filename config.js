// ==========================================================
// קובץ הגדרות - יש לערוך את הנתונים כאן בלבד
// ==========================================================

const config = {
    // שם בית הכנסת שיוצג בראש העמוד
    synagogueName: "בית הכנסת המרכזי",

    // הגדרות מיקום לקביעת זמני היום
    location: {
        latitude: 31.778, // קו רוחב (לדוגמה: ירושלים)
        longitude: 35.235, // קו אורך
        timezone: "Asia/Jerusalem" // אזור זמן
    },

    // אילו זמני היום להציג בלוח (true = הצג, false = הסתר)
    displayedZmanim: {
        alotHaShachar: true,     // עלות השחר
        netzHaChama: true,      // הנץ החמה
        sofZmanShma: true,      // סוף זמן קריאת שמע
        sofZmanTfilla: true,    // סוף זמן תפילה
        chatzot: true,          // חצות היום
        minchaGedola: true,     // מנחה גדולה
        plagHaMincha: false,     // פלג המנחה
        shkia: true,            // שקיעת החמה
        tzeitHaKochavim: true   // צאת הכוכבים
    },

    // זמני תפילות קבועים
    prayerTimes: {
        // תפילות יום חול
        weekday: {
            shacharit: "07:00",
            mincha: "17:30",
            arvit: "19:45"
        },
        // תפילות שבת
        shabbat: {
            // זמן מנחה בערב שבת יחושב אוטומטית לפי שעת הדלקת נרות
            // לדוגמה: "10" פירושו 10 דקות לפני הדלקת נרות
            minchaErevShabbatOffset: -10, 
            shacharit: "08:30",
            mincha: "17:00",
            // זמן ערבית במוצ"ש יחושב אוטומטית לפי צאת השבת
            // לדוגמה: "20" פירושו 20 דקות אחרי צאת השבת
            arvitMotzashOffset: 20
        }
    }
};