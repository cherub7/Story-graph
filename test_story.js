let story = new SGStory('test_story', 'Mortal Choice', 'None', 'test story');

// ----------(Scenes)----------

// start

story.addScene('start', 'welcome note', 'None', 
                `This is a simple text story created using <b><a href="https://github.com/cherub7/story-graph">Story Graph</a></b>.<br/>
                <b>Story Graph</b> is a tool to build and play your stories.<br/>
                It is still in development. For now enjoy this game :)<br/><br/>
                <li> BUILD and save your story using <b><a href="create_story.html">UI builder</a></b> (still in construction)<br/>
                <li> LOAD and play your <a href="javascript:player.load();">saved story</a><br/>`,
                'string');

// man before king
story.addScene('s1', 'man before king', 'None',
                `You were a man of your word. You led a simple and an upright life.<br/>
                The gods were pleased with you and your ways and blessed you with wealth.<br/>
                You even found favour in the eyes of the King of your land.<br/> 
                <br/>
                There was a man named Lucifer, who envied you and despised you.<br/>
                He along with his friends framed you as partaking in a treason.<br/>
                <br/>
                You stand before the King in the court, trembling with fear.<br/>
                <br/>
                <b>King</b>: "Did you conspire against your own kingdom and people?"<br/>
                <b>Lucifer</b>: "Yes my Lord! Where do you think he got his wealth from?"<br/>
                <b>King</b>: "Quiet! Let the man speak. I'll take you for your word"`,
                'string');

// death of an innocent
story.addScene('s2', 'death of an innocent', 'None',
                `<b>King</b>: "Hang the traitor! That is my order."<br/>
                <b>You</b>: "I did not partake in any tr..."<br/>
                <b>King</b>: "Traitors have no place in my kingdom!"<br/>
                <br/>
                You died...`,
                'string');

// the mortal choice
story.addScene('s3', 'the mortal choice', 'None',
                `<b>King</b>: "What can explain the huge wealth you acquired!"<br/>
                <b>Lucifer</b>: "Exactly my lord! He must have given away secrets to our enemies in exchange for the wealth!"<br/>
                <b>You</b>: "No my lord! Gods have shown mercy upon me and blessed me."<br/>
                <b>King</b>: "May the gods that you pray to, deliver you! I have three torture cells in the underground. 
                It is upto you to choose which cell you want to go."`,
                'string');

// its a trap!
story.addScene('s4', 'its a trap!', 'None',
                `You wandered aimlessly in the darkness for few minutes.<br/>
                Oops! You landed your feet on a trap and this has set<br/>
                a contraption into motion. A fifty ton boulder crashed on top of you.<br/>
                <br/>
                You died...`,
                'string');

// inferno
story.addScene('s5', 'inferno', 'None',
                `As soon as you entered the cell, the flames engulfed you.<br/>
                Nothing but your ashes remain. Lucifer would die a happy man.<br/>
                <br/>
                You died...`,
                'string');

// lion's den
story.addScene('s6', 'lion\'s den', 'None',
                `You entered the cell thinking this is the end of your life...<br/>
                You stood at the enterance afraid to take a step. You waited for hours.<br/>
                At last it struck your brain that a lion without food for months cannot survive.<br/>
                You venture deep into the underground cell... You found a secret passage`,
                'string');

// the escape
story.addScene('s7', 'the escape', 'None',
                `You took the secret passage. After walking for a long time you see a light in the distance.<br/>
                It's an opening! You thank gods for delivering you... But as you approach closer to the light,<br/>
                you notice a guard standing at the enterance`,
                'string');


// hunger kills!
story.addScene('s8', 'hunger kills!', 'None',
                `You run back and take comfort in the darkness of the cell<br/>
                But it didn't last long because you haven't eaten for too long<br/>
                and all this walking and running has taken its toll on you!<br/>
                <br/>
                You died...`,
                'string');

// guard
story.addScene('s9', 'guard', 'None',
                `<b>Guard</b>: Hey! What are you doing here? This passage can only be<br/>
                accessed by the royal family. GET BACK!!<br/>`,
                'string');

story.addAttribute('s9', 'pleadCount', 0, 'number');

// battle
story.addScene('s10', 'battle', 'None',
                `The guard throws a old rusty sword at you. You pick it up,<br/>
                pray to gods to protect you and charge ahead!<br/>
                <br/>
                TO BE CONTINUED...`,
                'string');

// ----------(Effects)----------

story.addEffect('eff90', 's9', 'onEntryEffects', 's9', 'pleadCount', '+', 1, 'number');

story.addEffect('eff91', 's9', 'onEntryEffects', 's9', 'description', '=', 
                `<b>Guard</b>:How many times should I say you? Go back!`,
                'string');

story.addEffect('eff92', 's9', 'onEntryEffects', 's9', 'description', '=', 
                `<b>Guard</b>:Quiet! let's settle this with a duel...`, 
                'string');

story.addEffect('eff93', 's9', 'onEntryEffects', 'c91', 'description', '=', `Let's go!`, 'string');

story.addEffect('eff94', 's9', 'onEntryEffects', 'c91', 'nextSceneID', '=', 's10', 'string');

// ----------(Conditions)----------

story.addCondition('cnd91', 'eff91', 's9', 'pleadCount', '>', 1);
story.addCondition('cnd92', 'eff92', 's9', 'pleadCount', '>=', 4);
story.addCondition('cnd93', 'eff93', 's9', 'pleadCount', '>=', 4);
story.addCondition('cnd94', 'eff94', 's9', 'pleadCount', '>=', 4);

// ----------(Choices)----------

story.addChoice('c00', 'onward', 'None', 'A Mortal Choice', 'start', 's1');

story.addChoice('c10', 'yes', 'None', 'Yes my lord... Please forgive me!', 's1', 's2');
story.addChoice('c11', 'no', 'None', 'No my lord! I\'m innocent!', 's1', 's3');

story.addChoice('c30', 'cell 1', 'None', 'A cell filled with pits and traps. Oh! and its pitch dark...', 's3', 's4');
story.addChoice('c31', 'cell 2', 'None', 'A cell filled with flames.The flames can turn you into ashes within seconds.', 's3', 's5');
story.addChoice('c32', 'cell 3', 'None',  'A cell with a hungry lion that hasn\'t eaten for months. It can devour your flesh...', 's3', 's6');

story.addChoice('c60', 'cell 1', 'None', 'Take the passage...', 's6', 's7');

story.addChoice('c70', 'run', 'None', 'RUN back into the cave!', 's7', 's8');
story.addChoice('c71', 'confront', 'None', 'confront the guard', 's7', 's9');

story.addChoice('c90', 'back', 'None', 'RUN back into the cave!', 's9', 's8');
story.addChoice('c91', 'plead', 'None', 'Plead the guard', 's9', 's9');
