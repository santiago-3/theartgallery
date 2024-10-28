let allAuthors   = []
let allPaintings = []

document.addEventListener('DOMContentLoaded', () => {
    loadAuthors()
    loadPaintings()
    document.querySelector('.section.authors .search-area input').addEventListener('keyup', filterAuthors)
    document.querySelector('.section.paintings .search-area input').addEventListener('keyup', filterPaintings )
})

function loadAuthors() {
    fetch('/app/controllers/loadAuthors.php')
        .then(response => {
            response.json().then(result => {
                if (result.success) {                    
                    allAuthors = result.authors
                    loadAuthorsList(allAuthors)
                }
            }) 
        })
}

function loadPaintings() {
    fetch('/app/controllers/loadPaintings.php')
        .then(response => {
            response.json().then(result => {
                if (result.success) {                    
                    allPaintings = result.paintings
                    loadPaintingsList(allPaintings)
                }
            }) 
        })
}

function filterAuthors(ev) {
    const filterText = ev.target.value.toLowerCase()
    let filteredAuthors = allAuthors.filter( author => author.name.toLowerCase().includes(filterText) )
    loadAuthorsList(filteredAuthors)
}

function filterPaintings(ev) {

    const filterText = ev.target.value.toLowerCase()
    
    let filteredPaintings = allPaintings.filter( painting => {
        return painting.year.toLowerCase().includes(filterText) ||
               painting.author.toLowerCase().includes(filterText) ||
               painting.name.toLowerCase().includes(filterText)
    })

    loadPaintingsList(filteredPaintings)

}

function loadAuthorsList(authors) {
    console.log('authors', authors)

    const items = document.querySelector('.section.authors .items')
    while (items.firstChild) {
        items.removeChild(items.firstChild)
    }

    authors.forEach(author => {

        const name = document.createElement('div')
        name.classList.add('name')
        name.innerHTML = author.name

        const item = document.createElement('div')
        item.classList.add('item')
        item.classList.add('author')
        item.appendChild(name)

        items.appendChild(item)
    })

}

function loadPaintingsList(paintings) {

    const items = document.querySelector('.section.paintings .items')
    while (items.firstChild) {
        items.removeChild(items.firstChild)
    }

    paintings.forEach(painting => {

        const bgWidth = 100
        const bgHeigth = (painting.file.height / painting.file.width) * bgWidth
        
        const backgroundStyleProperties = [
            `background-image: url('/public/images/${painting.file.name}')`,
            `background-size: ${bgWidth}px ${bgHeigth}px;`
        ]

        const year = document.createElement('div')
        year.classList.add('year')
        year.innerHTML = painting.year

        const author = document.createElement('div')
        author.classList.add('author')
        author.innerHTML = painting.author

        const name = document.createElement('div')
        name.classList.add('name')
        name.innerHTML = painting.name

        const deleteButton     = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', async function(e) {
            e.preventDefault()
            if (confirm(`segur@ que desea borrar la pintura ${painting.id} (${painting.name})`)) {
                const formData = new FormData()

                formData.append('id', painting.id)
                let response = await fetch('/app/controllers/deletePainting.php', {
                    method: 'POST',
                    body: formData
                })
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`)
                }
                let result = await response.json()
                if (result.success) {
                    window.location.reload()
                }
            }
        })

        const item = document.createElement('div')
        item.classList.add('item')
        item.classList.add('painting')
        item.setAttribute('style', backgroundStyleProperties.join('; '))
        item.appendChild(year)
        item.appendChild(author)
        item.appendChild(name)
        item.appendChild(deleteButton)

        const anchor = document.createElement('a')
        anchor.setAttribute('href', `/painting.php?id=${painting.id}`)
        anchor.appendChild(item)

        items.appendChild(anchor)
    })

}
