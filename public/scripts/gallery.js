const loadMargin = 3
const paintingsBatch = 25

let offset         = 0
let gallery        = []
let paintingsIndex = []
let index          = 0;

const directions = {
    LEFT : -1,
    RIGHT : 1,
}

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
    await loadMorePaintings(directions.RIGHT)
    initSideButtons()
    initKeys()
    refreshDisplay()

    window.onresize = refreshPainting

})

function initIndex() {
    if (sessionStorage.getItem('lastIndex')) {
        index = Number(sessionStorage.getItem('lastIndex'))
    }
    if (sessionStorage.getItem('offset')) {
        offset = Number(sessionStorage.getItem('offset'))
    }
}

function initKeys() {
    document.querySelector('body').addEventListener('keyup', async function(ev) {
        if (ev.keyCode == 72) {
            currentDisplay = currentDisplay == screens.gallery ? screens.index : screens.gallery
            refreshDisplay()
        }
        else if (ev.keyCode == 82) {
            await fetch(`/app/controllers/resetSession.php`)
            sessionStorage.setItem('offset', 0)
            sessionStorage.setItem('lastIndex', 0)
            window.location.href = '/'
        }
    })
}

function refreshDisplay() {

    Object.values(screens).forEach( display => {
        document.querySelector(`#${display}`).style.display = 'none'
    })
    document.querySelector(`#${currentDisplay}`).style.display = currentDisplay == screens.gallery ? 'flex' : 'block'

}

async function loadMorePaintings(direction) {

    let number = 0

    if (direction == directions.RIGHT) {
        number = offset + gallery.length
        if (gallery.length > paintingsBatch) {
            offset += paintingsBatch
        }
    }
    else if(direction == directions.LEFT) {
        number = offset - paintingsBatch
        offset -= paintingsBatch
    }
    if (offset < 0) {
        offset = 0
    }

    let response = await fetch(`/app/controllers/nextPaintings.php?number=${number}`)

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    let result = await response.json()
    if (result.success) {

        if (direction == 1) {
            gallery = gallery.slice(-paintingsBatch).concat(result.paintings)
        }
        else {
            gallery = result.paintings.concat(gallery.slice(0,paintingsBatch))
        }

        if (paintingsIndex.length == 0) {
            paintingsIndex = result.paintingsIndex
            refreshPaintingsIndex()
        }

        if (index - offset <= loadMargin && offset > 0) {
            loadMorePaintings(directions.LEFT)
        }
        else if (index - offset >= gallery.length - loadMargin && gallery.length + offset < paintingsIndex.length ) {
            loadMorePaintings(directions.RIGHT)
        }
        else {
            refreshPainting()
        }
    }

    sessionStorage.setItem('offset', offset)
}

function refreshPainting() {

    painting.innerHTML = ''
    info.innerHTML = ''

    let image = gallery[index - offset].image

    const imageRatio    = image.width / image.height
    const viewportRatio = window.innerWidth / window.innerHeight

    painting.appendChild(newElem('img', {
        classes: [imageRatio > viewportRatio ? 'wide' : 'high'],
        attributes: [['src', `/public/images/${gallery[index - offset].image.name}`]],
        eventListeners: [['click', switchToInfo]]
    }))
    
    info.appendChild(newElem('div', {
        nodes: [
            newElem('div', {
                classes: ['image-frame'],
                nodes: [newElem('img', {
                    attributes: [['src', `/public/images/${gallery[index - offset].image.name}`]],
                    eventListeners: [['click', switchToPainting]],
                })]
            }),
            newElem('div', {
                classes: ['data'],
                nodes: [
                    newElem('div', {
                        classes: ['author'],
                        content: gallery[index - offset].author
                    }),
                    newElem('div', {
                        classes: ['name'],
                        content: gallery[index - offset].name
                    }),
                    newElem('div', {
                        classes: ['labeled', 'year'],
                        content: gallery[index - offset].year
                    }),
                    newElem('div', {
                        classes: ['labeled', 'style'],
                        content: gallery[index - offset].style
                    }),
                ]
            })
        ]
    }))

    info.appendChild(newElem('div', {
        classes: ['description'],
        content: gallery[index - offset].description.replace(/(?:\r\n|\r|\n)/g, '<br>')
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
    if (index < 0) {
        index = 0
    }
    if (index - offset == loadMargin && offset > 0) {
        loadMorePaintings(directions.LEFT)
    }
    else {
        refreshPainting()
    }
}

function nextPainting() {
    index++
    if (index >= paintingsIndex.length) {
        index = paintingsIndex.length - 1
    }
    if (index - offset == gallery.length - loadMargin && gallery.length + offset < paintingsIndex.length ) {
        loadMorePaintings(directions.RIGHT)
    }
    else {
        refreshPainting()
    }
}

function switchToInfo() {
    painting.style.display = 'none';
    info.style.display  = 'flex';
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
