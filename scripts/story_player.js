/************************************************
 * Required divs on page these are the components 
 * whose content change as story proceeds.
 * 
 * 1. undo_ref
 * 2. redo_ref
 * 3. scene_desc
 * 4. choices_list
 * 5. scene_name (TODO)
 ************************************************/

class SGPlayer {
    constructor(story) {
        this.story = story;
        this.currentSceneID = story.getStartSceneID();
        
        this.undoStack = [];
        this.redoStack = []
        
        this.play(this.currentSceneID);
    }

    play(sceneId) {
        // updating undo and redo count
        document.getElementById('undo_ref').innerHTML = `undo(${this.undoStack.length})`;
        document.getElementById('redo_ref').innerHTML = `redo(${this.redoStack.length})`;

        const scene = this.story.getScene(sceneId);
        scene.performEntryEffects(this.story);

        document.getElementById('scene_name').innerHTML = this.processString(scene.getAttributeValue('name'));
        document.getElementById('scene_desc').innerHTML = this.processString(scene.getAttributeValue('description'));

        let choicesList = '';
        let choiceIds = scene.getChoiceIDs();

        if (choiceIds.length == 0) {
            choicesList += '\t<li><a href="javascript:player.stop();">...</a></li>\n';
        }

        choiceIds.forEach(choiceId => {
            const choice = this.story.getChoice(choiceId);
            choicesList += `\t<li><a href="javascript:player.select('${choiceId}');">${choice.getAttributeValue('description')}</a></li>\n`;
        });

        document.getElementById('choices_list').innerHTML = choicesList;
        this.currentSceneID = sceneId;
    }

    select(choiceId, isRedo) {
        let scene = this.story.getScene(this.currentSceneID);

        scene.performOnChoiceSelectionEffects(this.story, choiceId);
        scene.performExitEffects(this.story);

        let record = {
            sceneId: this.currentSceneID,
            choiceId: choiceId,
        };

        this.undoStack.push(record);
        if (isRedo !== true) {
            this.redoStack = [];
        }

        const choice = this.story.getChoice(choiceId);

        const nextSceneID = choice.getAttributeValue('nextSceneID');
        
        if (nextSceneID)
            this.play(nextSceneID);
        else
            this.stop();
    }

    undo() {
        if (this.undoStack.length > 0) {
            // undo current scene's entry effects
            let scene = this.story.getScene(this.currentSceneID);
            scene.undoEntryEffects(this.story);

            // pull the history record
            let record = this.undoStack.pop();

            // push to redo stack
            this.redoStack.push(record);

            // undo all previous effects
            let prevScene = this.story.getScene(record.sceneId);
            prevScene.undoAllEffects(this.story, record.choiceId);

            this.play(record.sceneId);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            // pull the history record
            let record = this.redoStack.pop();
            this.select(record.choiceId, true);
        }
    }

    reset() {
        while (this.undoStack.length > 0)
            this.undo();

        // emptying redo stack after undoing all scenes
        this.redoStack = [];
        document.getElementById('redo_ref').innerHTML = 'redo(0)';
    }

    stop() {
        document.getElementById('scene_desc').innerText = 'THE END';
        document.getElementById('choices_list').innerHTML = '';
    }

    change(story) {
        this.reset();
        this.story = story;
        let startSceneID = story.getStartSceneID();
        this.play(startSceneID);
    }

    // processes strings to replace attributes with their values
    processString(str) {
        const regex = RegExp('{attr:(.*?)}', 'g');
        let newStr = str;
        let words;

        while ((words = regex.exec(str)) !== null) {
            let word = words[0];

            // trim between str.indexOf(':') and }
            word = word.slice(word.indexOf(':')+1, -1);

            // split at .
            let ids = word.split('.');

            // todo: support wider variety of attribute value access
            // For now, we support two possibilities for now:
            // 1. attributeName (direct story attribute)
            // 2. entityID.attributeName (someother entity's attribute)
            let value = '';

            if (ids.length === 1) {
                let attributeName = ids[0];
                value = '' + this.story.getAttributeValue(attributeName);
            } else if (ids.length === 2) {
                let entityID = ids[0];
                let attributeName = ids[1];
                value = '' + this.story.getEntity(entityID).getAttributeValue(attributeName);
            }

            // replace with value
            newStr = newStr.replaceAll(words[0], value);
        }

        return newStr;
    }

    // loads story from script stored in localStorage
    load() {
        let script = localStorage.getItem('story_graph_story');
        
        if (script !== null) {
            let newStory = this.buildStory(script);
            this.change(newStory);
        }
        else {
            alert("No saved script found.");
        }
    }

    // builds the story from JSON provide
    buildStory(script) {
        // build order: ['story', 'scenes', 'choices', 'effects', 'conditions', 'attributes']
        let scriptObj = JSON.parse(script);

        // story
        let { id, name, description, startSceneID } = scriptObj['story'];
        let story = new SGStory(id, name, 'none', description);
        story.setStartSceneID(startSceneID);

        // scenes
        for (let scene of scriptObj['scenes'].values()) {
            let { id, name, description } = scene;
            story.addScene(id, name, 'none', description);
        }

        // choices
        for (let choice of scriptObj['choices'].values()) {
            let { id, name, description, fromSceneID, toSceneID } = choice;
            story.addChoice(id, name, 'none', description, fromSceneID, toSceneID);
        }

        return story;
    }
}

// initially play a demo story
player = new SGPlayer(story);
