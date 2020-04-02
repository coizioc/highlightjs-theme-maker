/* Functions used to build the public website, as generating all of these
 * DOM elements takes a significant amount of time.
 */

async function createOptions() {
    let response = await fetch('js/options.json');
    let options = await response.json();

    let optionsDiv = document.getElementById('options');
    for(let section of options) {
        let sectionHeader = document.createElement('h2');
        sectionHeader.innerHTML = section.name;

        let sectionList = document.createElement('div');
        sectionList.classList.add('grid');

        optionsDiv.appendChild(sectionHeader);
        optionsDiv.appendChild(sectionList);

        for(let sectionOption of section.options) {
            let optionDiv = createOptionDiv(sectionOption);
            sectionList.appendChild(optionDiv);
        }
    }
}

function createOptionDiv(sectionOption) {
    let optionDiv = document.createElement('div');
    optionDiv.classList.add('grid-item');

    let labelDiv = document.createElement('div');
    labelDiv.style.flex = 1;

    let optionLabel = document.createElement('label');
    optionLabel.setAttribute('for', sectionOption.class);
    optionLabel.innerHTML = `<span class="tooltip">
        ${sectionOption.title}
        <span class="tooltip-text">
            ${sectionOption.description}
        </span>
    </span>`;

    labelDiv.appendChild(optionLabel);

    let colorDiv = document.createElement('div');
    colorDiv.style.flex = 1;

    let optionInput = document.createElement('input');
    optionInput.id = sectionOption.class;
    initializePicker(optionInput, sectionOption);

    colorDiv.appendChild(optionInput);

    optionDiv.appendChild(labelDiv);
    optionDiv.appendChild(colorDiv);

    return optionDiv;
}

async function build() {
    createOptions();
    await createCodeBlocks();
    hljs.initHighlighting();
    addCodeMouseover();
}

build();
