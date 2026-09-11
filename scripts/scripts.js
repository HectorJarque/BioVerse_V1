(function () {
    const copyButton = document.getElementById('copy-email');
    const emailAddress = document.getElementById('email-address');

    if (copyButton && emailAddress) {
        const address = copyButton.dataset.address;
        const label = copyButton.querySelector('.copy-btn__label');
        const defaultLabel = label ? label.textContent : 'Copy';
        let resetTimeout;

        copyButton.addEventListener('click', function () {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                return;
            }

            navigator.clipboard.writeText(address).then(function () {
                copyButton.classList.add('copy-btn--done');
                if (label) {
                    label.textContent = 'Copied';
                }
                window.clearTimeout(resetTimeout);
                resetTimeout = window.setTimeout(function () {
                    copyButton.classList.remove('copy-btn--done');
                    if (label) {
                        label.textContent = defaultLabel;
                    }
                }, 1800);
            }).catch(function () {
            });
        });
    }

    const container = document.querySelector('.reveal');
    const hidden = container ? container.querySelector('.reveal__hidden') : null;
    const bubbleEls = container ? Array.prototype.slice.call(container.querySelectorAll('.bubble')) : [];

    if (container && hidden && bubbleEls.length) {
        const fractions = [0.34, 0.30, 0.27, 0.32, 0.28];
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let state = [];
        let width = 0;
        let height = 0;
        let frameId = null;
        let lastTime = null;

        function layout() {
            const rect = container.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            state = bubbleEls.map(function (el, i) {
                const size = width * fractions[i % fractions.length];
                const speed = width * (0.18 + Math.random() * 0.14);

                el.style.width = size + 'px';
                el.style.height = size + 'px';

                return {
                    el: el,
                    size: size,
                    x: Math.random() * (width - size),
                    y: Math.random() * (height - size),
                    vx: Math.random() < 0.5 ? -speed : speed,
                    vy: Math.random() < 0.5 ? -speed : speed
                };
            });

            const maskSize = state.map(function (s) {
                return s.size + 'px ' + s.size + 'px';
            }).join(', ');
            hidden.style.maskSize = maskSize;
            hidden.style.webkitMaskSize = maskSize;

            render();
        }

        function render() {
            const positions = state.map(function (s) {
                s.el.style.transform = 'translate(' + s.x + 'px, ' + s.y + 'px)';
                return s.x + 'px ' + s.y + 'px';
            }).join(', ');

            hidden.style.maskPosition = positions;
            hidden.style.webkitMaskPosition = positions;
        }

        function step(ts) {
            if (lastTime === null) {
                lastTime = ts;
            }
            const dt = Math.min((ts - lastTime) / 1000, 0.05);
            lastTime = ts;

            state.forEach(function (s) {
                s.x += s.vx * dt;
                s.y += s.vy * dt;

                if (s.x <= 0) {
                    s.x = 0;
                    s.vx = Math.abs(s.vx);
                } else if (s.x + s.size >= width) {
                    s.x = width - s.size;
                    s.vx = -Math.abs(s.vx);
                }

                if (s.y <= 0) {
                    s.y = 0;
                    s.vy = Math.abs(s.vy);
                } else if (s.y + s.size >= height) {
                    s.y = height - s.size;
                    s.vy = -Math.abs(s.vy);
                }
            });

            render();
            frameId = window.requestAnimationFrame(step);
        }

        layout();

        if (!reduceMotion) {
            frameId = window.requestAnimationFrame(step);
        }

        let resizeTimeout;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(function () {
                if (frameId) {
                    window.cancelAnimationFrame(frameId);
                    frameId = null;
                    lastTime = null;
                }
                layout();
                if (!reduceMotion) {
                    frameId = window.requestAnimationFrame(step);
                }
            }, 200);
        });
    }
})();