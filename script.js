// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDk3CVmSZzzXCYP0C5QQhEG6jfzXnDThEA",
    authDomain: "lovemagic-e6191.firebaseapp.com",
    projectId: "lovemagic-e6191",
    storageBucket: "lovemagic-e6191.firebasestorage.app",
    messagingSenderId: "702442840878",
    appId: "1:702442840878:web:a1a60524f3765d34bb10bf",
    measurementId: "G-KT1BZ2CQ9F"
};

// تهيئة Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.log("Firebase already initialized");
}

const auth = firebase.auth();
const db = firebase.firestore();

// متغيرات عامة
let currentUser = null;
let currentLovePage = null;
let creationData = {
    yourName: '',
    loverName: '',
    poemType: '',
    poemContent: '',
    giftType: '',
    giftData: '',
    giftMessage: '',
    pageId: '',
    createdAt: null
};

// متغيرات المحادثة
let currentQuestionIndex = 0;
let heartClickCount = 0;
let backgroundMusic = null;
let heartAnimating = false;
let userMusicPlayer = null;
let backgroundMusicPlaying = true;

// أسئلة المحادثة (كل سؤال في صفحة منفصلة)
const conversationQuestions = [
    {
        id: 1,
        type: 'question',
        question: (loverName) => ` انتى ${loverName}؟`,
        response: 'اه ',
        background: '8.jpg'
    },
    {
        id: 2,
        type: 'question',
        question: (loverName) => `عاملة ايه ${loverName} 😊`,
        response: 'الحمد الله بخير ',
        background: '3.jpg'
    },
    {
        id: 3,
        type: 'question',
        question: (loverName) => `${loverName} عندي سر ليكِ...`,
        response: 'إيه هو!!',
        background: '10.jpg'
    },
    {
        id: 4,
        type: 'question',
        question: () => 'بس أنا مستحي أقولك...',
        response: 'إيه السر!',
        background: '12.jpg'
    },
    {
        id: 5,
        type: 'question',
        question: (loverName, yourName) => `تحبين ${yourName}؟`,
        response: 'هاا!',
        background: '7.jpg'
    },
    {
        id: 6,
        type: 'question',
        question: () => 'إيه هاا .. بتحبيه ولا لا؟',
        response: 'مش عارفة',
        background: '6.jpg'
    },
    {
        id: 7,
        type: 'heart',
        question: () => 'لو بتحبيه اضغطي على القلب ثلاث مرات 💖',
        background: '2.jpg'
    },
    {
        id: 8,
        type: 'poem',
        question: () => 'شوفى شعر كتبتهولك',
        background: '4.jpg'
    },
    {
        id: 9,
        type: 'gift',
        question: () => ' ده هدية ليكي برضو',
        background: '11.jpg'
    },
    {
        id: 10,
        type: 'final',
        question: () => 'اتمني انها تكون عجبتك  بحبك ❤️',
        background: '9.jpg'
    }
];

// صور حقيقية للهدايا
const giftImages = {
    'rose': 'https://images.unsplash.com/photo-1531324219692-3a9f5aef7f00?w=400&auto=format&fit=crop&q=60',
    'teddy': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w-400&auto=format&fit=crop&q=60',
    'necklace': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=60',
    'shawarma': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=60'
};

// أسماء الهدايا
const giftNames = {
    'rose': 'باقة ورد حمراء 🌹',
    'teddy': 'دبدوب ضخم 🧸',
    'necklace': 'سلسلة ذهبية رقيقة 💎',
    'shawarma': 'شاورما لذيذة مع كل التوابل 🥙'
};

// API الخاص بالذكاء الاصطناعي
const AI_API_KEY = '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';

// ==================== دوال التهيئة ====================

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من رابط الصفحة
    checkPageLink();
    
    // تهيئة خلفية القلوب
    initHeartsBackground();
    
    // إضافة المستمعين للأحداث
    initEventListeners();
    
    // التحقق من حالة تسجيل الدخول
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User logged in:", user.email);
            currentUser = user;
            loadUserData();
        } else {
            console.log("No user logged in");
            showPage('welcomePage');
        }
    });
});

// تهيئة خلفية القلوب المتحركة
function initHeartsBackground() {
    const heartsBg = document.querySelector('.hearts-background');
    if (!heartsBg) return;
    
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-bg';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 15}s`;
        heart.style.fontSize = `${20 + Math.random() * 30}px`;
        heartsBg.appendChild(heart);
    }
}

// إضافة مستمعي الأحداث
function initEventListeners() {
    // أزرار الصفحة الرئيسية
    document.getElementById('loginBtn')?.addEventListener('click', () => showPage('loginPage'));
    document.getElementById('signupBtn')?.addEventListener('click', () => showPage('signupPage'));
    
    // نموذج تسجيل الدخول
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        loginUser();
    });
    
    // نموذج إنشاء حساب
    document.getElementById('signupForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        signupUser();
    });
    
    // معلومات الحبيب
    const yourNameInput = document.getElementById('yourName');
    const loverNameInput = document.getElementById('loverName');
    
    if (yourNameInput) {
        yourNameInput.addEventListener('input', function() {
            creationData.yourName = this.value;
        });
    }
    
    if (loverNameInput) {
        loverNameInput.addEventListener('input', function() {
            creationData.loverName = this.value;
        });
    }
    
    // الشعر المخصص
    const customPoemInput = document.getElementById('customPoem');
    if (customPoemInput) {
        customPoemInput.addEventListener('input', function() {
            creationData.poemContent = this.value;
        });
    }
}

// ==================== دوال الصفحة الرئيسية ====================

// التحقق من رابط الصفحة
function checkPageLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('page');
    
    if (pageId) {
        loadLovePage(pageId);
    } else {
        // عرض صفحة الترحيب إذا لم يكن هناك صفحة
        showPage('welcomePage');
    }
}

// تحميل صفحة الحب
async function loadLovePage(pageId) {
    try {
        console.log("Loading love page:", pageId);
        const doc = await db.collection('lovePages').doc(pageId).get();
        if (doc.exists) {
            currentLovePage = { id: doc.id, ...doc.data() };
            console.log("Page loaded:", currentLovePage);
            showLovePage();
        } else {
            Swal.fire('خطأ', 'صفحة الحب غير موجودة', 'error').then(() => {
                window.location.href = window.location.origin;
            });
        }
    } catch (error) {
        console.error("Error loading page:", error);
        Swal.fire('خطأ', 'حدث خطأ في تحميل الصفحة', 'error').then(() => {
            window.location.href = window.location.origin;
        });
    }
}

// عرض صفحة الحب
function showLovePage() {
    const appElement = document.getElementById('app');
    const lovePageElement = document.getElementById('lovePage');
    
    if (appElement) appElement.classList.add('hidden');
    if (lovePageElement) lovePageElement.classList.remove('hidden');
    
    // بدء تشغيل موسيقى الخلفية
    playBackgroundMusic();
    
    // بدء المحادثة بالسؤال الأول
    currentQuestionIndex = 0;
    heartClickCount = 0;
    showQuestionPage();
}

// عرض صفحة معينة
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // إذا كانت صفحة الإنشاء، إعادة تعيين البيانات
    if (pageId === 'createPage') {
        resetCreationData();
        updateProgressBar(1);
    }
}

// ==================== دوال الموسيقى ====================

// تشغيل موسيقى الخلفية من الملفات المحلية
function playBackgroundMusic() {
    // إيقاف أي موسيقى سابقة
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic = null;
    }
    
    // إنشاء عنصر صوتي
    backgroundMusic = document.createElement('audio');
    backgroundMusic.id = 'bgMusic';
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3; // صوت هاديء (30% من القوة)
    
    // مسار الموسيقى من الموقع
    const musicPath = 'HOMESONG.mp3'; // تم تغيير المسار إلى HOMESONG.mp3
    
    // إضافة مصدر الصوت
    const source = document.createElement('source');
    source.src = musicPath;
    source.type = 'audio/mpeg';
    backgroundMusic.appendChild(source);
    
    // إضافة إلى الصفحة
    document.body.appendChild(backgroundMusic);
    
    // محاولة التشغيل التلقائي
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            backgroundMusicPlaying = true;
            console.log("Background music started");
        }).catch(error => {
            console.log("Autoplay prevented:", error);
            // إضافة زر تشغيل يدوي
            addMusicPlayButton();
        });
    }
}

// إيقاف موسيقى الخلفية
function stopBackgroundMusic() {
    if (backgroundMusic && backgroundMusicPlaying) {
        backgroundMusic.pause();
        backgroundMusicPlaying = false;
        console.log("Background music stopped");
    }
}

// إضافة زر تشغيل الموسيقى يدوياً
function addMusicPlayButton() {
    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicPlayBtn';
    musicBtn.className = 'music-play-btn';
    musicBtn.innerHTML = '<i class="fas fa-play"></i> تشغيل الموسيقى';
    musicBtn.onclick = () => {
        if (backgroundMusic) {
            backgroundMusic.play();
            backgroundMusicPlaying = true;
            musicBtn.remove();
        }
    };
    
    document.getElementById('lovePage')?.appendChild(musicBtn);
}

// ==================== دوال المحادثة ====================

// عرض صفحة السؤال الحالي
function showQuestionPage() {
    if (currentQuestionIndex >= conversationQuestions.length) {
        showFinalPage();
        return;
    }
    
    const question = conversationQuestions[currentQuestionIndex];
    const lovePageElement = document.getElementById('lovePage');
    
    if (!lovePageElement) return;
    
    // تحديث خلفية الصورة
    updateBackgroundImage(question.background);
    
    // مسح المحادثة السابقة
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (conversation) conversation.innerHTML = '';
    if (responseButtons) responseButtons.innerHTML = '';
    
    // عرض السؤال حسب النوع
    switch (question.type) {
        case 'question':
            showRegularQuestion(question);
            break;
        case 'heart':
            showHeartQuestion(question);
            break;
        case 'poem':
            showPoemPage();
            break;
        case 'gift':
            showGiftPage();
            break;
        case 'final':
            showFinalPage();
            break;
    }
}

// تحديث صورة الخلفية
function updateBackgroundImage(imageUrl) {
    const dynamicImage = document.getElementById('dynamicImage');
    if (dynamicImage && imageUrl) {
        dynamicImage.src = imageUrl;
        dynamicImage.style.width = '100%';
        dynamicImage.style.maxHeight = '400px';
        dynamicImage.style.objectFit = 'cover';
        dynamicImage.style.borderRadius = '15px';
        dynamicImage.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        dynamicImage.style.marginBottom = '20px';
    }
}

// عرض سؤال عادي
function showRegularQuestion(question) {
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (!conversation || !responseButtons) return;
    
    // عرض نص السؤال
    const questionText = typeof question.question === 'function' 
        ? question.question(currentLovePage.loverName, currentLovePage.yourName)
        : question.question;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-text">
            <span class="typing-animation">${questionText}</span>
        </div>
    `;
    conversation.appendChild(messageDiv);
    
    // إضافة زر الرد الواحد
    const btn = document.createElement('button');
    btn.className = 'response-btn single-response';
    btn.textContent = question.response;
    btn.onclick = () => {
        // تأثير القلوب الكبيرة
        createBigHeartsEffect(btn);
        
        // إخفاء الزر فوراً
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0)';
        btn.style.pointerEvents = 'none';
        
        // الانتقال للسؤال التالي بعد فترة
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestionPage();
        }, 1500);
    };
    responseButtons.appendChild(btn);
}

// عرض سؤال القلب
function showHeartQuestion(question) {
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (!conversation || !responseButtons) return;
    
    // عرض نص السؤال
    const questionText = typeof question.question === 'function' 
        ? question.question()
        : question.question;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-text">
            <span class="typing-animation">${questionText}</span>
        </div>
    `;
    conversation.appendChild(messageDiv);
    
    // إضافة القلب للضغط
    const heartDiv = document.createElement('div');
    heartDiv.className = 'heart-click-container';
    heartDiv.innerHTML = `
        <div class="heart-pulse" id="heartPulse"></div>
        <img src="https://cdn-icons-png.flaticon.com/512/2107/2107845.png" alt="قلب" 
             class="heart-button" id="heartButton">
        <p id="heartCounter">اضغطي 3 مرات</p>
    `;
    responseButtons.appendChild(heartDiv);
    
    // إضافة حدث الضغط على القلب
    document.getElementById('heartButton').onclick = () => {
        if (heartAnimating) return;
        heartAnimating = true;
        heartClickCount++;
        
        // تأثير القلب المتقزح والمفتوح
        const heartImg = document.getElementById('heartButton');
        const heartPulse = document.getElementById('heartPulse');
        
        // تأثير الرج
        heartImg.classList.add('heart-shake');
        heartPulse.classList.add('heart-pulse-active');
        
        // تأثير القلوب الكبيرة
        createBigHeartsEffect(heartDiv);
        
        // تحديث العداد
        const counter = document.getElementById('heartCounter');
        counter.textContent = `اضغطي ${3 - heartClickCount} مرات`;
        
        // إعادة تعيين الأنيميشن
        setTimeout(() => {
            heartImg.classList.remove('heart-shake');
            heartPulse.classList.remove('heart-pulse-active');
            heartAnimating = false;
        }, 500);
        
        // إذا تم الضغط 3 مرات
        if (heartClickCount >= 3) {
            setTimeout(() => {
                currentQuestionIndex++;
                showQuestionPage();
            }, 800);
        }
    };
}

// عرض صفحة القصيدة
function showPoemPage() {
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (!conversation || !responseButtons) return;
    
    // عرض الرسالة الأولى
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-text">
            <span class="typing-animation">شوفى شعر كتبتهولك...</span>
        </div>
    `;
    conversation.appendChild(messageDiv);
    
    // بعد 2 ثانية تظهر القصيدة
    setTimeout(() => {
        conversation.innerHTML = '';
        
        // عرض القصيدة بأنيميشن الكتابة
        const poemDiv = document.createElement('div');
        poemDiv.className = 'message poem-message';
        poemDiv.innerHTML = `
            <div class="message-text poem-text">
                <h3>قصيدة خاصة لكِ ❤️</h3>
                <div class="poem-content" id="poemContent"></div>
            </div>
        `;
        conversation.appendChild(poemDiv);
        
        // كتابة القصيدة حرف بحرف
        const poemContent = currentLovePage.poemContent || 'قصيدة حب رائعة مكتوبة من القلب... 💖\n\nأحبكِ أكثر مما تتخيلين\nوأشوق إليكِ أكثر مما تعرفين\nأنتِ نعمة حياتي\nوشمس أيامي\nوبسمة شفاهي\nوحلم ليالي\nيا أجمل ما في الوجود\n\nمع كل حبي ❤️';
        const poemElement = document.getElementById('poemContent');
        
        typeWriter(poemElement, poemContent, () => {
            // بعد انتهاء الكتابة، إضافة زر للمتابعة
            setTimeout(() => {
                responseButtons.innerHTML = '';
                const nextBtn = document.createElement('button');
                nextBtn.className = 'response-btn single-response';
                nextBtn.textContent = 'المتابعة →';
                nextBtn.onclick = () => {
                    createBigHeartsEffect(nextBtn);
                    setTimeout(() => {
                        currentQuestionIndex++;
                        showQuestionPage();
                    }, 1500);
                };
                responseButtons.appendChild(nextBtn);
            }, 1000);
        });
    }, 2000);
}

// عرض صفحة الهدية
function showGiftPage() {
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (!conversation || !responseButtons) return;
    
    // عرض الرسالة الأولى
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-text">
            <span class="typing-animation"> ده هدية ليكي برضو...</span>
        </div>
    `;
    conversation.appendChild(messageDiv);
    
    // بعد 2 ثانية تظهر الهدية
    setTimeout(() => {
        conversation.innerHTML = '';
        
        // إيقاف موسيقى الخلفية
        stopBackgroundMusic();
        
        // عرض الهدية حسب النوع
        if (currentLovePage.giftType === 'song') {
            showVideoPlayer(conversation);
        } else {
            showOtherGift(conversation);
        }
        
        // إضافة زر للمتابعة
        setTimeout(() => {
            responseButtons.innerHTML = '';
            const nextBtn = document.createElement('button');
            nextBtn.className = 'response-btn single-response';
            nextBtn.textContent = 'المتابعة →';
            nextBtn.onclick = () => {
                createBigHeartsEffect(nextBtn);
                
                // إيقاف مشغل الموسيقى إذا كان يعمل
                if (userMusicPlayer) {
                    userMusicPlayer.pause();
                    userMusicPlayer = null;
                }
                
                setTimeout(() => {
                    currentQuestionIndex++;
                    showQuestionPage();
                }, 1500);
            };
            responseButtons.appendChild(nextBtn);
        }, 3000);
    }, 2000);
}

// عرض مشغل الفيديو (يوتيوب embed)
function showVideoPlayer(conversation) {
    // استخراج ID الفيديو من رابط يوتيوب
    const videoUrl = currentLovePage.giftData || '';
    const videoId = extractYouTubeId(videoUrl);
    const videoTitle = extractYouTubeTitle(videoUrl);
    
    if (videoId) {
        // إنشاء مشغل فيديو YouTube Embed
        const playerDiv = document.createElement('div');
        playerDiv.className = 'video-player-card';
        
        playerDiv.innerHTML = `
            <div class="player-header">
                <i class="fas fa-play-circle"></i>
                <h3>🎵 ${videoTitle || 'أغنيتك المفضلة'} 🎵</h3>
            </div>
            <div class="video-container">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <p><i class="fas fa-music"></i> أغنية خاصة من ${currentLovePage.yourName}</p>
                ${currentLovePage.giftMessage ? 
                    `<div class="gift-message"><i class="fas fa-heart"></i> "${currentLovePage.giftMessage}"</div>` : ''}
            </div>
        `;
        
        conversation.appendChild(playerDiv);
    } else {
        // إذا لم يكن هناك رابط صالح
        const playerDiv = document.createElement('div');
        playerDiv.className = 'message-text gift-display';
        playerDiv.innerHTML = `
            <i class="fas fa-music"></i>
            <h3>🎵 موسيقى حب 🎵</h3>
            <p>أغنية حب خاصة من ${currentLovePage.yourName}</p>
            ${currentLovePage.giftMessage ? 
                `<p class="gift-message">"${currentLovePage.giftMessage}"</p>` : ''}
        `;
        conversation.appendChild(playerDiv);
    }
}

// استخراج ID الفيديو من رابط يوتيوب
function extractYouTubeId(url) {
    if (!url) return '';
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
}

// استخراج عنوان الفيديو من الرابط
function extractYouTubeTitle(url) {
    // يمكن تحسين هذا الدالة باستخدام YouTube API إذا أردت
    return 'أغنية حب خاصة';
}

// عرض هدية أخرى
function showOtherGift(conversation) {
    const giftType = currentLovePage.giftData || 'rose';
    const giftName = giftNames[giftType] || 'هدية';
    const giftImage = giftImages[giftType] || 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=500&auto=format&fit=crop&q=60';
    
    const giftDiv = document.createElement('div');
    giftDiv.className = 'gift-display-card';
    giftDiv.innerHTML = `
        <div class="gift-image">
            <img src="${giftImage}" alt="${giftName}">
            <div class="gift-overlay">
                <i class="fas fa-gift"></i>
            </div>
        </div>
        <div class="gift-info">
            <h3>🎁 ${giftName} 🎁</h3>
            <p>هدية خاصة من ${currentLovePage.yourName}</p>
            ${currentLovePage.giftMessage ? 
                `<div class="gift-message">"${currentLovePage.giftMessage}"</div>` : ''}
        </div>
    `;
    
    conversation.appendChild(giftDiv);
    
    // تأثير ظهور الهدية
    setTimeout(() => {
        giftDiv.classList.add('gift-visible');
    }, 100);
}

// عرض الصفحة النهائية
function showFinalPage() {
    const conversation = document.querySelector('.conversation');
    const responseButtons = document.querySelector('.response-buttons');
    
    if (!conversation || !responseButtons) return;
    
    // مسح المحتوى
    conversation.innerHTML = '';
    responseButtons.innerHTML = '';
    
    // عرض الرسالة النهائية
    const finalMessage = conversationQuestions.find(q => q.id === 10);
    if (finalMessage) {
        updateBackgroundImage(finalMessage.background);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-text final-message">
                <h3>❤️ شكراً لكِ ❤️</h3>
                <p>اتمني انها تكون عجبتك ${currentLovePage.loverName}</p>
                <p>مع كل حبي</p>
                <p class="sender-name">${currentLovePage.yourName}</p>
                <div class="final-hearts">
                    <i class="fas fa-heart"></i>
                    <i class="fas fa-heart"></i>
                    <i class="fas fa-heart"></i>
                </div>
            </div>
        `;
        conversation.appendChild(messageDiv);
    }
    
    // إعادة تشغيل موسيقى الخلفية
    setTimeout(() => {
        if (backgroundMusic && !backgroundMusicPlaying) {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play();
            backgroundMusicPlaying = true;
        }
    }, 1000);
    
    // إضافة زر إعادة التشغيل
    setTimeout(() => {
        const restartBtn = document.createElement('button');
        restartBtn.className = 'response-btn single-response';
        restartBtn.textContent = 'إعادة المحادثة ♻️';
        restartBtn.onclick = () => {
            createBigHeartsEffect(restartBtn);
            
            // إعادة تشغيل موسيقى الخلفية
            if (backgroundMusic) {
                backgroundMusic.currentTime = 0;
                backgroundMusic.play();
                backgroundMusicPlaying = true;
            }
            
            setTimeout(() => {
                currentQuestionIndex = 0;
                heartClickCount = 0;
                showQuestionPage();
            }, 1500);
        };
        responseButtons.appendChild(restartBtn);
    }, 2000);
}

// ==================== دوال التأثيرات ====================

// تأثير الكتابة الآلية
function typeWriter(element, text, callback) {
    let i = 0;
    const speed = 30; // سرعة الكتابة
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    
    element.innerHTML = '';
    type();
}

// إنشاء تأثير القلوب الكبيرة
function createBigHeartsEffect(element) {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer || !element) return;
    
    try {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // إنشاء 8 قلوب كبيرة
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.className = 'big-heart-effect';
            heart.innerHTML = '<i class="fas fa-heart"></i>';
            heart.style.left = `${centerX}px`;
            heart.style.top = `${centerY}px`;
            
            // ألوان عشوائية للقلوب
            const colors = ['#ff4d8d', '#ff6b9d', '#ff8e53', '#ffb6c1', '#ff69b4'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            heart.style.color = randomColor;
            
            // حجم كبير
            const size = 40 + Math.random() * 30;
            heart.style.fontSize = `${size}px`;
            
            // اتجاهات انتشار
            const angle = (i / 8) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 50;
            
            heart.style.setProperty('--tx', `${tx}px`);
            heart.style.setProperty('--ty', `${ty}px`);
            
            heartsContainer.appendChild(heart);
            
            // إزالة القلب بعد الانتهاء من الحركة
            setTimeout(() => {
                if (heart.parentNode === heartsContainer) {
                    heartsContainer.removeChild(heart);
                }
            }, 1200);
        }
    } catch (error) {
        console.error("Error creating hearts effect:", error);
    }
}

// ==================== دوال إنشاء الصفحة ====================

// إعادة تعيين بيانات الإنشاء
function resetCreationData() {
    creationData = {
        yourName: currentUser?.displayName || '',
        loverName: '',
        poemType: '',
        poemContent: '',
        giftType: '',
        giftData: '',
        giftMessage: '',
        pageId: generatePageId(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // تعيين اسم المستخدم إذا كان موجوداً
    if (currentUser?.displayName) {
        const yourNameInput = document.getElementById('yourName');
        if (yourNameInput) {
            yourNameInput.value = currentUser.displayName;
            creationData.yourName = currentUser.displayName;
        }
    }
}

// توليد معرّف فريد للصفحة
function generatePageId() {
    return 'love_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

// تحديث شريط التقدم
function updateProgressBar(step) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((stepEl, index) => {
        if (index < step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

// الانتقال للخطوة التالية
function nextStep(step) {
    // التحقق من البيانات قبل الانتقال
    if (step === 2) {
        if (!creationData.yourName || !creationData.loverName) {
            Swal.fire('تنبيه', 'الرجاء إدخال اسمك واسم حبيبتك', 'warning');
            return;
        }
    }
    
    // إخفاء جميع الخطوات
    document.querySelectorAll('.creation-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // إظهار الخطوة المطلوبة
    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // تحديث شريط التقدم
    updateProgressBar(step);
}

// العودة للخطوة السابقة
function prevStep(step) {
    nextStep(step);
}

// اختيار نوع القصيدة
function selectPoemOption(type) {
    creationData.poemType = type;
    
    // إخفاء جميع الأقسام
    const sections = ['customPoemSection', 'readyPoemSection', 'aiPoemSection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('hidden');
    });
    
    // إظهار القسم المختار
    const targetSection = document.getElementById(`${type}PoemSection`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

// اختيار قصيدة جاهزة
function selectReadyPoem(element) {
    if (!element) return;
    
    // إزالة التحديد من جميع القصائد
    document.querySelectorAll('.poem-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // تحديد القصيدة المختارة
    element.classList.add('selected');
    const poemText = element.querySelector('p');
    if (poemText) {
        creationData.poemContent = poemText.textContent;
    }
}

// حفظ قصيدة جاهزة
function saveReadyPoem() {
    if (!creationData.poemContent) {
        Swal.fire('تنبيه', 'الرجاء اختيار قصيدة', 'warning');
        return;
    }
    nextStep(3);
}

// حفظ قصيدة مكتوبة
function saveCustomPoem() {
    const customPoemInput = document.getElementById('customPoem');
    if (!customPoemInput) {
        Swal.fire('تنبيه', 'حدث خطأ في النظام', 'error');
        return;
    }
    
    const poem = customPoemInput.value.trim();
    if (!poem) {
        Swal.fire('تنبيه', 'الرجاء كتابة قصيدة', 'warning');
        return;
    }
    creationData.poemContent = poem;
    nextStep(3);
}

// توليد قصيدة بالذكاء الاصطناعي
async function generateAIPoem() {
    const aiTopicInput = document.getElementById('aiTopic');
    const aiLengthSelect = document.getElementById('aiLength');
    
    if (!aiTopicInput || !aiLengthSelect) {
        Swal.fire('تنبيه', 'حدث خطأ في النظام', 'error');
        return;
    }
    
    const topic = aiTopicInput.value.trim();
    const length = aiLengthSelect.value;
    
    if (!topic) {
        Swal.fire('تنبيه', 'الرجاء كتابة موضوع للقصيدة', 'warning');
        return;
    }
    
    // عرض زر التحميل
    const generateBtn = document.getElementById('generatePoemBtn');
    if (!generateBtn) return;
    
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإنشاء...';
    generateBtn.disabled = true;
    
    try {
        // استخدام OpenRouter API مع نموذج حديث
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`,
                'HTTP-Referer': window.location.origin || 'http://localhost',
                'X-Title': 'موقع حب خاص'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4', // استخدام GPT-4 للحصول على نتائج أفضل
                messages: [
                    {
                        role: 'system',
                        content: 'أنت شاعر عربي رومانسي متميز. اكتب قصائد حب عربية رومانسية فريدة ومبتكرة وجميلة. لا تكرر نفسك واستخدم لغة عربية فصحى راقية أو عامية رقيقة. ابتعد عن النمطية واكتب قصيدة تناسب الشخصية المستهدفة.'
                    },
                    {
                        role: 'user',
                        content: `اكتب قصيدة حب عربية رومانسية فريدة عن: "${topic}"
                        
                        المتطلبات:
                        1. اللغة: العربية الفصحى الجميلة
                        2. النوع: قصيدة حب رومانسية فريدة وليست مكررة
                        3. الطول: 10-12 سطر على الأقل
                        4. النبرة: رومانسية، حميمية، عاطفية، شعرية، مبتكرة
                        5. المحتوى: يعبر عن مشاعر الحب والاشتياق والغرام والهيام بطريقة مبتكرة
                        6. التنسيق: كل سطر في سطر جديد
                        7. الجودة: قصيدة راقية فريدة تستحق أن تقدم لحبيبة
                        8. الابتكار: لا تكرر القصائد التقليدية، ابتكر شيئاً جديداً
                        
                        أرجو كتابة القصيدة بشكل مباشر بدون أي تعليقات إضافية.`
                    }
                ],
                max_tokens: 800,
                temperature: 0.85
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            let poem = data.choices[0].message.content;
            
            // تنظيف النص
            poem = poem.replace(/```[\s\S]*?```/g, '');
            poem = poem.replace(/["']/g, '');
            poem = poem.trim();
            
            // تقسيم القصيدة إلى أسطر
            const lines = poem.split('\n').filter(line => line.trim().length > 0);
            
            // إذا كانت القصيدة قصيرة جداً، أطلب قصيدة جديدة
            if (lines.length < 8) {
                // طلب قصيدة أطول
                const response2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AI_API_KEY}`,
                        'HTTP-Referer': window.location.origin || 'http://localhost',
                        'X-Title': 'موقع حب خاص'
                    },
                    body: JSON.stringify({
                        model: 'openai/gpt-4',
                        messages: [
                            {
                                role: 'system',
                                content: 'أنت شاعر عربي رومانسي متميز. اكتب قصائد حب عربية رومانسية فريدة ومبتكرة وجميلة.'
                            },
                            {
                                role: 'user',
                                content: `اكتب قصيدة حب عربية رومانسية طويلة (12-15 سطر) عن: "${topic}"
                                يجب أن تكون القصيدة طويلة وفريدة ومبتكرة وليست مكررة.`
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.9
                    })
                });
                
                const data2 = await response2.json();
                if (data2.choices && data2.choices[0] && data2.choices[0].message) {
                    poem = data2.choices[0].message.content;
                    poem = poem.replace(/```[\s\S]*?```/g, '');
                    poem = poem.replace(/["']/g, '');
                    poem = poem.trim();
                }
            }
            
            const generatedPoemElement = document.getElementById('generatedPoem');
            const aiResultElement = document.getElementById('aiResult');
            
            if (generatedPoemElement) {
                generatedPoemElement.textContent = poem;
            }
            
            creationData.poemContent = poem;
            
            if (aiResultElement) {
                aiResultElement.classList.remove('hidden');
            }
            
            await Swal.fire('نجاح', 'تم إنشاء قصيدة فريدة وطويلة!', 'success');
        } else {
            throw new Error('لم يتم إنشاء قصيدة');
        }
    } catch (error) {
        console.error('Error generating poem:', error);
        
        // محاولة أخرى مع نموذج مختلف
        try {
            const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_API_KEY}`,
                    'HTTP-Referer': window.location.origin || 'http://localhost',
                    'X-Title': 'موقع حب خاص'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3-haiku',
                    messages: [
                        {
                            role: 'system',
                            content: 'أنت شاعر عربي رومانسي متميز. اكتب قصيدة حب عربية رومانسية فريدة.'
                        },
                        {
                            role: 'user',
                            content: `اكتب قصيدة حب عربية رومانسية فريدة عن: "${topic}" مكونة من 12 سطر على الأقل.`
                        }
                    ],
                    max_tokens: 600,
                    temperature: 0.8
                })
            });
            
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.choices && fallbackData.choices[0] && fallbackData.choices[0].message) {
                let poem = fallbackData.choices[0].message.content;
                poem = poem.replace(/```[\s\S]*?```/g, '');
                poem = poem.replace(/["']/g, '');
                poem = poem.trim();
                
                const generatedPoemElement = document.getElementById('generatedPoem');
                const aiResultElement = document.getElementById('aiResult');
                
                if (generatedPoemElement) {
                    generatedPoemElement.textContent = poem;
                }
                
                creationData.poemContent = poem;
                
                if (aiResultElement) {
                    aiResultElement.classList.remove('hidden');
                }
                
                await Swal.fire('نجاح', 'تم إنشاء قصيدة رائعة!', 'success');
            } else {
                throw new Error('فشل المحاولة الثانية');
            }
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            
            // قصيدة فريدة ومبتكرة كبديل
            const uniquePoems = [
                `في عينيكِ وجدتُ دنيا لم أعرفها قبلاً
وفي صوتكِ سمعتُ أغاني الحب والغرام
أنتِ النور الذي يضيء دروب العمر
وأنتِ الربيع في كل فصول الأيام

قلبي يخفق باسمكِ في صمت الليل
وعيناي تبحثان عنكِ في ضوء القمر
لا شيء في الوجود يعادل فرحة لقياكِ
ولا أحد يملأ فراغ قلبي سواكِ

أنتِ الحلم الذي طالما انتظرته
وأنتِ الواقع الذي فاق كل أحلامي
في كل نبضة من قلبي اسمكِ يرن
وفي كل نفس من أنفاسي حبكِ يسكن

لأجلكِ أعيش وكل أيامي زهر
ولحبكِ أتنفس في كل أوقاتي عطر
أنتِ حبيبتي ونور عيني
وأنتِ كل ما أتمناه في دنياي`,

                `عندما أغمض عيناي أراكِ
وعندما أفكر أراكِ
عندما أتحدث مع نفسي أناديكِ
في كل لحظة من حياتكِ

قلبي يهتف باسمكِ في صمت الليل
وروحي تسافر إليكِ في حلم اليقظة
أنتِ السعادة التي بحثت عنها طويلاً
وأنتِ الحب الذي ملأ قلبي دفئاً

في عينيكِ وجدتُ بحراً من المشاعر
وفي صوتكِ سمعتُ سيمفونية الأحلام
أنتِ القصيدة التي لم تكتب بعد
وأنتِ اللحن الذي لم يعزف بعد

لأجلكِ أحيى كل يوم بابتسامة
ولحبكِ أموت كل ليلة بشوق
أنتِ كل شيء في حياتي
وإليكِ ينتمي قلبي بأكمله`,

                `يا من سكنتِ قلبي دون إذن
ويا من سرقتِ عقلي بلا رحمة
في عينيكِ بحرٌ من الأسرار
وفي قلبكِ جنةٌ من الأماني

لا أعرف كيف أصف حبي لكِ
فالكلمات تعجز عن وصف المشاعر
أنتِ أكثر من حلمٍ راودني
وأنتِ أجمل من خيالٍ راقني

قلبي يرفرف شوقاً إليكِ
وروحي تتوق للقائكِ
في كل لحظة أشعر بحبكِ
وفي كل لحظة أشتاق لرؤيتكِ

أنتِ النعمة التي أنعم الله بها علي
وأنتِ السعادة التي طالما بحثت عنها
معكِ عرفت معنى الحياة
ومعكِ عرفت طعم السعادة`
            ];
            
            const randomPoem = uniquePoems[Math.floor(Math.random() * uniquePoems.length)];
            const generatedPoemElement = document.getElementById('generatedPoem');
            const aiResultElement = document.getElementById('aiResult');
            
            if (generatedPoemElement) {
                generatedPoemElement.textContent = randomPoem;
            }
            
            creationData.poemContent = randomPoem;
            
            if (aiResultElement) {
                aiResultElement.classList.remove('hidden');
            }
            
            await Swal.fire('ملاحظة', 'تم استخدام قصيدة بديلة فريدة', 'info');
        }
    } finally {
        // إعادة زر التوليد لحالته الأصلية
        if (generateBtn) {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }
}

// إعادة توليد القصيدة
function regeneratePoem() {
    generateAIPoem();
}

// حفظ قصيدة الذكاء الاصطناعي
function saveAIPoem() {
    if (!creationData.poemContent) {
        Swal.fire('تنبيه', 'الرجاء إنشاء قصيدة أولاً', 'warning');
        return;
    }
    nextStep(3);
}

// اختيار نوع الهدية
function selectGiftOption(type) {
    creationData.giftType = type;
    
    // إخفاء جميع الأقسام
    const songSection = document.getElementById('songSection');
    const otherGiftSection = document.getElementById('otherGiftSection');
    
    if (songSection) songSection.classList.add('hidden');
    if (otherGiftSection) otherGiftSection.classList.add('hidden');
    
    // إظهار القسم المختار
    if (type === 'song') {
        if (songSection) songSection.classList.remove('hidden');
    } else if (type === 'other') {
        if (otherGiftSection) otherGiftSection.classList.remove('hidden');
    }
}

// اختيار نوع الهدية الأخرى
function selectGiftType(type) {
    if (!type) return;
    
    creationData.giftData = type;
    
    // إزالة التحديد من جميع الأنواع
    document.querySelectorAll('.gift-type').forEach(gift => {
        gift.classList.remove('selected');
    });
    
    // تحديد النوع المختار
    const clickedElement = event?.currentTarget;
    if (clickedElement) {
        clickedElement.classList.add('selected');
    }
}

// حفظ الأغنية
function saveSong() {
    const songUrlInput = document.getElementById('songUrl');
    if (!songUrlInput) {
        Swal.fire('تنبيه', 'حدث خطأ في النظام', 'error');
        return;
    }
    
    const url = songUrlInput.value.trim();
    if (!url) {
        Swal.fire('تنبيه', 'الرجاء إدخال رابط الأغنية', 'warning');
        return;
    }
    
    // التحقق من صحة الرابط
    if (!isValidUrl(url)) {
        Swal.fire('تنبيه', 'الرجاء إدخال رابط صحيح (يبدأ بـ http:// أو https://)', 'warning');
        return;
    }
    
    creationData.giftData = url;
    saveCreation();
}

// التحقق من صحة الرابط
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// حفظ الهدية
function saveGift() {
    if (!creationData.giftData) {
        Swal.fire('تنبيه', 'الرجاء اختيار نوع الهدية', 'warning');
        return;
    }
    
    const giftMessageInput = document.getElementById('giftMessage');
    if (giftMessageInput) {
        creationData.giftMessage = giftMessageInput.value.trim();
    }
    
    saveCreation();
}

// حفظ الإنشاء كاملاً
async function saveCreation() {
    try {
        // التحقق من بيانات المستخدم
        if (!currentUser || !currentUser.uid) {
            Swal.fire('خطأ', 'الرجاء تسجيل الدخول أولاً', 'error');
            showPage('welcomePage');
            return;
        }
        
        // التحقق من البيانات المطلوبة
        if (!creationData.yourName || !creationData.loverName) {
            Swal.fire('خطأ', 'الرجاء إدخال اسمك واسم حبيبتك', 'error');
            nextStep(1);
            return;
        }
        
        if (!creationData.poemContent) {
            Swal.fire('خطأ', 'الرجاء إدخال القصيدة', 'error');
            nextStep(2);
            return;
        }
        
        if (!creationData.giftType) {
            Swal.fire('خطأ', 'الرجاء اختيار نوع الهدية', 'error');
            nextStep(3);
            return;
        }
        
        // التحقق من بيانات الهدية
        if (creationData.giftType === 'song' && !creationData.giftData) {
            Swal.fire('خطأ', 'الرجاء إدخال رابط الأغنية', 'error');
            return;
        }
        
        if (creationData.giftType === 'other' && !creationData.giftData) {
            Swal.fire('خطأ', 'الرجاء اختيار نوع الهدية', 'error');
            return;
        }
        
        // إضافة بيانات المستخدم
        creationData.userId = currentUser.uid;
        creationData.userEmail = currentUser.email || '';
        creationData.userName = currentUser.displayName || creationData.yourName;
        creationData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        console.log("Saving creation data:", creationData);
        
        // حفظ في قاعدة البيانات
        await db.collection('lovePages').doc(creationData.pageId).set(creationData);
        
        // الانتقال للخطوة النهائية
        nextStep(4);
        
        // عرض رابط الصفحة
        const loveLink = `${window.location.origin}${window.location.pathname}?page=${creationData.pageId}`;
        const loveLinkInput = document.getElementById('loveLink');
        const finalLoverName = document.getElementById('finalLoverName');
        
        if (loveLinkInput) {
            loveLinkInput.value = loveLink;
        }
        
        if (finalLoverName) {
            finalLoverName.textContent = creationData.loverName;
        }
        
        await Swal.fire('نجاح', 'تم إنشاء صفحة الحب بنجاح!', 'success');
        
    } catch (error) {
        console.error('Error saving creation:', error);
        
        let errorMessage = 'حدث خطأ في حفظ الصفحة';
        
        if (error.code === 'permission-denied') {
            errorMessage = 'ليس لديك صلاحية لحفظ الصفحة. تأكد من تسجيل الدخول.';
        } else if (error.code === 'unavailable') {
            errorMessage = 'لا يمكن الاتصال بخادم قاعدة البيانات. تحقق من اتصالك بالإنترنت.';
        }
        
        await Swal.fire('خطأ', errorMessage, 'error');
    }
}

// ==================== دوال المشاركة ====================

// نسخ الرابط
function copyLink() {
    const linkInput = document.getElementById('loveLink');
    if (!linkInput) return;
    
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            Swal.fire({
                icon: 'success',
                title: 'تم النسخ!',
                text: 'تم نسخ الرابط إلى الحافظة',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire('خطأ', 'تعذر نسخ الرابط', 'error');
        }
    } catch (err) {
        // استخدام Clipboard API إذا كان متاحاً
        if (navigator.clipboard) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'تم النسخ!',
                    text: 'تم نسخ الرابط إلى الحافظة',
                    timer: 2000,
                    showConfirmButton: false
                });
            });
        } else {
            Swal.fire('خطأ', 'تعذر نسخ الرابط', 'error');
        }
    }
}

// مشاركة عبر واتساب
function shareWhatsApp() {
    const linkInput = document.getElementById('loveLink');
    if (!linkInput) return;
    
    const link = linkInput.value;
    const text = `💖 رسالة حب خاصة لك 💖\n\n${creationData.yourName} أرسل لكِ رسالة حب\n${link}\n\nاضغطي على الرابط لرؤية الرسالة ❤️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// مشاركة عبر تليجرام
function shareTelegram() {
    const linkInput = document.getElementById('loveLink');
    if (!linkInput) return;
    
    const link = linkInput.value;
    const text = `💖 رسالة حب خاصة لك 💖\n\n${creationData.yourName} أرسل لكِ رسالة حب\n${link}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
}

// مشاركة عبر الرسائل
function shareSMS() {
    const linkInput = document.getElementById('loveLink');
    if (!linkInput) return;
    
    const link = linkInput.value;
    const text = `💖 رسالة حب خاصة لك 💖\n${creationData.yourName} أرسل لكِ رسالة حب: ${link}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
}

// معاينة الصفحة
function viewPage() {
    const linkInput = document.getElementById('loveLink');
    if (!linkInput || !linkInput.value) {
        Swal.fire('خطأ', 'لا يوجد رابط للمعاينة', 'error');
        return;
    }
    window.open(linkInput.value, '_blank');
}

// إنشاء صفحة جديدة
function createNew() {
    resetCreationData();
    nextStep(1);
    Swal.fire('تم', 'تم إعداد صفحة جديدة', 'info');
}

// ==================== دوال المصادقة ====================

// تسجيل الدخول
async function loginUser() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (!loginEmail || !loginPassword) return;
    
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        Swal.fire('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        await Swal.fire('نجاح', 'تم تسجيل الدخول بنجاح!', 'success');
    } catch (error) {
        console.error("Login error:", error);
        
        let errorMessage = 'حدث خطأ في تسجيل الدخول';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني غير مسجل';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/user-disabled':
                errorMessage = 'هذا الحساب معطل';
                break;
        }
        
        await Swal.fire('خطأ', errorMessage, 'error');
    }
}

// إنشاء حساب
async function signupUser() {
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    
    if (!signupName || !signupEmail || !signupPassword) return;
    
    const name = signupName.value.trim();
    const email = signupEmail.value;
    const password = signupPassword.value;
    
    if (!name || !email || !password) {
        Swal.fire('خطأ', 'الرجاء تعبئة جميع الحقول', 'error');
        return;
    }
    
    if (password.length < 6) {
        Swal.fire('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // حفظ معلومات إضافية في Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        await Swal.fire('نجاح', 'تم إنشاء الحساب بنجاح!', 'success');
    } catch (error) {
        console.error("Signup error:", error);
        
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'عملية التسجيل غير مسموحة';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة جداً';
                break;
        }
        
        await Swal.fire('خطأ', errorMessage, 'error');
    }
}

// تحميل بيانات المستخدم
async function loadUserData() {
    try {
        if (!currentUser || !currentUser.uid) {
            showPage('welcomePage');
            return;
        }
        
        // تحميل آخر صفحة قام بإنشائها
        const snapshot = await db.collection('lovePages')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            creationData = { ...doc.data(), pageId: doc.id };
            
            console.log("Loaded user data:", creationData);
            
            // تعبئة البيانات في النموذج
            const yourNameInput = document.getElementById('yourName');
            const loverNameInput = document.getElementById('loverName');
            
            if (yourNameInput) {
                yourNameInput.value = creationData.yourName || currentUser.displayName || '';
            }
            
            if (loverNameInput) {
                loverNameInput.value = creationData.loverName || '';
            }
            
            // تحديث الرابط في الخطوة 4
            const loveLinkInput = document.getElementById('loveLink');
            const finalLoverName = document.getElementById('finalLoverName');
            
            if (loveLinkInput) {
                const loveLink = `${window.location.origin}${window.location.pathname}?page=${creationData.pageId}`;
                loveLinkInput.value = loveLink;
            }
            
            if (finalLoverName) {
                finalLoverName.textContent = creationData.loverName || '';
            }
        } else {
            // لا توجد صفحات سابقة، إعادة تعيين البيانات
            resetCreationData();
        }
        
        showPage('createPage');
    } catch (error) {
        console.error('Error loading user data:', error);
        
        // في حالة خطأ الأذونات، إعادة تعيين البيانات
        if (error.code === 'permission-denied') {
            console.log("Permission denied, resetting data");
            resetCreationData();
        }
        
        showPage('createPage');
    }
}

// تسجيل الخروج
async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        resetCreationData();
        showPage('welcomePage');
        await Swal.fire('تم', 'تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        console.error("Logout error:", error);
        await Swal.fire('خطأ', error.message, 'error');
    }
}

// ==================== دوال مساعدة ====================

// تبديل عرض كلمة المرور
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = input.nextElementSibling?.querySelector('i');
    if (!icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// تهيئة قاعدة بيانات Firebase يدوياً
async function initFirestore() {
    try {
        // هذا سيساعد في تشخيص مشاكل الاتصال
        const testDoc = await db.collection('test').doc('test').get();
        console.log("Firestore connection test:", testDoc.exists ? "Success" : "No test document");
    } catch (error) {
        console.error("Firestore connection error:", error);
    }
}

// تشغيل تهيئة Firestore عند التحميل
setTimeout(initFirestore, 1000);

// دالة لإنشاء صفحة حب بدون تسجيل دخول
async function createLovePageWithoutLogin() {
    try {
        // توليد ID تلقائي
        creationData.pageId = generatePageId();
        creationData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        // حفظ في قاعدة البيانات
        await db.collection('lovePages').doc(creationData.pageId).set(creationData);
        
        // عرض رابط الصفحة
        const loveLink = `${window.location.origin}${window.location.pathname}?page=${creationData.pageId}`;
        
        Swal.fire({
            title: 'تم الإنشاء بنجاح!',
            html: `
                <div style="text-align: center;">
                    <i class="fas fa-heart" style="font-size: 60px; color: #ff4d8d; margin-bottom: 20px;"></i>
                    <p>تم إنشاء صفحة الحب الخاصة بك بنجاح!</p>
                    <p><strong>${creationData.loverName}</strong></p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <input type="text" id="loveLinkInput" value="${loveLink}" readonly 
                               style="width: 100%; padding: 10px; border: none; background: transparent; text-align: center;">
                    </div>
                    <button onclick="copyLoveLink()" 
                            style="background: #ff4d8d; color: white; border: none; padding: 10px 20px; 
                                   border-radius: 25px; cursor: pointer; margin: 10px;">
                        <i class="fas fa-copy"></i> نسخ الرابط
                    </button>
                    <button onclick="window.open('${loveLink}', '_blank')" 
                            style="background: #4CAF50; color: white; border: none; padding: 10px 20px; 
                                   border-radius: 25px; cursor: pointer; margin: 10px;">
                        <i class="fas fa-eye"></i> معاينة الصفحة
                    </button>
                </div>
            `,
            showConfirmButton: false,
            width: 500
        });
        
    } catch (error) {
        console.error('Error creating love page:', error);
        Swal.fire('خطأ', 'حدث خطأ في إنشاء الصفحة', 'error');
    }
}

// دالة نسخ رابط الصفحة
function copyLoveLink() {
    const linkInput = document.getElementById('loveLinkInput');
    if (!linkInput) return;
    
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            Swal.fire({
                icon: 'success',
                title: 'تم النسخ!',
                text: 'تم نسخ الرابط إلى الحافظة',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (err) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'تم النسخ!',
                    text: 'تم نسخ الرابط إلى الحافظة',
                    timer: 2000,
                    showConfirmButton: false
                });
            });
        }
    }
}

// دالة لإنشاء صفحة جديدة بدون تسجيل دخول
function createQuickLovePage() {
    // عرض نموذج سريع
    Swal.fire({
        title: 'إنشاء صفحة حب سريعة',
        html: `
            <div style="text-align: right;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">اسمك</label>
                    <input type="text" id="quickYourName" placeholder="أدخل اسمك" 
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">اسم حبيبتك</label>
                    <input type="text" id="quickLoverName" placeholder="أدخل اسم حبيبتك" 
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">رسالة حب (اختياري)</label>
                    <textarea id="quickLoveMessage" rows="3" placeholder="اكتب رسالة حب..." 
                              style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;"></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'إنشاء الصفحة',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            const yourName = document.getElementById('quickYourName').value;
            const loverName = document.getElementById('quickLoverName').value;
            
            if (!yourName || !loverName) {
                Swal.showValidationMessage('الرجاء إدخال اسمك واسم حبيبتك');
                return false;
            }
            
            return { yourName, loverName };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // تعبئة البيانات
            creationData.yourName = result.value.yourName;
            creationData.loverName = result.value.loverName;
            creationData.poemContent = document.getElementById('quickLoveMessage').value || 
                                      'قصيدة حب رائعة مكتوبة من القلب... 💖';
            creationData.giftType = 'song';
            creationData.giftData = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // رابط مثال
            
            // إنشاء الصفحة
            createLovePageWithoutLogin();
        }
    });
}

// تحديث صفحة الترحيب لتعرض خيار إنشاء صفحة سريعة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر إنشاء صفحة سريعة
    const welcomeButtons = document.querySelector('.buttons-container');
    if (welcomeButtons) {
        const quickCreateBtn = document.createElement('button');
        quickCreateBtn.className = 'btn btn-primary';
        quickCreateBtn.innerHTML = '<i class="fas fa-bolt"></i> إنشاء صفحة حب سريعة';
        quickCreateBtn.onclick = createQuickLovePage;
        
        // إضافة الزر بعد الأزرار الموجودة
        const divider = document.createElement('div');
        divider.className = 'divider';
        divider.innerHTML = '<span>أو</span>';
        
        welcomeButtons.appendChild(divider);
        welcomeButtons.appendChild(quickCreateBtn);
    }
});