const PLAY_AREA_ID = 'play-area';
const SUBTYPE_STR = 'none'; // TODO: have to see how we can use this

let sceneUID = 1;
let choiceUID = 1;

let draggableMap = new Map();   // sceneID mapped to draggable { sceneID: draggable }
let lineMap = new Map();        // choiceID mapped to fromSceneID, toSceneID { choiceID: { fromSceneID: '', toSceneID: '' } }

/*****************************************************************************/

// Map of maps: entities to manage choices between scenes

/*
structure of Map of maps:

{
    fromSceneID: {
        toSceneID: {
            choices: [{
                choiceID: '',
                line: LeaderLine
            }, ...]
        }
    }
}
*/

let forwardChoiceMap = new Map();
let reverseChoiceMap = new Map();

// map of map utility function
function setValue(mapOfMap, key1, key2, value) {
    if (mapOfMap.has(key1)) {
        valueToSet = mapOfMap.get(key1);
        valueToSet.set(key2, value);
        mapOfMap.set(key1, valueToSet);    
        return true;
    }
    return false;
}

function getValue(mapOfMap, key1, key2) {
    if (mapOfMap.has(key1))
        return mapOfMap.get(key1).get(key2);
    return undefined;
}

function hasKey(mapOfMap, key1, key2) {
    return (mapOfMap.has(key1) && mapOfMap.get(key1).has(key2));
}

// TODO: support self choosing scenes

/*****************************************************************************/

// objects to hold details

let storyDetails = {
    name: 'story',
    id: 'story',
    description: '',
    startSceneID: ''
};
let sceneMap = new Map();
let choiceMap = new Map();

/*****************************************************************************/

// Component addition logic

// logic to handle removing and adding new leader lines when a draggable is moved
function handleLinesOnDrag(sceneID) {
    if (forwardChoiceMap.has(sceneID)) {
        for (let [toSceneID, value] of forwardChoiceMap.get(sceneID)) {
            let choices = value['choices'];
            let choicesWithNewLines = [];

            choices.forEach(element => {
                let oldLine = element['line'];
                if (oldLine) oldLine.remove();

                let newLine = new LeaderLine(
                    document.getElementById(sceneID), 
                    document.getElementById(toSceneID), 
                    {
                        endPlug: 'arrow3',
                        color: 'rgba(255, 56, 96, 0.5)'
                    }
                );
                
                choicesWithNewLines.push({
                    choiceID: element['choiceID'],
                    line: newLine
                });
            }); 

            if (getValue(forwardChoiceMap, sceneID, toSceneID)) {
                let prevForwardValue = getValue(forwardChoiceMap, sceneID, toSceneID);
                prevForwardValue['choices'] = choicesWithNewLines;
                setValue(forwardChoiceMap, sceneID, toSceneID, prevForwardValue);
            }

            if (getValue(reverseChoiceMap, toSceneID, sceneID)) {
                let prevReverseValue = getValue(reverseChoiceMap, toSceneID, sceneID);
                prevReverseValue['choices'] = choicesWithNewLines;
                setValue(reverseChoiceMap, toSceneID,sceneID, prevReverseValue);
            }
        }
    }

    if (reverseChoiceMap.has(sceneID)) {
        for (let [toSceneID, value] of reverseChoiceMap.get(sceneID)) {
            let choices = value['choices'];
            let choicesWithNewLines = [];

            choices.forEach(element => {
                let oldLine = element['line'];
                if (oldLine) oldLine.remove();

                let newLine = new LeaderLine(
                    document.getElementById(toSceneID), 
                    document.getElementById(sceneID), 
                    {
                        endPlug: 'arrow3',
                        color: 'rgba(255, 56, 96, 0.5)'
                    }
                );
                
                choicesWithNewLines.push({
                    choiceID: element['choiceID'],
                    line: newLine
                });
            }); 

            if (getValue(reverseChoiceMap, sceneID, toSceneID)) {
                let prevReverseValue = getValue(reverseChoiceMap, sceneID, toSceneID);
                prevReverseValue['choices'] = choicesWithNewLines;
                setValue(reverseChoiceMap, sceneID, toSceneID, prevReverseValue);
            }
            
            if (getValue(forwardChoiceMap, toSceneID, sceneID)) {
                let prevForwardValue = getValue(forwardChoiceMap, toSceneID, sceneID);
                prevForwardValue['choices'] = choicesWithNewLines;
                setValue(forwardChoiceMap, toSceneID,sceneID, prevForwardValue);
            }
        }
    }
}

function addScene() {
    let sceneID = `scene-${sceneUID}`;
    let sceneNode = document.createElement('div');
    
    sceneNode.id = sceneID;
    sceneNode.className = 'notification is-info node';
    sceneNode.style.margin = '2px';

    // Node content
    let nodeContent = document.createElement('div');
    nodeContent.id = sceneID + '-title';
    nodeContent.className = 'node-content content is-large';
    nodeContent.innerText = sceneID;

    // Open scene button
    let openButton = document.createElement('button');
    openButton.className = 'button is-info is-light is-small is-rounded';
    openButton.innerText = 'Edit';
    openButton.style.margin = '2px';
    openButton.onclick = function() {
        openSceneModal(sceneID);
    };

    // Choices button
    let choicesButton = document.createElement('button');
    choicesButton.className = 'button is-danger is-light is-small is-rounded';
    choicesButton.innerText = 'Choices';
    choicesButton.style.margin = '2px';
    choicesButton.onclick = function() {
        openEditChoicesForSceneModal(sceneID);
    }

    // delete button
    let deleteButton = document.createElement('button');
    deleteButton.className = 'delete is-small';
    deleteButton.style.margin = '2px';
    deleteButton.onclick = function() {
        deleteScene(sceneID);
    }
    
    // Append all the elements
    sceneNode.appendChild(nodeContent);
    sceneNode.appendChild(openButton);
    sceneNode.appendChild(choicesButton);
    sceneNode.appendChild(deleteButton);

    // append scene node into play area
    document.getElementById(PLAY_AREA_ID).appendChild(sceneNode);

    let draggable = new PlainDraggable(document.getElementById(sceneID));
    draggable.onMove = function(newPosition) {
        handleLinesOnDrag(sceneID);
    };

    draggableMap.set(sceneID, draggable);
    sceneMap.set(sceneID, {
        name: sceneID,
        id: sceneID,
        description: ""
    });

    sceneUID++;
}

function addChoice(fromSceneID, toSceneID) {
    let choiceID = `choice-${choiceUID}`;

    // TODO: replace this with a custom editable leader line
    let line = new LeaderLine(
        document.getElementById(fromSceneID), 
        document.getElementById(toSceneID), 
        {
            endPlug: 'arrow3',
            color: 'rgba(255, 56, 96, 0.5)'
        }
    );
    
    if (!forwardChoiceMap.has(fromSceneID))
        forwardChoiceMap.set(fromSceneID, new Map());
    if (!hasKey(forwardChoiceMap, fromSceneID, toSceneID)) {
        let value = {
            choices: []       
        };
        setValue(forwardChoiceMap, fromSceneID, toSceneID, value);
    }
    let choices = getValue(forwardChoiceMap, fromSceneID, toSceneID)['choices'];
    choices.push({
        choiceID: choiceID,
        line: line
    });
    setValue(forwardChoiceMap, fromSceneID, toSceneID, {
        choices: choices
    });

    if (!reverseChoiceMap.has(toSceneID))
        reverseChoiceMap.set(toSceneID, new Map());
    if (!hasKey(reverseChoiceMap, toSceneID,fromSceneID)) {
        let value = {
            choices: []
        };
        setValue(reverseChoiceMap, toSceneID, fromSceneID, value);
    }
    choices = getValue(reverseChoiceMap, toSceneID, fromSceneID)['choices'];
    choices.push({
        choiceID: choiceID,
        line: line
    });
    setValue(reverseChoiceMap, toSceneID, fromSceneID, {
        choices: choices
    });

    lineMap.set(choiceID, {
        fromSceneID: fromSceneID,
        toSceneID: toSceneID,
    });

    choiceMap.set(choiceID, {
        name: choiceID,
        id: choiceID,
        description: '',
        fromSceneID: fromSceneID,
        toSceneID: toSceneID
    });

    choiceUID++;
}

/*****************************************************************************/

// Componrnt deletion logic

function deleteScene(sceneID) {
    if (draggableMap.has(sceneID)) {
        // hide the element. this is done in order to not disturb other divs
        document.getElementById(sceneID).style.visibility = 'hidden';

        // deleting all forward choices
        if (forwardChoiceMap.has(sceneID)) {
            for (let [key, value] of forwardChoiceMap.get(sceneID)) {
                let choices = [... value['choices']];

                choices.forEach(element => {
                    let choiceID = element['choiceID'];
                    deleteChoice(choiceID);
                });
            }
            forwardChoiceMap.delete(sceneID);
        }

        // deleting all reverse choices
        if (reverseChoiceMap.has(sceneID)) {
            for (let [key, value] of reverseChoiceMap.get(sceneID)) {
                let choices = [... value['choices']];

                choices.forEach(element => {
                    let choiceID = element['choiceID'];
                    deleteChoice(choiceID);
                });
            }
            reverseChoiceMap.delete(sceneID);
        }

        // removing scene details
        if (sceneMap.has(sceneID))
            sceneMap.delete(sceneID);

        // removing draggable
        draggableMap.get(sceneID).remove();
        draggableMap.delete(sceneID);
    }
}

function deleteChoice(choiceID) {
    
    if (lineMap.has(choiceID)) {
        let fromSceneID = lineMap.get(choiceID)['fromSceneID'];
        let toSceneID = lineMap.get(choiceID)['toSceneID'];

        // forward line
        if (hasKey(forwardChoiceMap, fromSceneID, toSceneID) && getValue(forwardChoiceMap, fromSceneID, toSceneID)) {
            let choices = getValue(forwardChoiceMap, fromSceneID, toSceneID)['choices'];

            if (choices.length > 0) {
                let found = false;
                for (let index = 0; index < choices.length; index++) {
                    if (choices[index]['choiceID'] === choiceID) {
                        found = true;

                        // removing line
                        let line = choices[index]['line'];
                        line.remove();

                        // swapping with last element
                        let temp = choices[index];
                        choices[index] = choices[choices.length - 1];
                        choices[choices.length - 1] = temp;

                        break;
                    }
                }

                if (found) {
                    // remove the last element
                    choices.pop();
                }
                
                if (choices.length == 0) {
                    let value = forwardChoiceMap.get(fromSceneID);
                    value.delete(toSceneID);
                    forwardChoiceMap.set(fromSceneID, value);
                }
                else {
                    let value = {
                        choices: choices
                    };
                    setValue(forwardChoiceMap, fromSceneID, toSceneID, value);
                }
            }
        }

        // Reverse line
        if (hasKey(reverseChoiceMap, toSceneID, fromSceneID) && getValue(reverseChoiceMap,toSceneID, fromSceneID)) {
            let choices = getValue(reverseChoiceMap, toSceneID, fromSceneID)['choices'];

            if (choices.length > 0) {
                let found = false;
                for (let index = 0; index < choices.length; index++) {
                    if (choices[index]['choiceID'] === choiceID) {
                        found = true;

                        // if line exists, its already removed in forwardChoice map iteration

                        // swapping with last element
                        let temp = choices[index];
                        choices[index] = choices[choices.length - 1];
                        choices[choices.length - 1] = temp;

                        break;
                    }
                }

                if (found) {
                    // remove the last element
                    choices.pop();
                }
                
                if (choices.length == 0) {
                    let value = reverseChoiceMap.get(toSceneID);
                    value.delete(fromSceneID);
                    reverseChoiceMap.set(toSceneID, value);
                }
                else {
                    let value = {
                        choices: choices
                    };
                    setValue(reverseChoiceMap, toSceneID, fromSceneID, value);
                }
            }
        }

        // removing from choiceMap
        if (choiceMap.has(choiceID))
            choiceMap.delete(choiceID);

        // removing from line Map
        lineMap.delete(choiceID);
    }
}

/*****************************************************************************/

// Modal code


// Scene Modal: Edit a Scene

function openSceneModal(sceneID) {
    if (sceneMap.has(sceneID)) {
        // components
        let sceneModalTitle = document.getElementById('scene-modal-title');
        let sceneModalBody = document.getElementById('scene-modal-body');
        let sceneModalFooter = document.getElementById('scene-modal-footer');

        let sceneComponentTitle = document.getElementById(`${sceneID}-title`);

        let sceneNameDiv = document.getElementById('scene-name');
        let sceneIDDiv = document.getElementById('scene-id');
        let sceneDescriptionDiv = document.getElementById('scene-description');

        // fetching details
        sceneDetails = sceneMap.get(sceneID);

        // filling scene details
        sceneModalTitle.innerText = sceneDetails['name'];
        sceneNameDiv.value = sceneDetails['name'];
        sceneIDDiv.innerText = sceneDetails['id'];
        sceneDescriptionDiv.value = sceneDetails['description'];

        // save details
        let saveButton = document.createElement('button');
        saveButton.id = 'save-scene-details-button';
        saveButton.className = 'button is-info';
        saveButton.innerText = 'Save Details';
        saveButton.onclick = function() {
            let updatedDetails = {
                name: sceneNameDiv.value,
                id: sceneIDDiv.innerText,
                description: sceneDescriptionDiv.value
            };
            sceneMap.set(sceneID, updatedDetails);

            // setting text of scene
            sceneComponentTitle.innerText = updatedDetails['name'];

            closeSceneModal();
        };

        sceneModalFooter.innerHTML = '';
        sceneModalFooter.appendChild(saveButton);

        // data set, toggle display on
        let modal = document.getElementById('scene-modal');
        modal.style.display = 'block';
    }
}

function closeSceneModal() {
    let modal = document.getElementById('scene-modal');
    modal.style.display = 'none';
}


// Choice Modal: Edit a Choice

function openChoiceModal(choiceID) {
    if (choiceMap.has(choiceID)) {
        // components
        let choiceModalTitle = document.getElementById('choice-modal-title');
        let choiceModalBody = document.getElementById('choice-modal-body');
        let choiceModalFooter = document.getElementById('choice-modal-footer');

        let choiceNameDiv = document.getElementById('choice-name');
        let choiceIDDiv = document.getElementById('choice-id'); // this is a tag
        let choiceDescriptionDiv = document.getElementById('choice-description');
        let choiceFromSceneIDDiv = document.getElementById('choice-from-scene-id');
        let choiceToSceneIDDiv = document.getElementById('choice-to-scene-id');
        let choiceFromSceneNameDiv = document.getElementById('choice-from-scene-name');
        let choiceToSceneNameDiv = document.getElementById('choice-to-scene-name');

        // get and set data
        let details = choiceMap.get(choiceID);
        let fromSceneID = details['fromSceneID'];
        let toSceneID = details['toSceneID'];

        choiceModalTitle.innerText = details['name'];
        choiceNameDiv.value = details['name'];
        choiceIDDiv.innerText = details['id'];
        choiceFromSceneIDDiv.innerText = fromSceneID;
        choiceToSceneIDDiv.innerText = toSceneID;
        choiceFromSceneNameDiv.innerText = sceneMap.get(fromSceneID)['name'];
        choiceToSceneNameDiv.innerText = sceneMap.get(toSceneID)['name'];

        choiceDescriptionDiv.value = details['description'];

        // save button
        let saveButton = document.createElement('button');
        saveButton.id = 'save-choice-details-button';
        saveButton.className = 'button is-danger';
        saveButton.innerText = 'Save Details';
        saveButton.onclick = function() {
            
            let updatedDetails = {
                name: choiceNameDiv.value,
                id: choiceIDDiv.innerText,
                description: choiceDescriptionDiv.value,
                fromSceneID: choiceFromSceneIDDiv.innerText,
                toSceneID: choiceToSceneIDDiv.innerText
            };

            choiceMap.set(choiceID, updatedDetails);

            closeChoiceModal();
        };

        choiceModalFooter.innerHTML = '';
        choiceModalFooter.appendChild(saveButton);

        // toggle the display on
        let modal = document.getElementById('choice-modal');
        modal.style.display = 'block';
    }
}

function closeChoiceModal() {
    let fromSceneID = document.getElementById('choice-from-scene-name').innerText;

    let modal = document.getElementById('choice-modal');
    modal.style.display = 'none';

    // this should open back the edit choice modal of scene
    openEditChoicesForSceneModal(fromSceneID);
}


// Add Choice Modal: Create a new choice (TODO: see if this can be done using draggables)

// function to fill drop downs of add-choice-modal
function fillSceneSelectOptions() {
    let optionsStr = '';

    for (let [key,value] of sceneMap) {
        let value = document.getElementById(key + '-title').innerText;
        optionsStr += `<option value="${key}">${value}</option>`;
    }

    let fromSceneSelectElem = document.getElementById('from-scene-select-options');
    fromSceneSelectElem.innerHTML = optionsStr;

    let toSceneSelectElem = document.getElementById('to-scene-select-options');
    toSceneSelectElem.innerHTML = optionsStr;
}

function openAddChoiceModal() {
    // Components
    let choiceModalTitle = document.getElementById('add-choice-modal-title');
    let choiceModalBody = document.getElementById('add-choice-modal-body');
    let choiceModalFooter = document.getElementById('add-choice-modal-footer');

    let choiceNameDiv = document.getElementById('new-choice-name');
    let choiceIDDiv = document.getElementById('new-choice-id'); // this is a tag
    let choiceDescriptionDiv = document.getElementById('new-choice-description');
    let choiceFromSceneSelectionDiv = document.getElementById('from-scene-select-options');
    let choiceToSceneSelectionDiv = document.getElementById('to-scene-select-options');

    // set data
    let choiceID = `choice-${choiceUID}`;

    choiceNameDiv.value = choiceID;
    choiceIDDiv.innerText = choiceID;
    choiceDescriptionDiv.value = '';

    fillSceneSelectOptions();

    // add choice button
    let addChoiceButton = document.createElement('button');
    addChoiceButton.id = 'add-choice-button';
    addChoiceButton.className = 'button is-danger';
    addChoiceButton.innerText = 'Add Choice';
    addChoiceButton.onclick = function() {
        let fromSceneID = choiceFromSceneSelectionDiv.selectedOptions[0].value;
        let toSceneID = choiceToSceneSelectionDiv.selectedOptions[0].value;
        
        addChoice(fromSceneID, toSceneID);
        
        // update choice details
        let choiceID = choiceIDDiv.innerText;

        let details = choiceMap.get(choiceID);
        details['name'] = choiceNameDiv.value;
        details['description'] = choiceDescriptionDiv.value;

        choiceMap.set(choiceID, details);

        closeAddChoiceModal();
    };

    choiceModalFooter.innerHTML = '';
    choiceModalFooter.appendChild(addChoiceButton)

    let modal = document.getElementById('add-choice-modal');
    modal.style.display = 'block';
}

function closeAddChoiceModal() {
    let modal = document.getElementById('add-choice-modal');
    modal.style.display = 'none';
}


// Edit Choices for Scene Modal: manage all the choice belonging to a scene

function openEditChoicesForSceneModal(sceneID) {
    if (sceneMap.has(sceneID)) {
        // components
        let modalTitle = document.getElementById('edit-choices-for-scene-modal-title');
        let modalBody = document.getElementById('edit-choices-for-scene-modal-body');
        let modalFooter = document.getElementById('edit-choices-for-scene-modal-footer');

        // set the title
        let sceneName = sceneMap.get(sceneID)['name'];
        modalTitle.innerText = `${sceneName} choices`;
        modalBody.innerHTML = '';

        // display all the forward choices with edit and delete options
        let choiceCount = 0;

        if (forwardChoiceMap.has(sceneID)) {
            for (let [key, value] of forwardChoiceMap.get(sceneID)) {
                let choices = value['choices'];

                for (let choice of choices) {
                    let choiceID = choice['choiceID'];

                    if (choiceMap.has(choiceID)) {
                        let choiceDetails = choiceMap.get(choiceID);
                        
                        const id = choiceDetails['id'];
                        const name = choiceDetails['name'];
                        const description = choiceDetails['description'];
                        const toSceneID = choiceDetails['toSceneID'];
                        const toSceneName = sceneMap.get(toSceneID)['name'];

                        // create a div and append
                        let choiceDiv = document.createElement('div');
                        choiceDiv.className = 'notification is-light is-danger'

                        let content = `
                        <div class='level'>
                            <div class='level-left'>
                                <div class='tags has-addons'>
                                    <span class='tag is-danger is-rounded'>${id}</span>
                                    <span class='tag is-white is-rounded'>${name}</span>
                                </div>
                            </div>
                            <div class='level-right'>
                                <div class='button level-item is-small is-rounded' id='${choiceID + '-edit-button'}'>Edit</div>
                                <div class='button level-item is-small is-rounded' id='${choiceID + '-delete-button'}'>Delete</div>
                            </div>
                        </div>
                        <div class='level'>
                            <div class='level-left'>
                                <strong>To Scene ID:</strong>
                                <div class="tags has-addons" style="margin-left: 15px;">
                                    <span class="tag is-rounded is-info">${toSceneID}</span>
                                    <span class="tag is-rounded is-white">${toSceneName}</span>
                                </div>
                            </div>
                        </div>
                        <div class='notification is-light is-danger has-text-centered'>
                        ${(description === '')?'No description for the choice':description}
                        </div>
                        `;
                        
                        choiceDiv.innerHTML = content;

                        modalBody.appendChild(choiceDiv);

                        let editButton = document.getElementById((choiceID + '-edit-button'));
                        editButton.onclick = function() {
                            closeEditChoicesForSceneModal();
                            openChoiceModal(choiceID);
                        };

                        let deleteButton = document.getElementById((choiceID + '-delete-button'));
                        deleteButton.onclick = function() {
                            closeEditChoicesForSceneModal();
                            deleteChoice(choiceID);
                            openEditChoicesForSceneModal(sceneID);
                        };

                        choiceCount++;
                    }
                }
            }
        }

        if (choiceCount == 0)
            modalBody.innerHTML = `<div class="notification is-light is-danger">No <strong>choices</strong> are associated with this scene.</div>`;

        let modal = document.getElementById('edit-choices-for-scene-modal');
        modal.style.display = 'block';
    }
}

function closeEditChoicesForSceneModal() {
    let modal = document.getElementById('edit-choices-for-scene-modal');
    modal.style.display = 'none';
}

// Script modal: (temporary)

// function to generate script
function generateScript() {
    // iterate through detail maps and construct the script
    // TODO: add details about positions, in order to rebuild the story board
    
    // build order: ['story', 'scenes', 'choices', 'effects', 'conditions', 'attributes']

    let script = {};

    // story-details
    script['story'] = storyDetails;

    // scenes
    script['scenes'] = [];
    for (let scene of sceneMap.values())
        script['scenes'].push(scene);

    // choices
    script['choices'] = [];
    for (let choice of choiceMap.values())
        script['choices'].push(choice);
    
    return JSON.stringify(script, null, 2);
}

function openScriptModal() {
    // Components
    let modalTitle = document.getElementById('script-modal-title');
    let modalBody = document.getElementById('script-modal-body');
    let modalFooter = document.getElementById('script-modal-footer');

    let scriptContainer = document.getElementById('script-container');

    // set content
    scriptContainer.innerText = generateScript();

    // save story button
    // TODO: error evaluation
    // save details
    let saveButton = document.createElement('button');
    saveButton.id = 'save-story-script-button';
    saveButton.className = 'button is-success';
    saveButton.innerText = 'Save Story';
    saveButton.onclick = function() {
        // save into local storage
        window.localStorage.setItem('story_graph_story', scriptContainer.innerText);
        closeScriptModal();
    };

    modalFooter.innerHTML = '';
    modalFooter.appendChild(saveButton);

    // toggle on the display
    let modal = document.getElementById('script-modal');
    modal.style.display = 'block';
}

function closeScriptModal() {
    let modal = document.getElementById('script-modal');
    modal.style.display = 'none';
}

// Story modal: edit details of the story

function fillStartSceneSelectOptions(startSceneID) {
    let optionsStr = '';

    for (let [key,value] of sceneMap) {
        let value = document.getElementById(key + '-title').innerText;
        optionsStr += `<option value="${key}">${value}</option>`;
    }

    let startSceneSelectElem = document.getElementById('start-scene-select-options');
    startSceneSelectElem.innerHTML = optionsStr;

    // TODO handle deleted start scene case
    if (startSceneID !== '') {
        let options = startSceneSelectElem.options;

        for (let i = 0; i < options.length; i++) {
            if (options[i]['value'] === startSceneID) {
                options[i].selected = true;
                break;
            }
        }
    }
}

function openStoryModal() {
    // components
    let modalTitle = document.getElementById('story-modal-title');
    let modalBody = document.getElementById('story-modal-body');
    let modalFooter = document.getElementById('story-modal-footer');

    let storyNameDiv = document.getElementById('story-name');
    let storyIDDiv = document.getElementById('story-id');
    let storyDescriptionDiv = document.getElementById('story-description');
    let storyStartSceneSelectionDiv = document.getElementById('start-scene-select-options');

    // filling scene details
    storyNameDiv.value = storyDetails['name'];
    storyIDDiv.innerText = storyDetails['id'];
    storyDescriptionDiv.value = storyDetails['description'];

    fillStartSceneSelectOptions(storyDetails['startSceneID']);

    // save details
    let saveButton = document.createElement('button');
    saveButton.id = 'save-story-details-button';
    saveButton.className = 'button is-warning';
    saveButton.innerText = 'Save Details';
    saveButton.onclick = function() {
        storyDetails = {
            name: storyNameDiv.value,
            id: storyIDDiv.innerText,
            description: storyDescriptionDiv.value,
            startSceneID: storyStartSceneSelectionDiv.selectedOptions[0].value
        };

        closeStoryModal();
    };

    modalFooter.innerHTML = '';
    modalFooter.appendChild(saveButton);

    // toggle on the display
    let modal = document.getElementById('story-modal');
    modal.style.display = 'block';
}

function closeStoryModal() {
    let modal = document.getElementById('story-modal');
    modal.style.display = 'none';
}
