let story = new Story('test_story', 'Mortal Choice');

// start
let scene0 = new Scene('start', 'welcome note');
scene0.setDescription(`This is a simple text story created using Story Graph.
                        Story Graph is a tool to build and your stories. 
                        It is still in development. For now enjoy this game :)`);

story.addScene(scene0);

// man before king
let scene1 = new Scene('s1', 'man before king');

scene1.setDescription(`You were a man of your word. You led a simple and an upright life.
                        The gods were pleased with you and your ways and blessed you with wealth.
                        You even found favour in the eyes of the King of your land. 

                        There was a man named Lucifer, who envied you and despised you.
                        He along with his friends framed you as partaking in a treason.
                        
                        You stand before the King in the court, trembling with fear.
                        
                        King: "Did you conspire against your own kingdom and people?"
                        Lucifer: "Yes my Lord! Where do you think he got his wealth from?"
                        King: "Quiet! Let the man speak. I'll take you for your word"
                        `);

story.addScene(scene1);

// death of an innocent
let scene2 = new Scene('s2', 'death of an innocent');

scene2.setDescription(`King: "Hang the traitor! That is my order."
                        You: "I did not partake in any tr..."
                        King: "Traitors have no place in my kingdom!"
                        
                        You died...`);

story.addScene(scene2);

// the mortal choice
let scene3 = new Scene('s3', 'the mortal choice');

scene3.setDescription(`King: "What can explain the huge wealth you acquired!"
                        Lucifer: "Exactly my lord! He must have given away secrets to our enemies in exchange for the wealth!"
                        You: "No my lord! Gods have shown mercy upon me and blessed me."
                        King: "May the gods you pray to deliver you! I have three torture cells in the underground. It is upto you to choose which cell you want to go."
                        `);

story.addScene(scene3);

// its a trap!
let scene4 = new Scene('s4', 'its a trap!');

scene4.setDescription(`You wandered aimlessly in the darkness for few minutes.
                        Oops! You landed your feet on a trap and this has set
                        a contraption into motion. A fifty ton boulder crashed on top of you.
                        
                        You Died...`);

story.addScene(scene4);

// inferno
let scene5 = new Scene('s5', 'inferno');

scene5.setDescription(`As soon as you entered the cell, the flames engulfed you.
                        Nothing but your ashes remain. Lucifer would die a happy man.
                        
                        You Died...`);

story.addScene(scene5);

// lion's den
let scene6 = new Scene('s6', 'lion\'s den');

scene6.setDescription(`You entered the cell thinking this is the end of your life...
                        You stood at the enterance afraid to take step. You waited for hours.
                        Atlast it struck you brain that a lion without food for months cannot survive.
                        You venture deep into the underground cell... You find a secret escape
                        `);

story.addScene(scene6);

// the escape
let scene7 = new Scene('s7', 'the escape');

scene7.setDescription(`You escaped the cell successfully. You pray to gods for saving you!
                        
                        To be continued...`);

story.addScene(scene7);

let choice00 = new Choice('c00', 'onward', 'A mortal choice', 's1');
scene0.addChoice(choice00);

let choice10 = new Choice('c10', 'yes', 'Yes my lord... Please forgive me!', 's2');
let choice11 = new Choice('c11', 'no', 'No my lord! I\'m innocent!', 's3');
scene1.addChoice(choice10);
scene1.addChoice(choice11);

let choice30 = new Choice('c30', 'cell 1', 'A cell filled with pits and traps. Oh! and its pitch dark...', 's4');
let choice31 = new Choice('c31', 'cell 2', 'A cell filled with flames.The flames can turn you into ashes within seconds.', 's5');
let choice32 = new Choice('c32', 'cell 3', 'A cell with a hungry lion tha hasn\'t eaten for months. it can devour your flesh...', 's6');
scene3.addChoice(choice30);
scene3.addChoice(choice31);
scene3.addChoice(choice32);

let choice60 = new Choice('c30', 'cell 1', 'Escape...', 's7');
scene6.addChoice(choice60);

