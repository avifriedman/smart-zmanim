document.addEventListener('DOMContentLoaded', () => {
    // טעינת המודולים הנדרשים מספריית Hebcal
    const { HDate, Location, Zmanim, HebrewCalendar } = hebcal;

    /**
     * פונקציה לעיצוב אובייקט Date למחרוזת "HH:MM"
     * @param {Date} date - אובייקט התאריך
     * @returns {string} - הזמן בפורמט HH:MM, או 'N/A' אם הקלט לא תקין
     */
    const formatTime = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date)) return 'N/A';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    
    /**
     * פונקציה לעדכון השעון הדיגיטלי הראשי כל שנייה
     */
    const updateClock = () => {
        const now = new Date();
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('current-time').textContent = `${formatTime(now)}:${seconds}`;
    };

    /**
     * פונקציה אסינכרונית למשיכת ועיבוד קובץ CSV שפורסם מגוגל שיטס
     * @param {string} url - הקישור לקובץ ה-CSV
     * @returns {Promise<Array<Object>>} - מערך של אובייקטים המייצגים את שורות הגיליון
     */
    const fetchGoogleSheet = async (url) => {
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            return []; // החזר מערך ריק אם אין URL תקין
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== ''); // סינון שורות ריקות
            if (lines.length < 2) return []; // אין נתונים

            const headers = lines[0].split(',').map(h => h.trim());
            return lines.slice(1).map(line => {
                const data = line.split(',');
                return headers.reduce((obj, nextKey, index) => {
                    obj[nextKey] = data[index] ? data[index].trim() : '';
                    return obj;
                }, {});
            });
        } catch (error) {
            console.error('Error fetching or parsing Google Sheet:', error);
            return []; // החזר מערך ריק במקרה של שגיאה
        }
    };
    
    /**
     * פונקציה ראשית לעדכון כלל התצוגה.
     * הפונקציה מושכת נתונים חיצוניים ומעדכנת את כל חלקי הלוח.
     */
    const updateDisplay = async () => {
        // 1. משיכת נתונים חיצוניים מגוגל שיטס
        const customTimes = await fetchGoogleSheet(config.customTimesSheetUrl);
        const announcements = await fetchGoogleSheet(config.announcementsSheetUrl);

        // 2. הגדרות זמן ומיקום בסיסיות
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // פורמט YYYY-MM-DD
        const hdate = new HDate(now);
        const location = new Location(config.location.latitude, config.location.longitude, config.location.timezone);
        const zmanim = new Zmanim(now, location.getLatitude(), location.getLongitude());
        
        // 3. עדכון אלמנטים סטטיים
        document.getElementById('synagogue-name').textContent = config.synagogueName;
        document.getElementById('hebrew-date').textContent = hdate.toString('h');
        document.getElementById('gregorian-date').textContent = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const parashaEl = document.getElementById('parasha');
        const parasha = HebrewCalendar.getParsha(hdate, false);
        if (parasha && parasha.length > 0) {
            parashaEl.textContent = `פרשת השבוע: ${parasha[0]}`;
        } else {
            parashaEl.textContent = '';
        }

        // 4. עדכון טבלת זמני היום
        const zmanimTable = document.getElementById('zmanim-table').querySelector('tbody');
        zmanimTable.innerHTML = '';
        const zmanimMap = {
            alotHaShachar: "עלות השחר", netzHaChama: "הנץ החמה", sofZmanShma: "סוף זמן ק\"ש",
            sofZmanTfilla: "סוף זמן תפילה", chatzot: "חצות היום", minchaGedola: "מנחה גדולה",
            plagHaMincha: "פלג המנחה", shkia: "שקיעת החמה", tzeitHaKochavim: "צאת הכוכבים"
        };

        for (const [key, name] of Object.entries(zmanimMap)) {
            if (config.displayedZmanim[key]) {
                const time = zmanim[key] ? formatTime(zmanim[key]) : formatTime(zmanim.getZman(key));
                zmanimTable.innerHTML += `<tr><td>${name}</td><td>${time}</td></tr>`;
            }
        }

        // 5. עדכון טבלת תפילות (עם שילוב נתונים מהשיטס)
        const tefillotTable = document.getElementById('tefillot-table').querySelector('tbody');
        tefillotTable.innerHTML = '';
        
        let prayerSchedule = {};
        if (hdate.getDay() === 6) { // שבת
            const candleLighting = new Date(zmanim.candleLighting());
            const havdalah = new Date(zmanim.havdalah());
            const minchaErev = new Date(candleLighting.getTime() + (config.prayerTimes.shabbat.minchaErevShabbatOffset * 60000));
            const arvitMotzash = new Date(havdalah.getTime() + (config.prayerTimes.shabbat.arvitMotzashOffset * 60000));

            prayerSchedule = {
                'מנחה ערב שבת': formatTime(minchaErev),
                'שחרית': config.prayerTimes.shabbat.shacharit,
                'מנחה': config.prayerTimes.shabbat.mincha,
                'ערבית מוצ"ש': formatTime(arvitMotzash)
            };
        } else { // יום חול
            prayerSchedule = { ...config.prayerTimes.weekday };
        }
        
        // דריסת זמנים קיימים או הוספת זמנים חדשים מהשיטס
        const todayCustomTimes = customTimes.filter(row => row['תאריך'] === todayStr);
        todayCustomTimes.forEach(row => {
            if(row['שם התפילה'] && row['שעה']) {
                prayerSchedule[row['שם התפילה']] = row['שעה'];
            }
        });

        for (const [name, time] of Object.entries(prayerSchedule)) {
            tefillotTable.innerHTML += `<tr><td>${name}</td><td>${time}</td></tr>`;
        }
        
        // 6. עדכון כתובית המודעות
        const announcementsContainer = document.querySelector('.announcements-container');
        const announcementsTicker = document.getElementById('announcements-ticker');
        const activeAnnouncements = announcements.filter(row => {
            return row['תאריך התחלה'] && row['תאריך סיום'] &&
                   todayStr >= row['תאריך התחלה'] && todayStr <= row['תאריך סיום'];
        });

        if (activeAnnouncements.length > 0) {
            announcementsContainer.style.display = 'block';
            announcementsTicker.textContent = activeAnnouncements.map(row => row['תוכן המודעה']).join('  •  ');
        } else {
            announcementsContainer.style.display = 'none';
        }
    };

    // הרצת הפונקציות והגדרת זמני רענון
    updateDisplay();
    updateClock();
    setInterval(updateClock, 1000); // עדכון שעון כל שנייה
    setInterval(updateDisplay, 300000); // רענון כלל הנתונים (כולל גוגל שיטס) כל 5 דקות
});
