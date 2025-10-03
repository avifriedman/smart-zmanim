document.addEventListener('DOMContentLoaded', () => {
    const { HDate, Location, Zmanim, HebrewCalendar } = hebcal;

    // פונקציה לעיצוב זמן (הוספת 0 אם צריך)
    const formatTime = (date) => {
        if (!date || !(date instanceof Date)) return 'N/A';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    
    // פונקציה לעדכון השעון הדיגיטלי
    const updateClock = () => {
        const now = new Date();
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('current-time').textContent = `${formatTime(now)}:${seconds}`;
    };

    // פונקציה ראשית לעדכון כלל התצוגה
    const updateDisplay = () => {
        const now = new Date();
        const hdate = new HDate(now);
        const location = new Location(config.location.latitude, config.location.longitude, config.location.timezone);
        const zmanim = new Zmanim(now, location.getLatitude(), location.getLongitude());
        
        // הגדרת שם בית הכנסת
        document.getElementById('synagogue-name').textContent = config.synagogueName;
        
        // הגדרת תאריכים
        document.getElementById('hebrew-date').textContent = hdate.toString('h');
        document.getElementById('gregorian-date').textContent = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // הצגת פרשת השבוע (רק בשבת)
        const parashaEl = document.getElementById('parasha');
        const parasha = HebrewCalendar.getParsha(hdate, false);
        if (parasha && parasha.length > 0) {
            parashaEl.textContent = `פרשת השבוע: ${parasha[0]}`;
        } else {
            const specialShabbat = HebrewCalendar.getSpecialShabbat(hdate);
            if (specialShabbat) {
                parashaEl.textContent = specialShabbat;
            } else {
                parashaEl.textContent = '';
            }
        }

        // הצגת זמני היום
        const zmanimTable = document.getElementById('zmanim-table').querySelector('tbody');
        zmanimTable.innerHTML = '';
        const zmanimMap = {
            alotHaShachar: "עלות השחר",
            netzHaChama: "הנץ החמה",
            sofZmanShma: "סוף זמן ק"ש",
            sofZmanTfilla: "סוף זמן תפילה",
            chatzot: "חצות היום",
            minchaGedola: "מנחה גדולה",
            plagHaMincha: "פלג המנחה",
            shkia: "שקיעת החמה",
            tzeitHaKochavim: "צאת הכוכבים"
        };

        for (const [key, name] of Object.entries(zmanimMap)) {
            if (config.displayedZmanim[key]) {
                const time = zmanim[key] ? formatTime(zmanim[key]) : formatTime(zmanim.getZman(key));
                zmanimTable.innerHTML += `<tr><td>${name}</td><td>${time}</td></tr>`;
            }
        }

        // הצגת זמני התפילות
        const tefillotTable = document.getElementById('tefillot-table').querySelector('tbody');
        tefillotTable.innerHTML = '';
        
        if (hdate.getDay() === 6) { // שבת
            const candleLighting = new Date(zmanim.candleLighting());
            const havdalah = new Date(zmanim.havdalah());

            const minchaErev = new Date(candleLighting.getTime() + config.prayerTimes.shabbat.minchaErevShabbatOffset * 60000);
            const arvitMotzash = new Date(havdalah.getTime() + config.prayerTimes.shabbat.arvitMotzashOffset * 60000);

            tefillotTable.innerHTML += `<tr><td>מנחה ערב שבת</td><td>${formatTime(minchaErev)}</td></tr>`;
            tefillotTable.innerHTML += `<tr><td>שחרית</td><td>${config.prayerTimes.shabbat.shacharit}</td></tr>`;
            tefillotTable.innerHTML += `<tr><td>מנחה</td><td>${config.prayerTimes.shabbat.mincha}</td></tr>`;
            tefillotTable.innerHTML += `<tr><td>ערבית מוצ"ש</td><td>${formatTime(arvitMotzash)}</td></tr>`;
        } else { // יום חול
            tefillotTable.innerHTML += `<tr><td>שחרית</td><td>${config.prayerTimes.weekday.shacharit}</td></tr>`;
            tefillotTable.innerHTML += `<tr><td>מנחה</td><td>${config.prayerTimes.weekday.mincha}</td></tr>`;
            tefillotTable.innerHTML += `<tr><td>ערבית</td><td>${config.prayerTimes.weekday.arvit}</td></tr>`;
        }
    };

    // הרצה ראשונית וקביעת אינטרוולים לעדכון
    updateDisplay();
    updateClock();
    setInterval(updateClock, 1000); // עדכון שעון כל שנייה
    setInterval(updateDisplay, 60000); // עדכון כלל הנתונים כל דקה
});