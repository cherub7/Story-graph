
class Player {
    constructor(story) {
        this.story = story;
        this.currentSceneID = 'start';
        this.undoStack = [];

        this.renderScene(this.currentSceneID);
    }

    renderScene(sceneId) {
        const scene = this.story.getScene(sceneId);
        document.getElementById('scene_desc').innerText = scene.description;
        
        scene.performEntryEffects();

        let choicesList = '';
        let choiceIds = scene.getChoiceIds();

        if (choiceIds.length == 0) {
            choicesList += '\t<li><a href="javascript:player.stop();">...</a></li>\n';
        }

        choiceIds.forEach(choiceId => {
            const choice = scene.getChoice(choiceId);
            choicesList += `\t<li><a href="javascript:player.selectChoice('${choiceId}');">${choice.description}</a></li>\n`;
        });

        document.getElementById('choices_list').innerHTML = choicesList;
        this.currentSceneID = sceneId;
    }

    selectChoice(choiceId) {
        let scene = this.story.scenes[this.currentSceneID];

        scene.performOnChoiceSelectionEffects(choiceId);
        scene.performExitEffects();

        this.undoStack.push(this.currentSceneID);

        let choice = scene.getChoice(choiceId);

        if (choice.nextSceneID)
            this.renderScene(choice.nextSceneID);
        else
            this.stop();
    }

    stop() {
        document.getElementById('scene_desc').innerText = 'THE END';
        document.getElementById('choices_list').innerHTML = '';
    }
}

player = new Player(story);