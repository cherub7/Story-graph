
/**************************************************
 * Value
 **************************************************/

class SGValue {
    constructor(value, type) {
        if ((typeof(value) == type) ||
            (value.isEntity === true && value.getAttributeValue('type') === type))
        {
            this.value = value;
            this.valueType = type;
        }
        else 
        {
            throw new Error("value of wrong type passed");
        }
    }

    modify(op, newValue, newType) {
        let modifiedValue = newValue;
        if (op !== '=')
            modifiedValue = eval(`${this.value} ${op} ${newValue};`);
        return new SGValue(modifiedValue, newType);
    }
}

/**************************************************
 * Collections: to store group of items
 **************************************************/

class SGUnorderedCollection {
    constructor(itemType) {
        this.dictionary = {};
        this.itemType = itemType;
    }

    getValueForKey(key) {
        if (!this.doesContainKey(key))
            throw new Error(`${this.itemType} to be accessed does not exist`);        

        return this.dictionary[key].value;
    }

    getValueObjectForKey(key) {
        if (!this.doesContainKey(key))
            throw new Error(`${this.itemType} to be accessed does not exist`);        

        return this.dictionary[key];
    }

    getKeys() {
        return Object.keys(this.dictionary);
    }

    doesContainKey(key) {
        return this.getKeys().includes(key);
    }

    addValueForKey(key, value, type) {
        if (this.doesContainKey(key))
            throw new Error(`${this.itemType} with the same name is being created again`);

        let valueObject = new SGValue(value, type);
        this.dictionary[key] = valueObject;
    }

    editValueForKey(key, value, type) {
        if (!this.doesContainKey(key))
            throw new Error(`${this.itemType} to be accessed does not exist`);

        let valueObject = new SGValue(value, type);
        this.dictionary[key] = valueObject;
    }

    removeKey(key) {
        if (!this.doesContainKey(key))
            throw new Error(`${this.itemType} to be removed does not exist`);

        delete this.dictionary[key];
    }
}

class SGOrderedCollection extends SGUnorderedCollection {
    constructor() {
        // array to maintain the order in which keys are sored
        super();
        this.keys = [];
    }

    getKeys() {
        return this.keys;
    }

    addValueForKey(key, value, type) {
        super.addValueForKey(key, value, type);
        this.keys.push(key);
    }

    removeKey(key) {
        super.removeKey(key);
        this.keys.splice(this.keys.indexOf(key), 1);
    }
}

// For a Stack object, an Array() object would do fine for now

/**************************************************
 * Entity: An object in the story
 **************************************************/

class SGEntity {
    constructor(id, name, type, subtype='None', description='None') {
        this.id = id;
        this.attributes = new SGUnorderedCollection('entity');
        this.isEntity = true;

        this.addDefaultAttributes(name, type, subtype, description);
    }

    addDefaultAttributes(name, type, subtype, description) {
        this.attributes.addValueForKey('name', name, 'string');
        this.attributes.addValueForKey('type', type, 'string');
        this.attributes.addValueForKey('sub-type', subtype, 'string');
        this.attributes.addValueForKey('description', description, 'string');
    }

    getAttributeValue(attributeName) {
        return this.attributes.getValueForKey(attributeName);
    }
}

class SGObject extends SGEntity {
    constructor(id, name, subtype, description) {
        super(id, name, 'object', subtype, description);
    }
}

/**************************************************
 * Condition
 **************************************************/

class SGCondition extends SGEntity {
    constructor(id, entityID, attributeName, op, value) {
        super(id, 'None', 'condition', 'None', 'None');
        this.addAdditionalDefaultAttributes(entityID, attributeName, op, value);
    }
    
    addAdditionalDefaultAttributes(entityID, attributeName, op, value) {
        this.attributes.addValueForKey('entityID', entityID, 'string');
        this.attributes.addValueForKey('attributeName', attributeName, 'string');
        this.attributes.addValueForKey('op', op, 'string');
        this.attributes.addValueForKey('value', value, typeof(value));
    }

    evaluate(story) {
        const entityID = this.attributes.getValueForKey('entityID');
        const attributeName = this.attributes.getValueForKey('attributeName');
        const op = this.attributes.getValueForKey('op');
        const value = this.attributes.getValueForKey('value');
        
        // NOTE: if eval's performance is expensive, we can resort to using switch case
        return eval(`${story.getEntity(entityID).getAttributeValue(attributeName)} ${op} ${value};`);
    }
}

/**************************************************
 * Effect: a change in attribute of an entity
 **************************************************/

class SGEffect extends SGEntity {
    constructor(id, entityID, attributeName, op, newValue, newType) {
        super(id, 'None', 'effect', 'None', 'None');
        this.addAdditionalDefaultAttributes(entityID, attributeName, op, newValue, newType);
        this.undoStack = [];
    }

    addAdditionalDefaultAttributes(entityID, attributeName, op, newValue, newType) {
        this.attributes.addValueForKey('entityID', entityID, 'string');
        this.attributes.addValueForKey('attributeName', attributeName, 'string');
        this.attributes.addValueForKey('op', op, 'string');
        this.attributes.addValueForKey('newValue', newValue, newType);
        this.attributes.addValueForKey('newType', newType, 'string');

        this.attributes.addValueForKey('conditions', new SGUnorderedCollection('string'), 'object');
    }

    evaluateConditions(story) {
        let canPerform = true;
        let conditionIDs = this.getConditionIDs();

        conditionIDs.forEach(conditionID => {
            canPerform = (canPerform && story.getCondition(conditionID).evaluate(story));
        });

        return canPerform;
    }

    perform(story) {
        let entityID = this.attributes.getValueForKey('entityID');
        let attributeName = this.attributes.getValueForKey('attributeName');
        let op = this.attributes.getValueForKey('op');
        let newValue = this.attributes.getValueForKey('newValue');
        let newType = this.attributes.getValueForKey('newType');

        const prevValue = story.getEntity(entityID).attributes.getValueObjectForKey(attributeName);
        this.undoStack.push(prevValue);

        if (this.evaluateConditions(story)) {
            story.getEntity(entityID).attributes.editValueForKey(attributeName, prevValue.modify(op, newValue, newType).value, newType);
        }
    }

    undo(story) {
        let entityID = this.attributes.getValueForKey('entityID');
        let attributeName = this.attributes.getValueForKey('attributeName');

        const originalValue = this.undoStack.pop();
        story.getEntity(entityID).attributes.editValueForKey(attributeName, originalValue.value, originalValue.valueType);
    }

    addConditionID(conditionID) {
        this.getAttributeValue('conditions').addValueForKey(conditionID, conditionID, 'string');
    }

    getConditionIDs() {
        return this.getAttributeValue('conditions').getKeys();
    }
}

/***************************************************
 * Choice: an option with consequences
 **************************************************/

class SGChoice extends SGEntity {
    constructor(id, name, subtype, description, nextSceneID) {
        super(id, name, 'choice', subtype, description);
        this.addAdditionalDefaultAttributes(nextSceneID);
    }

    addAdditionalDefaultAttributes(nextSceneID) {
        this.attributes.addValueForKey('nextSceneID', nextSceneID, 'string');
        this.attributes.addValueForKey('onSelectionEffects', new SGOrderedCollection('string'), 'object');
        this.attributes.addValueForKey('onRejectionEffects', new SGOrderedCollection('string'), 'object');
    }

    addEffectID(effectID, effectTypeName) {
        this.getAttributeValue(effectTypeName).addValueForKey(effectID, effectID, 'string');
    }

    getOnSelectionEffectIDs() {
        return this.getAttributeValue('onSelectionEffects').getKeys();
    }

    getOnRejectionEffectIDs() {
        return this.getAttributeValue('onRejectionEffects').getKeys();
    }
}

/**************************************************
 * Scene: A decision node in the story
 **************************************************/

class SGScene extends SGEntity {
    constructor(id, name, subtype, description) {
        super(id, name, 'scene', subtype, description);
        this.addAdditionalDefaultAttributes();
    }

    addAdditionalDefaultAttributes() {
        this.attributes.addValueForKey('choices', new SGOrderedCollection('choice'), 'object');
        this.attributes.addValueForKey('onEntryEffects', new SGOrderedCollection('string'), 'object');
        this.attributes.addValueForKey('onExitEffects', new SGOrderedCollection('string'), 'object');
    }

    addChoiceID(choiceID) {
        this.getAttributeValue('choices').addValueForKey(choiceID, choiceID, 'string');
    }

    addEffectID(effectID, effectTypeName) {
        this.getAttributeValue(effectTypeName).addValueForKey(effectID, effectID, 'string');
    }

    // performs all the entry effects
    performEntryEffects(story) {
        let effectIDs = this.getOnEntryEffectIDs();
        effectIDs.forEach(effectID => { story.getEffect(effectID).perform(story); });
    }

    // undoes all the entry effects
    undoEntryEffects(story) {
        let effectIDs = this.getOnEntryEffectIDs();
        effectIDs.forEach(effectID => { story.getEffect(effectID).undo(story); });
    }

    // performs all the exit effects
    performExitEffects(story) {
        let effectIDs = this.getOnExitEffectIDs();
        effectIDs.forEach(effectID => { story.getEffect(effectID).perform(story); });
    }

    // undoes all the exit effects
    undoExitEffects(story) {
        let effectIDs = this.getOnExitEffectIDs();
        effectIDs.forEach(effectID => { story.getEffect(effectID).undo(story); });
    }

    // performs all the effects on choice selection
    performOnChoiceSelectionEffects(story, selectedChoiceID) {
        this.getChoiceIDs().forEach(choiceID => {
            if (choiceID == selectedChoiceID)
                story.getChoice(choiceID).getOnSelectionEffectIDs().forEach(effectID => { story.getEffect(effectID).perform(story); });
            else
                story.getChoice(choiceID).getOnRejectionEffectIDs().forEach(effectID => { story.getEffect(effectID).perform(story); });
        });
    }

    // undoes all the effects on choice selection
    undoOnChoiceSelectionEffects(story, selectedChoiceID) {
        this.getChoiceIDs().forEach(choiceID => {
            if (choiceID == selectedChoiceID)
                story.getChoice(choiceID).getOnSelectionEffectIDs().forEach(effectID => { story.getEffect(effectID).undo(story); });
            else
                story.getChoice(choiceID).getOnRejectionEffectIDs().forEach(effectID => { story.getEffect(effectID).undo(story); });
        });
    }

    // undoes all the effects
    undoAllEffects(story, selectedChoiceId) {
        this.undoExitEffects(story);
        this.undoOnChoiceSelectionEffects(story, selectedChoiceId);
        this.undoEntryEffects(story);
    }

    // returns an array of ids of all the choices of this scene
    getChoiceIDs() {
        return this.getAttributeValue('choices').getKeys();
    }

    // returns an array of ids of all the onEntryEffects of this scene
    getOnEntryEffectIDs() {
        return this.getAttributeValue('onEntryEffects').getKeys();
    }

    // returns an array of ids of all the onExitEffects of this scene
    getOnExitEffectIDs() {
        return this.getAttributeValue('onExitEffects').getKeys();
    }
}

/**************************************************
 * Story: collection of scenes
 **************************************************/

class SGStory extends SGEntity {
    constructor(id, name, subtype, description) {
        super(id, name, 'story', subtype, description);
        this.addAdditionalDefaultAttributes();
    }

    addAdditionalDefaultAttributes() {
        this.attributes.addValueForKey('startSceneID', 'start', 'string');
        this.attributes.addValueForKey('entities', new SGUnorderedCollection('entity'), 'object');
    }

    // entity adders: add an entity into story
    addAttribute(entityID, attributeName, value, type) {
        let entity = this.getEntity(entityID, 'None');
        entity.attributes.addValueForKey(attributeName, value, type);
    }

    addScene(sceneID, name, subtype, description) {
        let newScene = new SGScene(sceneID, name, subtype, description);
        this.getAttributeValue('entities').addValueForKey(sceneID, newScene, 'scene');
    }

    addChoice(choiceID, name, subtype, description, forSceneID, nextSceneID) {
        this.getScene(forSceneID).addChoiceID(choiceID);

        let newChoice = new SGChoice(choiceID, name, subtype, description, nextSceneID);
        this.getAttributeValue('entities').addValueForKey(choiceID, newChoice, 'choice');
    }

    addEffect(effectID, effectedEntityID, effectTypeName, entityID, attributeName, op, newValue, newType) {
        let entity = this.getEntity(effectedEntityID);

        entity.addEffectID(effectID, effectTypeName);

        let newEffect = new SGEffect(effectID, entityID, attributeName, op, newValue, newType);
        this.getAttributeValue('entities').addValueForKey(effectID, newEffect, 'effect');
    }

    addCondition(conditionID, effectID, entityID, attributeName, opString, value) {
        let effect = this.getEffect(effectID);

        effect.addConditionID(conditionID);

        let newCondition = new SGCondition(conditionID, entityID, attributeName, opString, value);
        this.getAttributeValue('entities').addValueForKey(conditionID, newCondition, 'condition');
    }

    // entity getters: gets requested entity
    getEntity(entityID, requiredType='None') {
        if (!this.getAttributeValue('entities').doesContainKey(entityID))
            throw new Error("entity to be fetched does not exist");

        let entityObject = this.getAttributeValue('entities').getValueObjectForKey(entityID);

        if (requiredType !== 'None' && entityObject.valueType !== requiredType)
            throw new Error(`entity is of the type ${entityObject.valueType} but you require entity of type ${requiredType}`);

        return entityObject.value;
    }

    getScene(sceneID) {
        return this.getEntity(sceneID, 'scene');
    }

    getChoice(choiceID) {
        return this.getEntity(choiceID, 'choice');
    }

    getEffect(effectID) {
        return this.getEntity(effectID, 'effect');
    }

    getCondition(conditionID) {
        return this.getEntity(conditionID, 'condition');
    }
}
