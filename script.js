function openFeatures() {
    var allElems = document.querySelectorAll(".elem");
    var allFullElems = document.querySelectorAll('.fullElem');
    var allFullElemsBackBtn = document.querySelectorAll('.fullElem .back');

    function closeAllFeatures() {
        allFullElems.forEach(function (fullElem) {
            fullElem.style.display = 'none';
        });
    }

    allElems.forEach(function (elem, index) {
        elem.addEventListener('click', function () {
            closeAllFeatures();
            var targetIndex = elem.dataset.id !== undefined ? parseInt(elem.dataset.id, 10) : index;
            if (allFullElems[targetIndex]) {
                allFullElems[targetIndex].style.display = 'block';
            }
        });
    });

    allFullElemsBackBtn.forEach(function (back) {
        back.addEventListener('click', function () {
            var fullElem = back.closest('.fullElem');
            if (fullElem) {
                fullElem.style.display = 'none';
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllFeatures();
        }
    });
}
openFeatures();

function setupVideoPreviews() {
    var isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopHover) return; 


    var allElems = document.querySelectorAll('.elem');
    allElems.forEach(function (elem) {
        var video = elem.querySelector('video');
        if (!video) return;

        elem.addEventListener('mouseenter', function () {
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
            }
            if (video.src) {
                video.play().catch(function () { });
            }
        });

        elem.addEventListener('mouseleave', function () {
            if (video.src) {
                video.pause();
                video.currentTime = 0;
            }
        });
    });
}
setupVideoPreviews();

function todoList() {
    let form = document.querySelector('.addTask form');
    let taskInput = document.querySelector('.addTask form #task-input');
    let taskDetailsInput = document.querySelector('.addTask form textarea');
    let taskCheckbox = document.querySelector('.addTask form #check');

    let currentTask = [];

    try {
        currentTask = JSON.parse(localStorage.getItem('currentTask')) || [];
    } catch (e) {
        currentTask = [];
    }

    function renderTask() {
        localStorage.setItem('currentTask', JSON.stringify(currentTask));
        var allTask = document.querySelector('.allTask');
        if (!allTask) return;

        if (currentTask.length === 0) {
            allTask.innerHTML = `<p style="color:var(--sec);opacity:0.6;font-size:18px;text-align:center;width:100%;margin-top:20px;">No tasks added yet. Start planning!</p>`;
            return;
        }

        var sum = '';
        currentTask.forEach(function (elem, idx) {
            var isImp = Boolean(elem.imp);
            var isDone = Boolean(elem.completed);
            var taskText = (elem.task || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var detailsText = elem.details ? `<p style="font-size:14px;color:var(--sec);opacity:0.8;margin-top:4px;">${elem.details.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '';
            sum += `
            <div class="task ${isDone ? 'completed' : ''}">
                <div>
                    <h5>${taskText} <span class="${isImp ? 'true' : 'false'}">${isImp ? 'Important' : ''}</span></h5>
                    ${detailsText}
                </div>
                <div class="task-actions">
                    <button class="task-complete-btn ${isDone ? 'completed' : ''}" data-index="${idx}" title="${isDone ? 'Mark as Pending' : 'Mark as Completed'}">
                        ${isDone ? '<i class="ri-check-line"></i> Done' : 'Mark as Completed'}
                    </button>
                    <button class="task-delete-btn" data-delete-index="${idx}" title="Delete Task">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>`;
        });

        allTask.innerHTML = sum;

        allTask.querySelectorAll('.task-complete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.getAttribute('data-index'), 10);
                if (!isNaN(idx) && currentTask[idx]) {
                    currentTask[idx].completed = !currentTask[idx].completed;
                    renderTask();
                }
            });
        });

        allTask.querySelectorAll('.task-delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.getAttribute('data-delete-index'), 10);
                if (!isNaN(idx) && currentTask[idx] !== undefined) {
                    currentTask.splice(idx, 1);
                    renderTask();
                }
            });
        });
    }

    renderTask();

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var title = taskInput.value.trim();
            if (!title) return;

            currentTask.push({
                task: title,
                details: taskDetailsInput.value.trim(),
                imp: taskCheckbox.checked,
                completed: false
            });
            renderTask();
            taskInput.value = '';
            taskDetailsInput.value = '';
            taskCheckbox.checked = false;
        });
    }
}
todoList();

function dailyPlanner() {
    var dayPlanner = document.querySelector('.day-planner');
    if (!dayPlanner) return;

    var dayPlanData = {};
    try {
        dayPlanData = JSON.parse(localStorage.getItem('dayPlanData')) || {};
    } catch (e) {
        dayPlanData = {};
    }

    var hours = Array.from({ length: 18 }, (_, idx) => {
        var startHour = 6 + idx;
        var endHour = 7 + idx;
        var formatH = (h) => {
            var suffix = h >= 12 ? 'PM' : 'AM';
            var val = h > 12 ? h - 12 : (h === 0 || h === 24 ? 12 : h);
            return `${val}:00 ${suffix}`;
        };
        return {
            label: `${formatH(startHour)} - ${formatH(endHour)}`,
            hour: startHour
        };
    });

    function renderPlanner() {
        var currentHour = new Date().getHours();
        var wholeDaySum = '';
        hours.forEach(function (elem, idx) {
            var savedData = (dayPlanData[idx] || '').replace(/"/g, '&quot;');
            var isCurrentHour = currentHour === elem.hour;
            wholeDaySum += `<div class="day-planner-time ${isCurrentHour ? 'current-hour' : ''}">
                <div class="planner-time-col">
                    <span class="planner-time-text">${elem.label}</span>
                </div>
                <input data-index="${idx}" type="text" placeholder="Add plan..." value="${savedData}">
            </div>`;
        });

        dayPlanner.innerHTML = wholeDaySum;

        dayPlanner.querySelectorAll('input').forEach(function (elem) {
            elem.addEventListener('input', function () {
                var idx = elem.getAttribute('data-index');
                dayPlanData[idx] = elem.value;
                localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData));
            });
        });
    }

    function updateCurrentHour() {
        var currentHour = new Date().getHours();
        var plannerSlots = dayPlanner.querySelectorAll('.day-planner-time');
        hours.forEach(function (elem, idx) {
            if (plannerSlots[idx]) {
                if (currentHour === elem.hour) {
                    plannerSlots[idx].classList.add('current-hour');
                } else {
                    plannerSlots[idx].classList.remove('current-hour');
                }
            }
        });
    }

    renderPlanner();

    setInterval(updateCurrentHour, 60000);
}
dailyPlanner();

function motivationalQuote() {
    var motivationQuote = document.querySelector('.motivation-2 h3');
    var motivationAuthor = document.querySelector('.motivation-3 h3');
    var newQuoteBtn = document.getElementById('new-quote-btn');
    if (!motivationQuote || !motivationAuthor) return;

    var isFetching = false;

    async function fetchQuote() {
        if (isFetching) return;
        isFetching = true;
        motivationQuote.innerHTML = '<em>Fetching inspiration...</em>';
        motivationAuthor.innerHTML = '';
        if (newQuoteBtn) newQuoteBtn.disabled = true;

        try {
            let response = await fetch('https://dummyjson.com/quotes/random');
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            let data = await response.json();
            if (data && data.quote) {
                motivationQuote.innerHTML = `"${data.quote}"`;
                motivationAuthor.innerHTML = `by ${data.author || 'Unknown'}`;
            }
        } catch (err) {
            console.warn("Quote fetch failed, using fallback:", err);
            motivationQuote.innerHTML = '"The secret of getting ahead is getting started."';
            motivationAuthor.innerHTML = 'by Mark Twain';
        } finally {
            isFetching = false;
            if (newQuoteBtn) newQuoteBtn.disabled = false;
        }
    }

    fetchQuote();

    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', fetchQuote);
    }
}
motivationalQuote();

function pomodoro() {
    let timer = document.querySelector('.pomo-time h1');
    var startBtn = document.querySelector('.pomo-time .start-timer');
    var pauseBtn = document.querySelector('.pomo-time .pause-timer');
    var resetBtn = document.querySelector('.pomo-time .reset-timer');
    var session = document.querySelector('.pomodoro-fullpage .session');
    if (!timer || !startBtn || !pauseBtn || !resetBtn || !session) return;

    var isWorkSession = true;
    var isRunning = false;
    let totalSeconds = 25 * 60;
    let timerInterval = null;

    function playChime() {
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
        } catch (e) {
            console.log("Audio notification skipped");
        }
    }

    function updateTimer() {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        timer.innerHTML = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateTimer();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                playChime();
                if (isWorkSession) {
                    isWorkSession = false;
                    totalSeconds = 5 * 60;
                    session.innerHTML = 'Take a Break';
                    session.style.backgroundColor = 'var(--blue)';
                } else {
                    isWorkSession = true;
                    totalSeconds = 25 * 60;
                    session.innerHTML = 'Work Session';
                    session.style.backgroundColor = 'var(--green)';
                }
                updateTimer();
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timerInterval);
    }

    function resetTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        isWorkSession = true;
        totalSeconds = 25 * 60;
        session.innerHTML = 'Work Session';
        session.style.backgroundColor = 'var(--green)';
        updateTimer();
    }

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    updateTimer();
}
pomodoro();

function weatherfunctionality() {
    var bgsky = document.querySelector('.bg-sky');
    var header1Time = document.querySelector('.header1 h1');
    var header1Date = document.querySelector('.header1 h2');
    var header1Location = document.querySelector('.header1 h4');
    var header2Temp = document.querySelector('.header2 h1');
    var header2Condition = document.querySelector('.header2 h2');
    var header2precipitation = document.querySelector('.header2 .precipitation');
    var header2humidity = document.querySelector('.header2 .humidity');
    var header2wind = document.querySelector('.header2 .wind');

    // WMO Weather code interpreter for Open-Meteo
    function getWmoCondition(code) {
        switch (code) {
            case 0: return 'Clear Sky';
            case 1: return 'Mainly Clear';
            case 2: return 'Partly Cloudy';
            case 3: return 'Overcast';
            case 45: case 48: return 'Foggy';
            case 51: case 53: case 55: return 'Drizzle';
            case 56: case 57: return 'Freezing Drizzle';
            case 61: return 'Slight Rain';
            case 63: return 'Moderate Rain';
            case 65: return 'Heavy Rain';
            case 66: case 67: return 'Freezing Rain';
            case 71: case 73: case 75: return 'Snowfall';
            case 77: return 'Snow Grains';
            case 80: case 81: case 82: return 'Rain Showers';
            case 85: case 86: return 'Snow Showers';
            case 95: return 'Thunderstorm';
            case 96: case 99: return 'Thunderstorm with Hail';
            default: return 'Clear Sky';
        }
    }

    async function fetchLocationName(lat, lon) {
        try {
            var res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) {
                var locData = await res.json();
                var city = locData.locality || locData.city || locData.principalSubdivision || 'Local Area';
                var region = locData.principalSubdivision || locData.countryName || '';
                return region ? `${city}, ${region}` : city;
            }
        } catch (e) {
            console.warn("Reverse geocode fallback:", e);
        }
        return 'Local Area';
    }

    async function weatherAPICall(lat = 21.23, lon = 72.86, customLocation = null) {
        try {
            var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m`;
            var response = await fetch(url);
            if (!response.ok) throw new Error(`Open-Meteo API returned ${response.status}`);
            var data = await response.json();

            if (data && data.current) {
                var current = data.current;
                if (header2Temp) header2Temp.innerHTML = `${Math.round(current.temperature_2m)}°C`;
                if (header2Condition) header2Condition.innerHTML = getWmoCondition(current.weather_code);
                if (header2wind) header2wind.innerHTML = `Wind: ${current.wind_speed_10m} km/h`;
                if (header2humidity) header2humidity.innerHTML = `Humidity: ${current.relative_humidity_2m}%`;
                var feelsLike = Math.round(current.apparent_temperature);
                if (header2precipitation) header2precipitation.innerHTML = `Feels Like: ${feelsLike}°C`;

                if (header1Location) {
                    if (customLocation) {
                        header1Location.innerHTML = customLocation;
                    } else {
                        fetchLocationName(lat, lon).then(name => {
                            if (header1Location) header1Location.innerHTML = name;
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching Open-Meteo weather:", err);
            if (header1Location) header1Location.innerHTML = 'Location unavailable';
            if (header2Condition) header2Condition.innerHTML = 'Clear Sky';
            if (header2Temp) header2Temp.innerHTML = '24°C';
            if (header2precipitation) header2precipitation.innerHTML = 'Feels Like: 24°C';
            if (header2humidity) header2humidity.innerHTML = 'Humidity: 50%';
            if (header2wind) header2wind.innerHTML = 'Wind: 10 km/h';
        }
    }

    function getUserLocation() {
        if (navigator.geolocation) {
            if (header1Location) header1Location.innerHTML = 'Detecting location...';
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;
                    weatherAPICall(lat, lon);
                },
                function (err) {
                    console.log("Geolocation fallback to default coords:", err.message);
                    weatherAPICall(21.23, 72.86, 'Utran, Gujarat');
                },
                { timeout: 8000 }
            );
        } else {
            weatherAPICall(21.23, 72.86, 'Utran, Gujarat');
        }
    }

    getUserLocation();

    var currentBg = '';
    var isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function updateBgSky(imgFirst, imgSec) {
        if (!bgsky) return;
        var firstEl = bgsky.querySelector('#first');
        var secEl = bgsky.querySelector('#sec');
        if (currentBg !== imgFirst) {
            currentBg = imgFirst;
            if (firstEl) firstEl.src = imgFirst;

            if (secEl && isDesktopHover && imgSec) {
                secEl.src = imgSec;
            }
        }
    }

    function timeDate() {
        const totaldaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date();
        var daysOfWeek = totaldaysOfWeek[date.getDay()];
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var dates = date.getDate();
        var month = months[date.getMonth()];
        var year = date.getFullYear();

        if (header1Date) header1Date.innerHTML = `${dates} ${month}, ${year}`;

        var isPM = hours >= 12;
        var displayHours = hours % 12 === 0 ? 12 : hours % 12;
        var ampm = isPM ? 'PM' : 'AM';
        if (header1Time) {
            header1Time.innerHTML = `${daysOfWeek}, ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
        }

        if (hours >= 5 && hours < 12) {
            updateBgSky("assets/images/morningimg.webp", "assets/images/morningGif.gif");
        } else if (hours >= 12 && hours < 16) {
            updateBgSky("assets/images/afternoon.webp", "assets/images/afternoonGif.gif");
        } else if (hours >= 16 && hours < 19) {
            updateBgSky("assets/images/evening.webp", "assets/images/eveningGif.gif");
        } else {
            updateBgSky("assets/images/night.webp", "assets/images/nightGif.gif");
        }
    }
    timeDate();
    setInterval(timeDate, 1000);
}
weatherfunctionality();

function changeTheme() {
    var themeToggle = document.querySelector('.theme-toggle');
    var Img = document.querySelectorAll('.elem img');
    var rootElement = document.documentElement;
    if (!themeToggle) return;

    var lightImg = [
        "assets/images/todoLight.webp",
        "assets/images/dailyplanLight.webp",
        "assets/images/motivationLight.webp",
        "assets/images/pomoLight.webp",
        "assets/images/goalLight.webp"
    ];

    var darkImg = [
        "assets/images/todoDark.webp",
        "assets/images/dailyplanDark.webp",
        "assets/images/motivationDark.webp",
        "assets/images/pomoDark.webp",
        "assets/images/goalDark.webp"
    ];

    function applyTheme(isDark) {
        if (isDark) {
            rootElement.classList.add('dark-theme');
            document.body.classList.add('dark-theme');

            Img.forEach((img, i) => {
                if (darkImg[i]) img.src = darkImg[i];
            });

            themeToggle.classList.add('dark-mode');
            themeToggle.setAttribute('aria-checked', 'true');
            localStorage.setItem('theme', 'dark');
        } else {
            rootElement.classList.remove('dark-theme');
            document.body.classList.remove('dark-theme');

            Img.forEach((img, i) => {
                if (lightImg[i]) img.src = lightImg[i];
            });

            themeToggle.classList.remove('dark-mode');
            themeToggle.setAttribute('aria-checked', 'false');
            localStorage.setItem('theme', 'light');
        }
    }

    var savedTheme = localStorage.getItem('theme');
    var isDark = savedTheme === 'dark';
    applyTheme(isDark);

    themeToggle.addEventListener('click', function () {
        isDark = !isDark;
        applyTheme(isDark);
    });

    themeToggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            isDark = !isDark;
            applyTheme(isDark);
        }
    });
}
changeTheme();

function dailyGoals() {
    var currentgoals = [];

    try {
        currentgoals = JSON.parse(localStorage.getItem('currentgoals')) || [];
    } catch (e) {
        currentgoals = [];
    }

    function updateProgress() {
        var progressText = document.querySelector('.goals-progress-text');
        var progressFill = document.querySelector('.goals-progress-fill');
        var total = currentgoals.length;
        var completed = currentgoals.filter(g => g.completed).length;
        var percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        if (progressText) {
            progressText.innerText = `${completed} of ${total} Completed (${percent}%)`;
        }
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    function rendergoals() {
        var allgoals = document.querySelector('.allgoals');
        if (!allgoals) return;

        updateProgress();

        if (currentgoals.length === 0) {
            allgoals.innerHTML = `<p style="color:var(--sec);opacity:0.6;font-size:18px;text-align:center;width:100%;margin-top:20px;">No goals added for today yet!</p>`;
            return;
        }

        var sum = '';
        currentgoals.forEach(function (elem, idx) {
            var isDone = Boolean(elem.completed);
            var goalText = (elem.goals || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var detailsText = (elem.details || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            sum += `<div class="daily-goals ${isDone ? 'completed' : ''}">
                <div class="d-goals">
                    <h2>${goalText}</h2>
                    <h5>${detailsText}</h5>
                </div>
                <div class="goal-actions">
                    <button class="goal-toggle-btn ${isDone ? 'done' : ''}" data-goal-index="${idx}" title="${isDone ? 'Mark as Incomplete' : 'Mark as Completed'}">
                        <i class="ri-check-line"></i>
                    </button>
                    <button class="goal-delete-btn" data-index="${idx}" title="Delete goal">
                        <i class="ri-close-fill"></i>
                    </button>
                </div>
            </div>`;
        });

        allgoals.innerHTML = sum;
        localStorage.setItem('currentgoals', JSON.stringify(currentgoals));

        allgoals.querySelectorAll('.goal-toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                let index = parseInt(btn.getAttribute('data-goal-index'), 10);
                if (!isNaN(index) && currentgoals[index]) {
                    currentgoals[index].completed = !currentgoals[index].completed;
                    rendergoals();
                }
            });
        });

        allgoals.querySelectorAll('.goal-delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                let index = parseInt(btn.getAttribute('data-index'), 10);
                if (!isNaN(index) && currentgoals[index] !== undefined) {
                    currentgoals.splice(index, 1);
                    rendergoals();
                }
            });
        });
    }
    rendergoals();

    let form = document.querySelector('.addgoals form');
    let goalsInput = document.querySelector('.addgoals form #goals-input');
    let goalsDetailsInput = document.querySelector('.addgoals form textarea');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var title = goalsInput.value.trim();
            if (!title) return;

            currentgoals.push({
                goals: title,
                details: goalsDetailsInput.value.trim(),
                completed: false
            });
            rendergoals();

            goalsInput.value = '';
            goalsDetailsInput.value = '';
        });
    }
}
dailyGoals();