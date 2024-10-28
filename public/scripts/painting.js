let id      = null
let names   = [] // paintingNames
let authors = []
let styles  = []
let authorSelector = null
let styleSelector  = null
let fileInput      = null
let fileChanged    = false

document.addEventListener('DOMContentLoaded', async function() {
    const params = getParams(window.location.href)
    document.querySelector('#save').addEventListener('click', e => {
        e.preventDefault()
        validate()
    })
    document.querySelector('#file').addEventListener('change', displayFile)
    await loadSelects()
    if (params.hasOwnProperty('id')) {
        id = params.id
        await loadPaintingData(id)
    }
    document.querySelector('.screen').style.display = 'none'
    initAnywhereClick()

    document.querySelectorAll('.data-list-box').forEach( elem => elem.addEventListener('click', e => {
        e.stopPropagation()
    }))
})

function initAnywhereClick() {
    document.addEventListener('click', () => {
        authorSelector.closeList()
        styleSelector.closeList()
    })
}

function getParams(url) {
    if (url.split('?').length < 1) {
        return {}
    }
    try {
        return url.split('?')[1].split('&').reduce( (acc, param) => {
                keyValue = param.split('=')
                acc[keyValue[0]] = keyValue[1]
                return acc
            }, {})
    }
    catch(error) {
        console.log('Could not parms url params: ', error)
        return {}
    }
}

async function loadSelects() {
    let response = await fetch('/app/controllers/loadNames.php')
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    let result = await response.json()
    if (result.success) {
        names = result.names
    }

    response = await fetch('/app/controllers/loadAuthors.php')
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    result = await response.json()
    if (result.success) {
        authors = result.authors
        populateAuthorsSelect(result.authors)
        console.log('authors select populated')
    }

    response = await fetch('/app/controllers/loadStyles.php')
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    result = await response.json()
    if (result.success) {
        styles = result.styles
        populateStylesSelect()
        console.log('styles select populated')
    }
}

function populateAuthorsSelect() {
    const authorInput = document.querySelector('#author')
    const authorsList = document.querySelector('#authors-list')
    authorSelector = new Selector(authorInput, authorsList, authors)
}

function populateStylesSelect() {
    const styleInput = document.querySelector('#style')
    const stylesList = document.querySelector('#styles-list')
    styleSelector = new Selector(styleInput, stylesList, styles)
}

async function loadPaintingData(id) {
    let response = await fetch(`app/controllers/loadPainting.php?id=${id}`)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    let result = await response.json()
    if (result.success) {
        displayPaintingData(result.painting)
    }
    else {
        console.log('painting load failed:', result.error)
    }
}

function displayPaintingData(painting) {
    authorSelector.value = painting.author_id
    styleSelector.value  = painting.style_id

    document.querySelector('#year').value        = painting.year
    document.querySelector('#name').value        = painting.name
    document.querySelector('#description').value = painting.description

    document.querySelector('header .title').innerHTML = painting.name

    let imageFrame = document.querySelector('.image-frame')
    let newImageArea = document.createElement('div')
    let image = document.createElement('img')
    newImageArea.classList.add('new-image-area')

    image.src = `/public/images/${painting.file.name}`
    image.classList.add('image');

    newImageArea.appendChild(image)
    while (imageFrame.firstChild) {
        imageFrame.removeChild(imageFrame.firstChild)
    }

    let resetButton = document.createElement('a')
    resetButton.innerHTML = 'remover'
    resetButton.setAttribute('id', 'reset-file');
    resetButton.classList.add('anchor-like-button');
    resetButton.addEventListener('click', e => {
        resetFile()
    })

    imageFrame.appendChild(newImageArea);
    imageFrame.appendChild(resetButton);
}

function displayFile() {
    fileInput = document.querySelector('#file')
    let imageFrame = document.querySelector('.image-frame')
    document.querySelector('.image-area').style.display = 'none'
    let reader = new FileReader()
    reader.onload = e => {

        let image = document.createElement('img')
        image.src = e.target.result
        image.classList.add('image');

        let newImageArea = document.createElement('div')
        newImageArea.classList.add('new-image-area')
        newImageArea.appendChild(image)

        let resetButton = document.createElement('a')
        resetButton.innerHTML = 'remover'
        resetButton.setAttribute('id', 'reset-file');
        resetButton.classList.add('anchor-like-button');
        resetButton.addEventListener('click', e => {
            resetFile()
        })

        imageFrame.appendChild(newImageArea);
        imageFrame.appendChild(resetButton);
    }
    reader.readAsDataURL(fileInput.files[0])
}

function resetFile() {
    fileChanged = true
    const imageFrame = document.querySelector('.image-frame')

    const message  = document.createElement('div')
    message.innerHTML = 'Drop image here'

    const label  = document.createElement('label')
    label.setAttribute('for', 'file')
    label.innerHTML = 'Select file'

    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('id', 'file')
    input.setAttribute('required', true)
    input.addEventListener('change', displayFile)
    fileInput = input

    const imageArea  = document.createElement('div')
    imageArea.classList.add('image-area')
    imageArea.appendChild(message)
    imageArea.appendChild(label)
    imageArea.appendChild(input)

    imageFrame.querySelector('.new-image-area').remove()
    imageFrame.appendChild(imageArea)
}

function validate() {

    const form = document.querySelector('form')
    form.reportValidity()

    if (form.checkValidity()) {

        if (id == null && names.some( name => name.author_id == authorSelector.value && name.name == document.querySelector('#name').value )) {
            console.log('Ya existe un cuadro del mismo autor con el mismo nombre')
        }
        else {
            save()
        }

    }

}

function save() {

    document.querySelector('.screen').style.display = 'flex'

    const formData = new FormData()

    formData.append('author_id', authorSelector.value)
    formData.append('style_id', styleSelector.value)
    formData.append('year', document.querySelector('#year').value)
    formData.append('name', document.querySelector('#name').value)
    formData.append('description', document.querySelector('#description').value)

    if (id !== null) {
        formData.append('id', id)
    }
    if (id == null || fileChanged) {
        formData.append('file', fileInput.files[0])
    }

    fetch('/app/controllers/save.php', { method: 'POST', body: formData })
        .then(response => {
            response.json().then(result => {
                if (result.success) {                    
                    document.querySelector('.screen').style.display = 'none'
                    if (id === null) {
                        displaySavedPaintingBox(result.paintingData, result.imageData)
                        resetForm()
                    }
                    else {
                        window.location.href = '/list.php'
                    }
                }
                else {
                    window.location.href = '/list.php'
                }
            }) 
        })
}

function displaySavedPaintingBox(paintingData, imageData) {
    const message = document.createElement('div')
    message.classList.add('message')
    message.innerHTML = 'Pintura guardada'

    const name    = document.createElement('div')
    name.classList.add('name')
    name.innerHTML = paintingData.name

    const author  = document.createElement('div')
    author.classList.add('author')
    author.innerHTML = authors.find(a => a.id == paintingData.author_id).name

    const content = document.createElement('div')
    content.classList.add('content')
    content.appendChild(message)
    content.appendChild(name)
    content.appendChild(author)

    const savedPaintingBox = document.createElement('div')
    savedPaintingBox.classList.add('saved-painting')
    savedPaintingBox.setAttribute('style', `background-image: url('/public/images/${imageData.name}')`)
    savedPaintingBox.appendChild(content)

    const anchor = document.createElement('a')
    anchor.setAttribute('href', `painting.php?id=${paintingData.id}`)
    anchor.appendChild(savedPaintingBox)

    const savedPaintingBg  = document.createElement('div')
    savedPaintingBg.classList.add('saved-painting-bg')
    savedPaintingBg.appendChild(anchor)

    const savedPaintings = document.querySelector('.saved-paintings')
    savedPaintings.appendChild(savedPaintingBg)
    savedPaintings.scrollLeft = savedPaintings.scrollWidth
}

function resetForm() {

    document.querySelector('.new-image-area').remove()
    document.querySelector('.image-area').style.display     = 'flex'

    document.querySelector('#year').value        = ""
    document.querySelector('#name').value        = ""
    document.querySelector('#description').value  = ""
}
