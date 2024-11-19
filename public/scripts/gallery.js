let gallery           = []
let paintingsIndex    = []
let index             = -1;

const screens = {
    gallery : 'gallery',
    index   : 'paintings-index',
    about   : 'about',
}

let currentDisplay = screens.gallery;
let emptyState
let painting
let info


document.addEventListener('DOMContentLoaded', async function() {

    emptyState = document.querySelector('#gallery .empty-state')
    painting   = document.querySelector('#gallery .painting')
    info       = document.querySelector('#gallery .info')

    initIndex()
    await loadNextPaintings()
    initSideButtons()
    initKeys()
    refreshDisplay()

})

function initIndex() {
    if (sessionStorage.getItem('lastIndex')) {
        index = Number(sessionStorage.getItem('lastIndex'))
    }
}

function initKeys() {
    document.querySelector('body').addEventListener('keyup', (ev) => {
        if (ev.keyCode == 72) {
            currentDisplay = currentDisplay == screens.gallery ? screens.index : screens.gallery
            refreshDisplay()
        }
    })
}

function refreshDisplay() {

    Object.values(screens).forEach( display => {
        document.querySelector(`#${display}`).style.display = 'none'
    })
    document.querySelector(`#${currentDisplay}`).style.display = 'block'

}

async function loadNextPaintings() {

    let response = await fetch('/app/controllers/nextPaintings.php')
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    let result = await response.json()
    if (result.success) {
        gallery = gallery.concat(result.paintings)
        paintingsIndex = result.paintingsIndex
        if (index == -1) {
            index++
        }
        refreshPainting()
        refreshPaintingsIndex()
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
        classes: ['description'],
        content: gallery[index].description.replace(/(?:\r\n|\r|\n)/g, '<br>')
    }))

    emptyState.style.display = 'none';
    info.style.display       = 'none';
    painting.style.display   = 'block';

    sessionStorage.setItem('lastIndex', index)
}

function initSideButtons() {
    document.querySelector('#gallery .side-button.left').addEventListener('click', e => {
        e.stopPropagation()
        previousPainting()
    })
    document.querySelector('#gallery .side-button.right').addEventListener('click', e => {
        e.stopPropagation()
        nextPainting()
    })
}

function previousPainting() {
    index--
    refreshPainting()
}

function nextPainting() {
    index++
    refreshPainting()
}

function switchToInfo() {
    painting.style.display = 'none';
    info.style.display  = 'block';
}

function switchToPainting() {
    info.style.display = 'none';
    painting.style.display  = 'block';
}

function refreshPaintingsIndex() {

    const paintingsIndexDiv = document.querySelector('#paintings-index')

    paintingsIndex.forEach((painting, pos) => {
        paintingsIndexDiv.append(newElem('div', {
            classes: ['painting-data'],
            nodes: [
                newElem('div', {
                    classes: ['pos'],
                    content: pos+1
                }),
                newElem('div', {
                    classes: ['author'],
                    content: painting.author
                }),
                newElem('div', {
                    classes: ['name'],
                    content: painting.name
                }),
                newElem('input', {
                    attributes: [['type', 'hidden'], ['value', painting.id]],
                    classes: ['id'],
                })
            ]
        }))
    })
}
