const target = document.getElementById('trigger')
const btn = document.querySelector('.btn-go-to-top')

const observer = new IntersectionObserver(([entry]) => {
    btn.classList.toggle('visible', !entry.isIntersecting)
})

observer.observe(target);