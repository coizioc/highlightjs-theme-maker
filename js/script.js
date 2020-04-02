// An array of objects containing all the pickers and their associated classes.
let classPickers = [];

function RGBtoHEX(rgb) {
    var rgb = rgb.split("(")[1].split(")")[0].split(',');
    var hex = rgb.map(function(x) {
        x = parseInt(x).toString(16);
        return (x.length==1) ? "0" + x : x;
    });

    return hex.join('');
}

function getCSSClassName(className) {
    return (className === 'background' || className === 'default-text')
           ? '.hljs' : '.hljs-' + className;
}

function updateColor(className, picker, cssProperty) {
    // If updating the default text's color, update
    // all the classes that use the default text's color.
    if(className === 'default-text') {
        for(let classPicker of classPickers
        ) {
            if(classPicker.picker.defaultText) {
                classPicker.picker.fromRGB(...picker.rgb);
                updateColor(classPicker.className, classPicker.picker, 'color');
            }
        }
    }

    className = getCSSClassName(className);

    let boldStyle = (picker.isBold)
                  ? 'bold' : 'normal';
    let italicStyle = (picker.isItalic)
                    ? 'italic' : 'normal';

    document.querySelectorAll(className).forEach(classElement => {
        classElement.style[cssProperty] = '#' + picker;
        classElement.style.fontWeight = boldStyle;
        classElement.style.fontStyle = italicStyle;
    });
}

function exportCSS() {
    let css = `.hljs {
    display: block;
    overflow-x: auto;
    padding: .5em;
}\n`;
    document.getElementsByTagName('input').forEach(tag => {
        className = getCSSClassName(tag.id);

        let color = tag.style.backgroundColor;
        color = '#' + RGBtoHEX(color);

        // Creating CSS rule:
        css += className + ' {\n';

        if(tag.id === 'background') {
            css += `    background-color: ${color};\n`;
        } else {
            css += `    color: ${color};\n`;
        }
        if(tag.style.fontWeight === 'bold') {
            css += '    font-weight: bold;\n'
        }
        if(tag.style.fontStyle === 'italic') {
            css += '    font-style: italic;\n';
        }
        css += '}\n';
    });

    alert(css);
}

function addCodeMouseover() {
    document.querySelectorAll("[class^=hljs]").forEach(tag => {
        tag.onmousedown = function() {
            if(tag.classList[0] !== '.hljs') {
                let className = tag.classList[0].substr(5);
                let inputElement = document.getElementById(className);
                let gridItemElement = inputElement.parentElement.parentElement;
                gridItemElement.classList.add('highlight');

                inputElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                setTimeout(function() {
                    gridItemElement.classList.remove('highlight');
                }, 2000);
            }
        };
    });
}

function initializePicker(inputEle, options) {
    options.bold = options.bold | false;
    options.italic = options.italic | false;
    options.useDefault = options.useDefault | false;

    let picker = new jscolor(inputEle, {
        value: options.color,
        isBold: options.bold,
        isItalic: options.italic,
        defaultText: options.useDefault
    });

    picker.onFineChange = function() {
        cssProperty = options.property || "color";
        updateColor(options.class, this, cssProperty);
    }
    picker.onFineChange();

    classPickers.push({
        className: options.class,
        picker: picker
    });

    return picker;
}

function initializePickers() {
    fetch('js/options.json').then(async function(response) {
        const options = await response.json();
        Array.from(document.getElementsByTagName('input')).forEach(inputEle => {
            let className = inputEle.id;
            let optionFound = false;
            for(let section of options) {
                for(let sectionOption of section.options) {
                    if(sectionOption.class === className) {
                        initializePicker(inputEle, sectionOption);
                        optionFound = true;
                        break;
                    }
                }
            }
            if(!optionFound) {
                console.error(`Unable to find class ${inputEle.id} in options.json.`);
            }
        });
    });
}

async function createCodeBlocks() {
    let response = await fetch('js/languages.json');
    let languages = await response.json();
        
    let codeBlocksDiv = document.getElementById('code-blocks').firstElementChild;
    
    for(let language of languages) {
        let response = await fetch('js/languages/' + language.class + '.txt')
        codeBlock = await response.text();
        let languageHeader = document.createElement('h2');
        languageHeader.innerHTML = language.name;

        codeBlock = codeBlock.replace(/\</g, '&lt;');

        let preEle = document.createElement('pre');
        let codeEle = document.createElement('code');
        codeEle.classList.add(language.class);
        codeEle.innerHTML = codeBlock;

        preEle.appendChild(codeEle);

        codeBlocksDiv.appendChild(languageHeader);
        codeBlocksDiv.appendChild(preEle);
    }
    return codeBlocksDiv;
}

async function main() {
    initializePickers();
    await createCodeBlocks();
    hljs.initHighlighting();
    addCodeMouseover();
}

