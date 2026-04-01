const getTrack = () => document.getElementById('grabber')
const VW = () => window.innerWidth           // px, used only to convert
const toVW = px => (px / VW()) * 100        // px → vw units

let minOffset, maxOffset

function getOffset() {
    return window.innerWidth <= 768 ? 2.5 : 12.5
}

function calcBounds() {
    const trackW = toVW(getTrack().scrollWidth)     // full track width in vw
    maxOffset = getOffset()
    minOffset = (100 - getOffset()) - trackW
    // if content shorter than viewport just lock to start
    if (minOffset > maxOffset) minOffset = maxOffset
}

let OFFSET_PERCENT = getOffset()

// ── State ─────────────────────────────────────────────────────────────────
let offset = getOffset()  // current translateX in vw
let dragging = false
let startX = 0      // pointer x at drag start (vw)
let startOff = 0      // offset at drag start
let velocity = 0
let lastX = 0
let lastT = 0
let rafID = null

function applyTransform(x, animate) {
    getTrack().style.transition = animate ? 'transform .55s cubic-bezier(.25,.46,.45,.94)' : 'none'
    getTrack().style.transform = `translateX(${x}vw)`
}

// Rubber-band formula for overscroll feel
function rubberBand(x, min, max) {
    if (x > max) {
        const over = x - max
        return max + over * 0.25
    }
    if (x < min) {
        const over = min - x
        return min - over * 0.25
    }
    return x
}

function clamp(x, min, max) {
    return Math.min(max, Math.max(min, x))
}

// ── Drag handlers ─────────────────────────────────────────────────────────
function onStart(e) {
    calcBounds()
    dragging = true
    startX = toVW(e.touches ? e.touches[0].clientX : e.clientX)
    startOff = offset
    velocity = 0
    lastX = startX
    lastT = performance.now()
    document.body.classList.add('dragging')
    cancelAnimationFrame(rafID)
    if (e.cancelable) e.preventDefault()
}

function onMove(e) {
    if (!dragging) return
    const cx = toVW(e.touches ? e.touches[0].clientX : e.clientX)
    const now = performance.now()
    const dt = now - lastT || 1

    velocity = (cx - lastX) / dt * 16   // vw per frame (~60fps)
    lastX = cx
    lastT = now

    const raw = startOff + (cx - startX)
    offset = rubberBand(raw, minOffset, maxOffset)
    applyTransform(offset, false)
    if (e.cancelable) e.preventDefault()
}

function onEnd() {
    if (!dragging) return
    dragging = false
    document.body.classList.remove('dragging')

    // Snap back if overscrolled
    const snapped = clamp(offset + velocity * 4, minOffset, maxOffset)
    offset = snapped
    applyTransform(snapped, true)

    // Momentum
    rafID = requestAnimationFrame(momentum)
}

function momentum() {
    if (dragging) return
    velocity *= 0.92
    if (Math.abs(velocity) < 0.01) return

    const next = offset + velocity
    if (next > maxOffset || next < minOffset) {
        offset = clamp(next, minOffset, maxOffset)
        applyTransform(offset, true)
        velocity = 0
        return
    }
    offset = next
    applyTransform(offset, false)
    rafID = requestAnimationFrame(momentum)
}
function resetSlider(animate = true) {
    offset = getOffset()
    applyTransform(offset, animate) // плавно уедет на старт
    calcBounds()
}
// ── Events ────────────────────────────────────────────────────────────────
const vp = document.getElementById('zone-slider')

vp.addEventListener('mousedown', onStart, { passive: false })
vp.addEventListener('touchstart', onStart, { passive: false })

window.addEventListener('mousemove', onMove, { passive: false })
window.addEventListener('touchmove', onMove, { passive: false })

window.addEventListener('mouseup', onEnd)
window.addEventListener('touchend', onEnd)
window.addEventListener('mouseleave', onEnd)

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    calcBounds()
    offset = Math.min(maxOffset, Math.max(minOffset, offset))
    applyTransform(offset, false)
})
// ── Init ──────────────────────────────────────────────────────────────────
calcBounds()
applyTransform(offset, false)

