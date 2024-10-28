let gallery = []
let index   = -1;

let emptyState
let painting
let info


document.addEventListener('DOMContentLoaded', async function() {

    emptyState = document.querySelector('#gallery .empty-state')
    painting   = document.querySelector('#gallery .painting')
    info       = document.querySelector('#gallery .info')

    await loadNextPaintings()
    initSideButtons()

})

async function loadNextPaintings() {

    let response = await fetch('/app/controllers/nextPaintings.php')
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    let result = await response.json()
    if (result.success) {
        gallery = gallery.concat(result.paintings)
        if (index == -1) {
            index++
            refreshPainting()
        }
    }

}

function refreshPainting() {

    painting.innerHTML = ''
    info.innerHTML = ''

    painting.appendChild(newElem('img', {
        attributes: [['src', `/public/images/${gallery[index].image.name}`]],
        eventListeners: [['click', switchToInfo]]
    }))
    
    info.appendChild(newElem('div', {
        nodes: [
            newElem('div', {
                classes: ['image-frame'],
                nodes: [newElem('img', {
                    attributes: [['src', `/public/images/${gallery[index].image.name}` ]],
                    eventListeners: [['click', switchToPainting]]
                })]
            }),
            newElem('div', {
                classes: ['data'],
                nodes: [
                    newElem('div', {
                        classes: ['author'],
                        content: gallery[index].author
                    }),
                    newElem('div', {
                        classes: ['name'],
                        content: gallery[index].name
                    }),
                    newElem('div', {
                        classes: ['labeled', 'year'],
                        content: gallery[index].year
                    }),
                    newElem('div', {
                        classes: ['labeled', 'style'],
                        content: gallery[index].style
                    }),
                ]
            })
        ]
    }))

    info.appendChild(newElem('div', {
        classes: ['data'],
        content: gallery[index].description.replace(/(?:\r\n|\r|\n)/g, '<br>')
    }))

    emptyState.style.display = 'none';
    info.style.display       = 'none';
    painting.style.display   = 'block';
}

function initSideButtons() {
    document.querySelector('#gallery .side-button.left').addEventListener('click', e => {
        e.stopPropagation()
        index--
        refreshPainting()
    })
    document.querySelector('#gallery .side-button.right').addEventListener('click', e => {
        e.stopPropagation()
        index++
        refreshPainting()
    })
}

function switchToInfo() {
    painting.style.display = 'none';
    info.style.display  = 'block';
}

function switchToPainting() {
    info.style.display = 'none';
    painting.style.display  = 'block';
}
