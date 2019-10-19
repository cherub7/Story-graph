
/**************************************************
 * SGUIEntity
 **************************************************/

// object in memory for UI element being shown in html
class SGUIEntity {
    constructor(type, uid, parent_uid) {
        this.type = type;
        this.uid = uid;
        this.parent_uid = parent_uid;
    }

    getScript() {
        let script = 'unknown';

        // dynamically generate script based on type
        switch (this.type) {
            case 'attribute':
                script = this.getAttributeScript();
                break;
            case 'story':
                script = this.getStoryScript();
                break;
            case 'scene':
                script = this.getSceneScript();
                break;
            case 'choice':
                script = this.getChoiceScript();
                break;
            case 'effect':
                script = this.getEffectScript();
                break;
            case 'condition':
                script = this.getConditionScript();
                break;
            default:
                throw new Error("unknown type script cannot be generated.");
        }

        return script;
    }

    getAttributeScript() {
        const entityID = document.getElementById('id'+'-'+this.parent_uid).children[1].value;
        const name = document.getElementById('name'+'-'+this.uid).children[1].value;
        const value = document.getElementById('value'+'-'+this.uid).children[1].value;
        const type = document.getElementById('type'+'-'+this.uid).children[1].value;

        let script = `story.addAttribute('${entityID}', '${name}', ${value}, '${type}');`;

        return script;
    }

    getStoryScript() {
        const entityID = document.getElementById('id'+'-'+this.uid).children[1].value;
        const name = document.getElementById('name'+'-'+this.uid).children[1].value;
        const subType = 'None';
        const description = 'None'

        let script = `story = new SGStory('${entityID}', '${name}', '${subType}', '${description}');`;

        return script;
    }

    getSceneScript() {
        const sceneID = document.getElementById('id'+'-'+this.uid).children[1].value;
        const name = document.getElementById('name'+'-'+this.uid).children[1].value;
        const subType = 'None';
        const description = document.getElementById('description'+'-'+this.uid).children[1].value;
        const valuType = 'string';

        let script = `story.addScene('${sceneID}', '${name}', '${subType}', '${description}', '${valuType}');`;

        return script;
    }

    getChoiceScript() {
        const choiceID = document.getElementById('id'+'-'+this.uid).children[1].value;
        const name = document.getElementById('name'+'-'+this.uid).children[1].value;
        const subType = 'None';
        const description = document.getElementById('description'+'-'+this.uid).children[1].value;
        const parentID = document.getElementById('id'+'-'+this.parent_uid).children[1].value;
        const nextSceneID = document.getElementById('next scene id'+'-'+this.uid).children[1].value;

        let script = `story.addChoice('${choiceID}', '${name}', '${subType}', '${description}', '${parentID}', '${nextSceneID}');`;

        return script;
    }

    getEffectScript() {
        let effectType = document.getElementById(this.uid).parentElement.parentElement.id;
        const endIndex = effectType.indexOf('-');

        effectType = effectType.substring(0, endIndex);
        let effectTypeArg = '';

        switch (effectType) {
            case 'entry effect':
                effectTypeArg = 'onEntryEffects';
                break;
            case 'exit effect':
                effectTypeArg = 'onExitEffects';
                break;
            case 'selection effect':
                effectTypeArg = 'onSelectionEffects';
                break;
            case 'rejection effect':
                effectTypeArg = 'onRejectionEffects';
                break;
        }

        const effectID = document.getElementById('id'+'-'+this.uid).children[1].value;
        const parentID = document.getElementById('id'+'-'+this.parent_uid).children[1].value;
        const entityID = document.getElementById('entityID'+'-'+this.uid).children[1].value;
        const attributeName = document.getElementById('attributeName'+'-'+this.uid).children[1].value;
        const op = document.getElementById('op'+'-'+this.uid).children[1].value;
        const newValue = document.getElementById('newValue'+'-'+this.uid).children[1].value;
        const newType = document.getElementById('newType'+'-'+this.uid).children[1].value;

        let script = `story.addEffect('${effectID}', '${parentID}', '${effectTypeArg}', '${entityID}', '${attributeName}', '${op}', ${newValue}, '${newType}');`;

        return script;
    }

    getConditionScript() {
        const conditionID = document.getElementById('id'+'-'+this.uid).children[1].value;
        const parentID = document.getElementById('id'+'-'+this.parent_uid).children[1].value;
        const entityID = document.getElementById('entityID'+'-'+this.uid).children[1].value;
        const attributeName = document.getElementById('attributeName'+'-'+this.uid).children[1].value;
        const op = document.getElementById('op'+'-'+this.uid).children[1].value;
        const value = document.getElementById('newValue'+'-'+this.uid).children[1].value;
    
        let script = `story.addCondition('${conditionID}', '${parentID}', '${entityID}', '${attributeName}', '${op}', ${value});`;

        return script;
    }
}

/**************************************************
 * SGCreator
 **************************************************/

class SGCreator {

    constructor() {
        // TODO: find a way to generate this config from story_graph.js
        this.SGElementUIConfig = {
            'options-panel':{
                type:'options-panel',
            },
            attribute:{
                name: 'text',
                value: 'text',
                type: 'text',
            },
            story:{
                id: 'text',
                name: 'text',
                // 'sub-type': 'text',
                // description: 'multi-text',
                'add#0':{
                    name:'attribute',
                    type:'attribute',
                },
                'add#1':{
                    name:'scene',
                    type:'scene',
                },
                // TODO: add entities and attributes into story
            },
            scene:{
                id: 'text',
                name: 'text',
                // 'sub-type': 'text',
                description:'multi-text',
                'add#0':{
                    name:'attribute',
                    type:'attribute',
                },
                'add#1':{
                    name:'choice',
                    type:'choice',
                },
                'add#2':{
                    name:'entry effect',
                    type:'effect',
                },
                'add#3':{
                    name:'exit effect',
                    type:'effect',
                },
            },
            choice:{
                id: 'text',
                name: 'text',
                // 'sub-type': 'text',
                description:'multi-text',
                'add#0':{
                    name:'attribute',
                    type:'attribute',
                },
                'next scene id':'text',
                'add#1':{
                    name:'selection effect',
                    type:'effect',
                },
                'add#2':{
                    name:'rejection effect',
                    type:'effect',
                },
            },
            effect:{
                id: 'text',
                entityID:'text',
                attributeName:'text',
                op:'text',
                newValue:'text',
                newType:'text',
                'add#1':{
                    name:'condition',
                    type:'condition',
                },
            },
            condition:{
                id: 'text',
                entityID:'text',
                attributeName:'text',
                op:'text',
                value:'text',
            },
        };

        // maintains unique id for html divs
        this.elementUID = 0;

        // the mapping to store elements mapped to their html unique div id's
        this.elementPool = {};

        // the map to store children present under each element
        this.childrenOf = {};
    }

    getUID() {
        const uid = this.elementUID;
        this.elementUID++;
        return uid;
    }

    // TODO: go with decorative pattern? (later)
    // TODO: create a parent story element with default start node
    // TODO: story element must be a book
    // TODO: break the large methods in this class

    // creator methods:

    createElement(type, parentDivId, parent_uid) {
        let element = document.createElement("div");

        const uid = this.getUID();
        element.id = uid;

        let optionsPanel = document.createElement('div');
        optionsPanel.id = 'options' + '-' + uid;
        this.appendDivs(optionsPanel, uid, 'options-panel');

        let contentPanel = document.createElement('div');
        contentPanel.id = 'content' + '-' + uid;
        this.appendDivs(contentPanel, uid, type);

        element.appendChild(optionsPanel);
        element.appendChild(contentPanel);
        
        let elementObj = new SGUIEntity(type, uid, parent_uid);

        // add entity to the child pool
        if (this.childrenOf[parent_uid] === undefined)
            this.childrenOf[parent_uid] = [];
        
        this.childrenOf[parent_uid].push(uid);

        // styling
        element.style.width = '90%';
        element.style.borderStyle = 'solid';
        element.style.borderRadius = '20px';
        element.style.padding = '10px';
        element.style.margin = '10px';

        // adding element to elements pool and appending it to the parentDiv
        this.elementPool[uid] = elementObj;
        let parentDiv = document.getElementById(parentDivId);
        parentDiv.append(element);
    }

    appendDivs(elementDiv, uid, configName) {
        const config = this.SGElementUIConfig[configName];

        if (config === undefined)
            throw new Error(`unknow config '${configName}' requested`);

        Object.keys(config).forEach(key => {
            let type = config[key];

            if (key.substr(0, 4) === 'add#')
                type = 'add';
            
            let newElement = document.createElement('div');
            newElement.style.width = '100%';

            switch (type) {
                case 'options-panel':
                    newElement.style.textAlign = 'right';

                    // collapse/expand button
                    let resizeButton = document.createElement('button');
                    resizeButton.textContent = '- collapse';
                    resizeButton.onclick = function() {
                        let contentId = 'content' + '-' + uid;
                        let contentPanel = document.getElementById(contentId);
                        
                        if (resizeButton.textContent === '- collapse') {
                            contentPanel.hidden = true;
                            resizeButton.textContent = '+ expand';
                        }
                        else {
                            contentPanel.hidden = false;
                            resizeButton.textContent = '- collapse';
                        }
                    };

                    resizeButton.style.margin = '5px';

                    // delete button
                    let deleteButton = document.createElement('button');
                    deleteButton.textContent = 'x delete';
                    deleteButton.onclick = function() {
                        // remove the element as child of its parent
                        let parent_uid = creator.elementPool[uid].parent_uid;
                        let index = creator.childrenOf[parent_uid].indexOf(uid);
                        creator.childrenOf[parent_uid].splice(index, 1);

                        // remove all the element's children
                        creator.deleteElement(uid);
                    }

                    deleteButton.style.margin = '5px';

                    // script button
                    let scriptButton = document.createElement('button');
                    scriptButton.textContent = '</> script';
                    scriptButton.onclick = function() {
                        alert(creator.elementPool[uid].getScript());
                    }

                    scriptButton.style.margin = '5px';

                    newElement.appendChild(resizeButton);
                    newElement.appendChild(deleteButton);
                    newElement.appendChild(scriptButton);
                    
                    break;
                case 'text':
                    newElement.id = key + '-' + uid;
                    
                    // add divs
                    let labelDiv = document.createElement('div');
                    labelDiv.innerText = key;

                    labelDiv.style.width = '20%';
                    labelDiv.style.display = 'inline-block';

                    let textBox = document.createElement('input');
                    textBox.id = 'value';

                    textBox.style.width = "50%";

                    newElement.appendChild(labelDiv);
                    newElement.appendChild(textBox);

                    break;
                case 'multi-text':
                    newElement.id = key + '-' + uid;
                    
                    // add divs
                    let multiLabelDiv = document.createElement('div');
                    multiLabelDiv.innerText = key;

                    let textArea = document.createElement('textarea');
                    textArea.id = 'value';

                    textArea.style.width = '70%';
                    textArea.style.minWidth = "90%";
                    textArea.style.maxWidth = "90%";
                    textArea.style.minHeight = "100px";
                    textArea.style.maxHeight = "100px";
                    
                    newElement.appendChild(multiLabelDiv);
                    newElement.appendChild(textArea);

                    break;
                case 'add':
                    newElement.id = type = config[key]['name'] + '-' + uid;
                    type = config[key]['type']; // resolving back type

                    // add area
                    const areaId = this.getUID();
                    let addArea = document.createElement('div');
                    addArea.id = areaId;
                    
                    // add button
                    let addButton = document.createElement('button');
                    addButton.textContent = '+ add ' + config[key]['name'];
                    addButton.onclick = function(){
                        creator.createElement(type, areaId, uid);
                    };

                    newElement.append(addArea);
                    newElement.append(addButton);

                    break;
                case 'color':
                    break;
                default:
                    throw new Error(`unknow config type '${type}' requested`);
            }

            elementDiv.appendChild(newElement);
        });
    }

    generateScript() {
        const max_uid = this.getUID();
        let typePool = {};

        for (var uid = 0; uid < max_uid; uid++) {
            let element = this.elementPool[uid];

            if (element !== undefined) {
                let type = element.type;

                if (typePool[type] === undefined)
                    typePool[type] = [];

                typePool[type].push(uid);
            }
        }

        const build_sequence = ['story', 'scene', 'choice', 'effect', 'condition', 'attribute'];
        let script = '';

        build_sequence.forEach(type => {
            script += `\n\n// -----( ${type} )-----\n\n`;

            let componentIDs = typePool[type];
            if (componentIDs !== undefined) {
                componentIDs.forEach(componentID => {
                    let componentScript = this.elementPool[componentID].getScript();
                    script += `${componentScript}\n\n`;
                });
            }
        });

        return script;
    }

    // recursively deletes all the children element when the parent element is deleted
    deleteElement(uid) {
        let children = this.childrenOf[uid];

        if (children !== undefined) {
            children.forEach(child => {
                this.deleteElement(child);
            });

            delete this.childrenOf[uid];
        }
                        
        document.getElementById(uid).remove();
        delete this.elementPool[uid];
    }
}

function saveScript() {
    const script = creator.generateScript();
    // store the script into localStorage
    localStorage.setItem('SGScript', script);
}

// TODO: remove handlers from js files (not necessarily this one)
// handle to be used by create_story page
let creator = new SGCreator();
