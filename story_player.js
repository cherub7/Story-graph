
class Player {
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
        document.getElementById('scene_desc').innerHTML = scene.description;
        
        scene.performEntryEffects();

        let choicesList = '';
        let choiceIds = scene.getChoiceIds();

        if (choiceIds.length == 0) {
            choicesList += '\t<li><a href="javascript:player.stop();">...</a></li>\n';
        }

        choiceIds.forEach(choiceId => {
            const choice = scene.getChoice(choiceId);
            choicesList += `\t<li><a href="javascript:player.select('${choiceId}');">${choice.description}</a></li>\n`;
        });

        document.getElementById('choices_list').innerHTML = choicesList;
        this.currentSceneID = sceneId;
    }

    select(choiceId, isRedo) {
        let scene = this.story.getScene(this.currentSceneID);

        scene.performOnChoiceSelectionEffects(choiceId);
        scene.performExitEffects();

        let record = {
            sceneId: this.currentSceneID,
            choiceId: choiceId,
        };

        this.undoStack.push(record);
        if (isRedo !== true) {
            this.redoStack = [];
        }

        let choice = scene.getChoice(choiceId);

        if (choice.nextSceneID)
            this.play(choice.nextSceneID);
        else
            this.stop();
    }

    undo() {
        if (this.undoStack.length > 0) {
            // undo current scene's entry effects
            let scene = this.story.getScene(this.currentSceneID);
            scene.undoEntryEffects();

            // pull the history record
            let record = this.undoStack.pop();

            // push to redo stack
            this.redoStack.push(record);

            // undo all previous effects
            let prevScene = this.story.getScene(record.sceneId);
            prevScene.undoAllEffects(record.choiceId);

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

player = new Player(story);
