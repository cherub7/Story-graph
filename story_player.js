
class SGPlayer {
    constructor(story) {
        this.story = story;
        this.currentSceneID = 'start';
        
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
        
        document.getElementById('scene_desc').innerHTML = scene.getAttributeValue('description');

        let choicesList = '';
        let choiceIds = scene.getChoiceIDs();

        if (choiceIds.length == 0) {
            choicesList += '\t<li><a href="javascript:player.stop();">...</a></li>\n';
        }

        choiceIds.forEach(choiceId => {
            const choice = story.getChoice(choiceId);
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
}

player = new SGPlayer(story);
