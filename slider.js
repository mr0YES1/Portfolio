const track = document.getElementById('track');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

function getOffset() {
    return window.innerWidth <= 768 ? 2.5 : 12.5
}

let OFFSET_PERCENT = getOffset()

function resetSlider() {
    offset = getOffset()
    applyTransform(offset, false)
    calcBounds()
}

function calcBounds() {
    maxOffset = getOffset()
    minOffset = (100 - getOffset()) - track
}

function getStep() {
    // Card width + gap — читаем прямо из DOM, всё из CSS
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
}

const cards = track.querySelectorAll('.card_projects');
const total = cards.length;


let current = 0;

function getOffsetPx() {
    // Convert % offset to px based on viewport width
    return window.innerWidth * (OFFSET_PERCENT / 100);
}

function getMinTranslate() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardW = cards[0].getBoundingClientRect().width;
    const trackW = total * cardW + (total - 1) * gap;
    const offsetPx = getOffsetPx();
    // правый край последней карточки должен стоять ровно на offsetPx от правого края окна
    return window.innerWidth - offsetPx - trackW;
}

function getMaxIndex() {
    const step = getStep();
    const offsetPx = getOffsetPx();
    const minT = getMinTranslate();
    // сколько целых шагов умещается до минимального translate
    return Math.max(0, Math.ceil((offsetPx - minT) / step));
}

function getTranslate() {
    const raw = getOffsetPx() - getStep() * current;
    const minT = getMinTranslate();
    // не даём треку уйти правее минимально допустимого значения
    return Math.max(raw, minT);
}

function apply(animated = true) {
    // при ресайзе зажимаем current, чтобы не уйти за новый maxIndex
    current = Math.min(current, getMaxIndex());

    if (!animated) {
        track.style.transition = 'none';
    } else {
        track.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
    }
    track.style.transform = `translateX(${getTranslate()}px)`;

    btnPrev.disabled = current === 0;
    btnNext.disabled = current >= getMaxIndex();

    if (!animated) {
        requestAnimationFrame(() => {
            track.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }
}

function goTo(idx) {
    current = Math.max(0, Math.min(getMaxIndex(), idx));
    apply();
}

btnPrev.addEventListener('click', () => goTo(current - 1));
btnNext.addEventListener('click', () => goTo(current + 1));

window.addEventListener('resize', () => {
    resetSlider()
    calcBounds()
    offset = Math.min(maxOffset, Math.max(minOffset, offset))
    applyTransform(offset, false)
})