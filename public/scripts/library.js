function newElem(tag, params) {

    const elem = document.createElement(tag)

    if (params.hasOwnProperty('classes')) {
        params.classes.forEach(_class => {
            elem.classList.add(_class)
        })
    }

    if (params.hasOwnProperty('attributes')) {
        params.attributes.forEach(([key, value]) => {
            elem.setAttribute(key, value)
        })
    }

    if (params.hasOwnProperty('content')) {
        elem.innerHTML = params.content
    }

    if (params.hasOwnProperty('nodes')) {
        params.nodes.forEach(node => {
            elem.appendChild(node)
        })
    }

    if (params.hasOwnProperty('eventListeners')) {
        params.eventListeners.forEach(([eventName, _function]) => {
            elem.addEventListener(eventName, _function)
        })
    }

    return elem
}
