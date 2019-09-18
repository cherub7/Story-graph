
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
        return eval(`${story.getAttributeValue('entities').getValueForKey(entityID).getAttributeValue(attributeName)} ${op} ${value};`);
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

        this.attributes.addValueForKey('conditions', new SGUnorderedCollection('condition'), 'object');
    }

    evaluateConditions(story) {
        let canPerform = true;
        let conditions = this.attributes.getValueForKey('conditions');
        let conditionIds = conditions.getKeys();

        conditionIds.forEach(conditionId => {
            canPerform = (canPerform && conditions.getValueForKey(conditionId).evaluate(story));
        });

        return canPerform;
    }

    perform(story) {
        let entityID = this.attributes.getValueForKey('entityID');
        let attributeName = this.attributes.getValueForKey('attributeName');
        let op = this.attributes.getValueForKey('op');
        let newValue = this.attributes.getValueForKey('newValue');
        let newType = this.attributes.getValueForKey('newType');

        const prevValue = story.getAttributeValue('entities').getValueForKey(entityID).attributes.getValueObjectForKey(attributeName);
        this.undoStack.push(prevValue);

        if (this.evaluateConditions(story)) {
            story.getAttributeValue('entities').getValueForKey(entityID).attributes.editValueForKey(attributeName, prevValue.modify(op, newValue, newType).value, newType);
        }
    }

    undo(story) {
        let entityID = this.attributes.getValueForKey('entityID');
        let attributeName = this.attributes.getValueForKey('attributeName');

        const originalValue = this.undoStack.pop();
        story.getAttributeValue('entities').getValueForKey(entityID).attributes.editValueForKey(attributeName, originalValue.value, originalValue.valueType);
    }

    addCondition(id, entityID, attributeName, opString, value) {
        let condition = new SGCondition(id, entityID, attributeName, opString, value);
        this.getAttributeValue('conditions').addValueForKey(id, condition, 'condition');
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
        this.attributes.addValueForKey('onSelectionEffects', new Array(), 'object');
        this.attributes.addValueForKey('onRejectionEffects', new Array(), 'object');
    }

    addSelectionEffect(id, entityID, attributeName, newValue, newType) {
        let effect = new Effect(id, entityID, attributeName, newValue, newType);
        this.attributes.getAttributeValue('onSelectionEffects').push(effect);
    }

    addRejectionEffect(id, entityID, attributeName, newValue, newType) {
        let effect = new Effect(id, entityID, attributeName, newValue, newType);
        this.attributes.getAttributeValue('onRejectionEffects').push(effect);
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
        this.attributes.addValueForKey('onEntryEffects', new SGOrderedCollection('effect'), 'object');
        this.attributes.addValueForKey('onExitEffects', new SGOrderedCollection('effect'), 'object');
    }

    addChoiceID(choiceID) {
        this.getAttributeValue('choices').addValueForKey(choiceID, choiceID, 'string');
    }

    // performs all the entry effects
    performEntryEffects(story) {
        let effects = this.getAttributeValue('onEntryEffects');
        let effectKeys = effects.getKeys();

        effectKeys.forEach(effectKey => { effects.getValueForKey(effectKey).perform(story); });
    }

    // undoes all the entry effects
    undoEntryEffects(story) {
        let effects = this.getAttributeValue('onEntryEffects');
        let effectKeys = effects.getKeys();

        effectKeys.forEach(effectKey => { effects.getValueForKey(effectKey).undo(story); }); 
    }

    // performs all the exit effects
    performExitEffects(story) {
        let effects = this.getAttributeValue('onExitEffects');
        let effectKeys = effects.getKeys();

        effectKeys.forEach(effectKey => { effects.getValueForKey(effectKey).perform(story); });
    }

    // undoes all the exit effects
    undoExitEffects(story) {
        let effects = this.getAttributeValue('onExitEffects');
        let effectKeys = effects.getKeys();

        effectKeys.forEach(effectKey => { effects.getValueForKey(effectKey).undo(story); });
    }

    // performs all the effects on choice selection
    performOnChoiceSelectionEffects(story, selectedChoiceID) {
        this.getChoiceIDs().forEach(choiceID => {
            if (choiceID == selectedChoiceID)
                story.getChoice(choiceID).getAttributeValue('onSelectionEffects').forEach(effect => { effect.perform(story); });
            else
                story.getChoice(choiceID).getAttributeValue('onSelectionEffects').forEach(effect => { effect.perform(story); });
        });
    }

    // undoes all the effects on choice selection
    undoOnChoiceSelectionEffects(story, selectedChoiceID) {
        this.getChoiceIDs().forEach(choiceID => {
            if (choiceID == selectedChoiceID)
                story.getChoice(choiceID).getAttributeValue('onSelectionEffects').forEach(effect => { effect.undo(); });
            else
                story.getChoice(choiceID).getAttributeValue('onSelectionEffects').forEach(effect => { effect.undo(); });
        });
    }

    // undoes all the effects
    undoAllEffects(story, selectedChoiceId) {
        this.undoExitEffects(story);
        this.undoOnChoiceSelectionEffects(story, selectedChoiceId);
        this.undoEntryEffects(story);
    }

    // returns an array of ids of all the choices of a particular scene
    getChoiceIDs() {
        return this.getAttributeValue('choices').getKeys();
    }

    addOnEntryEffect(id, entityID, attributeName, op, newValue, newType) {
        let effect = new SGEffect(id, entityID, attributeName, op, newValue, newType);
        this.getAttributeValue('onEntryEffects').addValueForKey(id, effect, 'effect');
    }

    addOnExitEffect(id, entityID, attributeName, op, newValue, newType) {
        let effect = new SGEffect(id, entityID, attributeName, op, newValue, newType);
        this.getAttributeValue('onExitEffects').addValueForKey(id, effect, 'effect');
    }

    // returns the corresponding entry effect for the given id
    getOnEntryEffect(effectID) {
        if (!this.getAttributeValue('onEntryEffects').doesContainKey(effectID))
            throw new Error("entry effect to be fetched does not exist");
    
        let entityObject = this.getAttributeValue('onEntryEffects').getValueObjectForKey(effectID);

        if (entityObject.valueType !== 'effect')
            throw new Error("effect ID sent doesn't correspond to a SGEffect object");

        return entityObject.value;
    }

    // returns the corresponding exit effect for the given id
    getOnExitEffect(effectID) {
        if (!this.getAttributeValue('onExitEffects').doesContainKey(effectID))
            throw new Error("exit effect to be fetched does not exist");
    
        let entityObject = this.getAttributeValue('onExitEffects').getValueObjectForKey(effectID);

        if (entityObject.valueType !== 'effect')
            throw new Error("effect ID sent doesn't correspond to a SGEffect object");

        return entityObject.value;
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
    addScene(sceneID, name, subtype, description) {
        let newScene = new SGScene(sceneID, name, subtype, description);
        this.getAttributeValue('entities').addValueForKey(sceneID, newScene, 'scene');
    }

    addChoice(choiceID, name, subtype, description, forSceneID, nextSceneID) {
        story.getScene(forSceneID).addChoiceID(choiceID);

        let newChoice = new SGChoice(choiceID, name, subtype, description, nextSceneID);
        this.getAttributeValue('entities').addValueForKey(choiceID, newChoice, 'choice');
    }

    // entity getters: gets requested entity
    getScene(sceneID) {
        if (!this.getAttributeValue('entities').doesContainKey(sceneID))
            throw new Error("scene to be fetched does not exist");
    
        let entityObject = this.getAttributeValue('entities').getValueObjectForKey(sceneID);

        if (entityObject.valueType !== 'scene')
            throw new Error("scene ID sent doesn't correspond to a SGScene object");

        return entityObject.value;
    }

    // returns the corresponding choice for the given id
    getChoice(choiceID) {
        if (!this.getAttributeValue('entities').doesContainKey(choiceID))
            throw new Error("choice to be fetched does not exist");
    
        let entityObject = this.getAttributeValue('entities').getValueObjectForKey(choiceID);

        if (entityObject.valueType !== 'choice')
            throw new Error("choice ID sent doesn't correspond to a SGChoice object");

        return entityObject.value;
    }
}
