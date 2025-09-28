(function () {
	const SLIDES = [
		{
			image: 'assets/hero.jpg',
			thumb: 'assets/image1.jpg',
			kicker: 'Welcome To Harvest Farms',
			title: 'From Our Farms\nTo Your Hands'
		},
		{
			image: 'assets/image1.png',
			thumb: 'assets/image2.png',
			kicker: 'Pure • Fresh • Local',
			title: 'Grown With Care\n& With Love'
		},
		{
			image: 'assets/image2.png',
			thumb: 'assets/image3.png',
			kicker: 'Sustainably Harvested',
			title: 'Healthy Soil\nHealthy People'
		},
		{
			image: 'assets/image3.png',
			thumb: 'assets/image1.png',
			kicker: 'Seasonal Variety',
			title: 'Fields Of Flavor\nAll Year Round'
		}
	];

	const AUTOPLAY_MS = 4500;
	const FADE_MS = 800; // keep in sync with CSS

	const heroA = document.getElementById('heroA');
	const heroB = document.getElementById('heroB');
	const headline = document.getElementById('headline');
	const kicker = document.getElementById('kicker');
	const nextBtn = document.getElementById('nextThumb');
	const thumbImg = document.getElementById('thumbImg');
	const thumbMeter = document.getElementById('thumbMeter');
	const currentEl = document.getElementById('currentSlide');
	const progressBar = document.getElementById('progressBar');

	let activeIdx = 0;
	let timer = null;
	let meterPerimeter = 0;
	let isPaused = false;
	let remainingMs = AUTOPLAY_MS;

	function setupPerimeter() {
		meterPerimeter = 2 * (96 + 62);
		thumbMeter.style.setProperty('--perimeter', String(meterPerimeter));
	}

	function setHeroImage(el, url) { el.src = url; el.setAttribute('draggable', 'false'); }
	function setText(k, t) {
		kicker.textContent = k;
		headline.innerHTML = t.replace(/\n/g, '<br class="hidden sm:block"/>' );
	}
	function animateTextIn() {
		kicker.classList.remove('is-in');
		headline.classList.remove('is-in');
		requestAnimationFrame(() => { kicker.classList.add('is-in'); headline.classList.add('is-in'); });
	}

	function setSlide(idx, withFade = true) {
		activeIdx = (idx + SLIDES.length) % SLIDES.length;
		const aActive = heroA.classList.contains('is-active');
		const currentImg = aActive ? heroA : heroB;
		const nextImg = aActive ? heroB : heroA;
		setHeroImage(nextImg, SLIDES[activeIdx].image);
		if (withFade) { nextImg.classList.add('is-active'); currentImg.classList.remove('is-active'); }
		else { setHeroImage(currentImg, SLIDES[activeIdx].image); nextImg.classList.remove('is-active'); currentImg.classList.add('is-active'); }
		setText(SLIDES[activeIdx].kicker, SLIDES[activeIdx].title);
		animateTextIn();
		if (currentEl) currentEl.textContent = String(activeIdx + 1).padStart(2, '0');
		if (progressBar) progressBar.style.width = ((activeIdx + 1) / SLIDES.length) * 100 + '%';
		const nextIdx = (activeIdx + 1) % SLIDES.length;
		thumbImg.src = SLIDES[nextIdx].image;
		resetProgress();
	}

	function resetProgress() {
		// Hard reset the meter so it restarts every time
		thumbMeter.style.transition = 'none';
		thumbMeter.style.setProperty('--offset', String(meterPerimeter));
		// Force reflow so the browser applies the offset change immediately
		void thumbMeter.getBoundingClientRect();
		requestAnimationFrame(() => {
			thumbMeter.style.transition = 'stroke-dashoffset ' + AUTOPLAY_MS + 'ms linear';
			thumbMeter.style.setProperty('--offset', '0');
		});
		isPaused = false;
		remainingMs = AUTOPLAY_MS;
		clearTimeout(timer);
		timer = setTimeout(() => setSlide(activeIdx + 1), AUTOPLAY_MS);
	}

	function pauseProgress() {
		if (isPaused) return;
		// Read current dashoffset to compute remaining time
		const computed = getComputedStyle(thumbMeter).strokeDashoffset;
		const currentOffset = Math.max(0, Math.min(meterPerimeter, parseFloat(computed)));
		const progressRatio = 1 - (currentOffset / meterPerimeter);
		const elapsed = progressRatio * AUTOPLAY_MS;
		remainingMs = Math.max(0, AUTOPLAY_MS - elapsed);
		isPaused = true;
		clearTimeout(timer);
		thumbMeter.style.transition = 'none';
		thumbMeter.style.setProperty('--offset', String(currentOffset));
	}

	function resumeProgress() {
		if (!isPaused) return;
		isPaused = false;
		void thumbMeter.getBoundingClientRect();
		requestAnimationFrame(() => {
			thumbMeter.style.transition = 'stroke-dashoffset ' + remainingMs + 'ms linear';
			thumbMeter.style.setProperty('--offset', '0');
		});
		clearTimeout(timer);
		timer = setTimeout(() => setSlide(activeIdx + 1), remainingMs);
	}

	function initHero() {
		if (!heroA || !heroB || !nextBtn || !thumbImg || !thumbMeter) return;
		setupPerimeter();
		setHeroImage(heroA, SLIDES[0].image);
		setHeroImage(heroB, SLIDES[1].image);
		setText(SLIDES[0].kicker, SLIDES[0].title);
		currentEl && (currentEl.textContent = '01');
		progressBar && (progressBar.style.width = (1 / SLIDES.length) * 100 + '%');
		thumbImg.src = SLIDES[1].image;
		requestAnimationFrame(() => animateTextIn());
		resetProgress();
		nextBtn.addEventListener('click', () => setSlide(activeIdx + 1));
		// Hover pause/resume
		nextBtn.addEventListener('mouseenter', pauseProgress);
		nextBtn.addEventListener('mouseleave', resumeProgress);
	}

	initHero();

	// Mobile menu
	const toggle = document.getElementById('mobileToggle');
	const menu = document.getElementById('mobileMenu');
	if (toggle && menu) {
		function openMenu() { menu.classList.remove('hidden'); toggle.setAttribute('aria-expanded', 'true'); document.addEventListener('keydown', onEsc); document.addEventListener('click', onOutside, true); }
		function closeMenu() { menu.classList.add('hidden'); toggle.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', onEsc); document.removeEventListener('click', onOutside, true); }
		function onEsc(e) { if (e.key === 'Escape') closeMenu(); }
		function onOutside(e) { if (!menu.contains(e.target) && e.target !== toggle) closeMenu(); }
		toggle.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') === 'true'; expanded ? closeMenu() : openMenu(); });
		menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
	}

	// Quality Products slider
	const qTitle = document.getElementById('qTitle');
	const qPara = document.getElementById('qPara');
	const qCenter = document.getElementById('qCenter');
	const qCenterImg = document.getElementById('qCenterImg');
	const qPrevImg = document.getElementById('qPrevImg');
	const qNextImg = document.getElementById('qNextImg');
	const qClient = document.getElementById('qClient');
	const qLocation = document.getElementById('qLocation');

	const Q_SLIDES = [
		{ img: 'assets/image1.png', client: 'Client 1', location: 'Dubai, United Arab Emirates' },
		{ img: 'assets/image2.png', client: 'Client 2', location: 'Abu Dhabi, United Arab Emirates' },
		{ img: 'assets/image3.png', client: 'Client 3', location: 'Doha, Qatar' },
		{ img: 'assets/image1.png', client: 'Client 4', location: 'Kuwait City, Kuwait' },
		{ img: 'assets/image2.png', client: 'Client 5', location: 'Riyadh, Saudi Arabia' },
		{ img: 'assets/image3.png', client: 'Client 6', location: 'Manama, Bahrain' },
		{ img: 'assets/image1.png', client: 'Client 7', location: 'Muscat, Oman' },
		{ img: 'assets/image2.png', client: 'Client 8', location: 'Jeddah, Saudi Arabia' }
	];
	let qi = 0;

	function setQ(idx) {
		qi = (idx + Q_SLIDES.length) % Q_SLIDES.length;
		qCenterImg.src = Q_SLIDES[qi].img;
		qPrevImg && (qPrevImg.src = Q_SLIDES[(qi - 1 + Q_SLIDES.length) % Q_SLIDES.length].img);
		qNextImg && (qNextImg.src = Q_SLIDES[(qi + 1) % Q_SLIDES.length].img);
		qClient.textContent = Q_SLIDES[qi].client;
		qLocation.textContent = Q_SLIDES[qi].location;
	}
	setQ(0);

	// Drag logic with smooth snap
	let isDown = false, startX = 0, currentX = 0;
	function onPointerDown(e) {
		isDown = true;
		qCenter.classList.add('q-dragging');
		startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
	}
	function onPointerMove(e) {
		if (!isDown) return;
		currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
		const delta = currentX - startX;
		qCenterImg.style.transform = `translateX(${delta}px)`;
	}
	function onPointerUp() {
		if (!isDown) return;
		isDown = false;
		qCenter.classList.remove('q-dragging');
		const delta = (currentX || startX) - startX;
		qCenterImg.style.transition = 'transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)';
		if (delta > 60) { setQ(qi - 1); }
		else if (delta < -60) { setQ(qi + 1); }
		qCenterImg.style.transform = 'translateX(0)';
		setTimeout(() => { qCenterImg.style.transition = ''; }, 420);
	}
	if (qCenter) {
		qCenter.addEventListener('mousedown', onPointerDown);
		qCenter.addEventListener('touchstart', onPointerDown, { passive: true });
		window.addEventListener('mousemove', onPointerMove);
		window.addEventListener('touchmove', onPointerMove, { passive: true });
		window.addEventListener('mouseup', onPointerUp);
		window.addEventListener('touchend', onPointerUp);
	}

	// Scroll-triggered reveal: title then paragraph
	const qualitySection = document.getElementById('quality');
	if (qualitySection && qTitle && qPara) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					qTitle.classList.add('is-in');
					setTimeout(() => qPara.classList.add('is-in'), 200);
					io.disconnect();
				}
			});
		}, { threshold: 0.25 });
		io.observe(qualitySection);
	}
})();