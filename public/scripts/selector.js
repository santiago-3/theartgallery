class Selector {
    _value       = 0

    constructor(inputElement, listElement, options) {
        if (! Array.isArray(options)) {
            throw new Error('Selector class must receive an array of options in the constructor')
        }

        this.inputElement = inputElement
        this.listElement  = listElement
        this.options      = options
        this.index        = 0
        this.maxIndex     = options.length-1  
        this.htmlOptions  = []

        this.initOptions()
        this.initInput()
    }

    get value() {
        return this._value
    }

    set value(value) {
        this.setById(value)
        this._value = value
    }

    initOptions() {
        
        this.options.forEach((option, index) => {
            const div = document.createElement('div')
            div.classList.add('selector-option')
            div.setAttribute('data-id', option.id)
            div.dataset.index = index
            div.innerHTML = option.name
            div.addEventListener('mouseenter', (e) => {
                this.index = e.target.dataset.index
                this.refreshHighlighted()
            })
            div.addEventListener('click', (e) => {
                e.stopPropagation()
                this.selectHighlightedElement()
            })
            this.htmlOptions.push(div)
        })
        this.refreshOptions(this.htmlOptions)

    }

    refreshOptions() {
        this.htmlOptions.forEach( option => {
            this.listElement.appendChild(option)
        })
    }

    initInput() {
        this.inputElement.addEventListener('focus', e => {
            this.inputElement.select()
            this.listElement.style.display = 'block'
            this.index = 0
            this.refreshHighlighted()
        })
        this.inputElement.addEventListener('blur', e => {
            //this.closeList()
        })
        this.inputElement.addEventListener('keydown', e => {
            if (e.keyCode == 9) {
                this.selectHighlightedElement()
            }
            if (e.keyCode == 13) {
                e.preventDefault()
                e.stopPropagation()
            }
        })
        this.inputElement.addEventListener('keyup', e => {
            if (e.keyCode == 13) {
                this.selectHighlightedElement()
                this.closeList()
            }
            else if (e.keyCode == 38 || e.keyCode == 40) {
                if (e.keyCode == 40) {
                    this.index++
                }
                if (e.keyCode == 38) {
                    this.index--
                }
                if (this.index < 0) {
                    this.index = this.maxIndex
                }
                if (this.index > this.maxIndex) {
                    this.index = 0
                }
                this.refreshHighlighted()
            }
            else {
                if (e.target.value == '') {
                    this.refreshOptions()
                }
                else {
                    this.filterByText(e.target.value)
                }
                this.index = 0
                this.refreshHighlighted()
            }
        })
    }

    refreshHighlighted() {
        this.listElement.querySelectorAll('.selector-option').forEach( (elem, index) => {
            if (index == this.index) {
                elem.classList.add('highlighted')
            }
            else {
                elem.classList.remove('highlighted')
            }
        })
    }

    selectHighlightedElement() {
        const elem = this.listElement.querySelectorAll('.selector-option')[this.index] 
        this.selectElement(elem)
        this.closeList()
    }

    selectElement(elem) {
        this.inputElement.value = elem.innerHTML
        this._value = elem.dataset.id
    }

    setById(id) {
        this.listElement.innerHTML = ''
        const option = this.htmlOptions.find( option => option.dataset.id == id )
        option.dataset.index = 0
        this.selectElement(option)
        this.listElement.appendChild(option)
    }

    filterByText(text) {
        this.listElement.innerHTML = ''
        this.htmlOptions
            .filter( option => option.innerHTML.toLowerCase().includes(text.toLowerCase()) )
            .forEach( (option, index) => {
                option.dataset.index = index
                this.listElement.appendChild(option)
            })
    }

    closeList() {
        this.listElement.style.display = 'none'
    }

}
