document.getElementById('geocode-btn').addEventListener('click', async () => {
    const address = document.getElementById('address').value;
    const statusEl = document.getElementById('geocode-status');
    if (!address) {
        statusEl.textContent = 'יש להזין כתובת לחיפוש.';
        return;
    }

    statusEl.textContent = 'מחפש...';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            document.getElementById('latitude').value = location.lat;
            document.getElementById('longitude').value = location.lon;
            statusEl.textContent = `נמצא: ${location.display_name}`;
            // נניח שכל כתובת בישראל היא באזור הזמן של ירושלים
            document.getElementById('timezone').value = 'Asia/Jerusalem'; 
        } else {
            statusEl.textContent = 'הכתובת לא נמצאה. נסה לפרט יותר.';
        }
    } catch (error) {
        statusEl.textContent = 'שגיאה באיתור המיקום. בדוק חיבור לאינטרנט.';
        console.error('Geocoding error:', error);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // פונקציה למילוי הטופס עם הנתונים הקיימים מקובץ ההגדרות
    function populateForm() {
        document.getElementById('synagogueName').value = config.synagogueName;
        document.getElementById('latitude').value = config.location.latitude;
        document.getElementById('longitude').value = config.location.longitude;
        document.getElementById('timezone').value = config.location.timezone;

        for (const key in config.displayedZmanim) {
            document.getElementById(key).checked = config.displayedZmanim[key];
        }

        document.getElementById('wd-shacharit').value = config.prayerTimes.weekday.shacharit;
        document.getElementById('wd-mincha').value = config.prayerTimes.weekday.mincha;
        document.getElementById('wd-arvit').value = config.prayerTimes.weekday.arvit;
        
        document.getElementById('sh-minchaErev').value = config.prayerTimes.shabbat.minchaErevShabbatOffset;
        document.getElementById('sh-shacharit').value = config.prayerTimes.shabbat.shacharit;
        document.getElementById('sh-mincha').value = config.prayerTimes.shabbat.mincha;
        document.getElementById('sh-arvitMotzash').value = config.prayerTimes.shabbat.arvitMotzashOffset;
    }

    // פונקציה ליצירת קוד ההגדרות
    document.getElementById('generate-btn').addEventListener('click', () => {
        const newConfig = {
            synagogueName: document.getElementById('synagogueName').value,
            location: {
                latitude: parseFloat(document.getElementById('latitude').value),
                longitude: parseFloat(document.getElementById('longitude').value),
                timezone: document.getElementById('timezone').value
            },
            displayedZmanim: {},
            prayerTimes: {
                weekday: {
                    shacharit: document.getElementById('wd-shacharit').value,
                    mincha: document.getElementById('wd-mincha').value,
                    arvit: document.getElementById('wd-arvit').value
                },
                shabbat: {
                    minchaErevShabbatOffset: parseInt(document.getElementById('sh-minchaErev').value),
                    shacharit: document.getElementById('sh-shacharit').value,
                    mincha: document.getElementById('sh-mincha').value,
                    arvitMotzashOffset: parseInt(document.getElementById('sh-arvitMotzash').value)
                }
            }
        };

        const zmanimCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        zmanimCheckboxes.forEach(cb => {
            newConfig.displayedZmanim[cb.id] = cb.checked;
        });

        const outputString = `const config = ${JSON.stringify(newConfig, null, 4)};`;
        document.getElementById('output-code').value = outputString;
    });

    // הרצה ראשונית למילוי הטופס
    populateForm();
});
