// TODO: 
// 1. make all these props private (ES6)

/**************************************************
 * Value: value
 **************************************************/

class Value {
    constructor(value, type) {
        if (typeof(value) != type)
            throw new Error("value of wrong type passed");
        this.value = value;
        this.valueType = type;
    }
}

/**************************************************
 * Entity: An object in the story
 **************************************************/

class Entity {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.description = "No description";
        this.attributes = {};
        this.entityType = type;
    }

    setDescription(description) {
        this.description = description;
    }

    addAttribute(name, value, valueType) {
        if (Object.keys(this.attributes).includes(name))
            throw new Error("multiple attributes with the same name are being created");
        
        let attributeValue = new Value(value, valueType);
        this.attributes[name] = attributeValue;
    }

    editAttribute(name, value, valueType) {
        if (!(Object.keys(this.attributes).includes(name)))
            throw new Error("attribute to be edited does not exist");
        
        let attributeValue = new Value(value, valueType);
        this.attributes[name] = attributeValue;
    }

    removeAttribute(name) {
        if (!(Object.keys(this.attributes).includes(name)))
            throw new Error("attribute to be deleted does not exist");

        delete this.attributes[name];
    }
}

class Item extends Entity {
    constructor(id, name) {
        super(id, name, 'item');
    }
}

class Location extends Entity {
    constructor(id, name) {
        super(id, name, 'location');
    }
}

class Character extends Entity {
    constructor(id, name) {
        super(id, name, 'character');
    }
}

/**************************************************
 * Effect: a change in attribute of an entity
 **************************************************/

class Effect extends Entity {
    constructor(id, name, entity, attributeName, newValue, newType) {
        super(id, name, 'effect');
        this.entity = entity;
        this.attributeName = attributeName;
        this.newValue = newValue;
        this.newType = newType; 
    }

    perform() {
        this.entity.editAttribute(this.attributeName, this.newValue, this.newType);
    }
}

/***************************************************
 * Choice: an option with consequences
 **************************************************/

class Choice extends Entity {
    constructor(id, name, description, nextSceneID) {
        super(id, name, 'choice');
        this.setDescription(description);
        this.nextSceneID = nextSceneID;
        this.onSelectionEffects = [];
        this.onRejectionEffects = [];
    }

    addSelectionEffect(entity, attributeName, newValue, newType) {
        let effect = new Effect(entity, attributeName, newValue, newType);
        this.onSelectionEffects.push(effect);
    }

    addRejectionEffect(entity, attributeName, newValue, newType) {
        let effect = new Effect(entity, attributeName, newValue, newType);
        this.onRejectionEffects.push(effect);
    }
}

/**************************************************
 * Scene: A decision node in the story
 **************************************************/

class Scene extends Entity {
    constructor(id, name) {
        super(id, name, 'scene');
        this.choices = {};
        this.onEntryEffects = [];
        this.onExitEffects = [];
    }

    addChoice(choice) {
        if (Object.keys(this.choices).includes(choice.id))
            throw new Error("multiple choices with the same name are being created");
    
        this.choices[choice.id] = choice;
    }

    editChoice(id, name, description, nextSceneID) {
        if (!(Object.keys(this.choices).includes(id)))
            throw new Error("choice to be edited does not exist");
    
        let choice = new Choice(id, name, description, nextSceneID);
        this.choices[id] = choice;
    }

    removeChoice(id) {
        if (!(Object.keys(this.choices).includes(id)))
            throw new Error("choice to be deleted does not exist");
    
        delete this.choices[id]
    }

    // performs all the entry effects
    performEntryEffects() {
        for (const effect in this.onEntryEffects)
            effect.perform();
    }

    // performs all the exit effects
    performExitEffects() {
        for (const effect in this.onExitEffects)
            effect.perform();
    }

    // performs all the effects on  
    performOnChoiceSelectionEffects(selectedChoiceId) {
        Object.keys(this.choices).forEach(choiceId => {
            if (choiceId == selectedChoiceId)
                this.choices[choiceId].onSelectionEffects.forEach(effect => { effect.perform(); });
            else
                this.choices[choiceId].onRejectionEffects.forEach(effect => { effect.perform(); });
        });
    }

    // returns the corresponding choice for the given id
    getChoice(id) {
        if (!(Object.keys(this.choices).includes(id)))
            throw new Error("choice to be fetched does not exist");
    
        return this.choices[id];
    }

    // returns an array of ids of all the choices of a particular scene
    getChoiceIds() {
        return Object.keys(this.choices);
    }

    addEntryEffect(entity, attributeName, newValue, newType) {
        let effect = new Effect(entity, attributeName, newValue, newType);
        this.onEntryEffects.push(effect);
    }

    addExitEffect(entity, attributeName, newValue, newType) {
        let effect = new Effect(entity, attributeName, newValue, newType);
        this.onExitEffects.push(effect);
    }
}

/**************************************************
 * Scene: A decision node in the story
 **************************************************/

class Story extends Entity {
    constructor(id, name) {
        super(id, name, 'story');
        this.startSceneID = 'start';
        this.scenes = {};
        this.characters = [];
        this.locations = [];
    }

    addScene(scene) {
        if (Object.keys(this.scenes).includes(scene.id))
            throw new Error("multiple scenes with the same name are being stored");
    
        this.scenes[scene.id] = scene;
    }

    editChoice(id, name, description, nextSceneID) {
        if (!(Object.keys(this.scenes).includes(id)))
            throw new Error("scene to be edited does not exist");
    
        let scene = new Scene(id, name, description, nextSceneID);
        this.scenes[id] = scene;
    }

    removeChoice(id) {
        if (!(Object.keys(this.scene).includes(id)))
            throw new Error("scene to be deleted does not exist");
    
        delete this.scenes[id]
    }

    // returns the corresponding scene for the given id
    getScene(id) {
        if (!(Object.keys(this.scenes).includes(id)))
            throw new Error("scene to be fetched does not exist");
    
        return this.scenes[id];
    }
}