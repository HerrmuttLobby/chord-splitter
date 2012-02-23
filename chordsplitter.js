/* Herrmutt Lobby • Chord Splitter JS 0.5 */
/* (c) Herrmutt Lobby 2012 • herrmuttlobby.com */
/* This software is distributed under a  */
/* INPUT : list message starting with note then a note number and velocity ( note noteNbr velocity ) or "reset" message to reset the chord */
/* OUTPUT : quick series of ordered note tuples ( [index, noteNbr, velocity, nbrOfNoteInTheChord] ) */
/* MADE TO BE USED WITHIN the JS object of MAX4LIVE or MAX/MSP or in PureData with the jj object of the PDJ external (http://www.le-son666.com/software/pdj/) */

/* CONFIG (should be done with message through an inlet */

groupSend = false; // choose between pushing note once by once through the outlet, or all in a big tuple
debug = false; // put in debug mode

/* CODE */

quicksort = function(input){ /* quick sort function */
  if(input.length <= 1)
  {
    return input;
  }else
  {
    var pivot = input.splice(0, 1);
    var less = [];
    var greater = [];
    var output = [];
    
    for (i = 0; i < input.length; i++)
    {
      x = input[i];
      
      if (x[0] <= pivot[0][0])
      {
        less.push(x);
      }else{
        greater.push(x);
      }
    }
    
    return output.concat(quicksort(less), pivot, quicksort(greater));
  }
}

var splitter = new Object;

splitter.groupSend = groupSend;
splitter.debug = debug;
splitter.chord = [];
splitter.addStatus = false;
splitter.outChord = [];

//*NOTE IN*//
//* When a note is received we check if the note is a note on or a note off and route them accordingly. *//
splitter.newNote = function(note)
{
  if(splitter.debug == true)
  {
    post("newnote " + note); 
  }

  if(note[1] === 0)
  {
    this.delNote(note);
  }else
  {
    this.addNote(note);
  }
}

//*NOTE ON*//
//* When a note on (vel not equal to 0) is received, the note is added to the buffer, then the buffer is sorted and sent to output *//
splitter.addNote = function(note){ /* add a note to the chord */
  this.addStatus = true;
  this.chord.push(note);
  this.chord = quicksort(this.chord);

  this.output42();
}

//*NOTE OFF*//
//* When a note with a velocity of 0 (note off) is received, the corresponding note on is removed from the buffer and the note off is send with the channel number of the corresponding note on, then the buffer is sent to output *//
splitter.delNote = function(note){ 
  this.addStatus = false;
  
  for (i = 0; i < this.chord.length; i++)
  {
    if(this.chord[i][0] === note[0])
    {
      outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
      this.chord.splice(i, 1);
    }
  }
 
  this.output42();
}

//*RESET*//
//* On a reset message a note off is sent to the output and the buffer is cleared. *//
splitter.reset = function() 
{
  for (i = 0; i< this.chord.length; i++)
  {
    outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
  }
  this.chord = [];
}

//*OUTPUT*//
//* When we need to send the whole buffer (after a note on or off) we trig this output function *//
splitter.output42 = function(){
  this.outChord = []; //init the big tuple wich will be sent if we asked for
  
  for (i = 0; i < this.chord.length; i++){
    
    if(this.chord[i][3] != i+1) // if the note channel has been shifted from previous position
    {
      outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]); // send note off
      this.chord[i][3] = i+1; // change the channel number
    }
    
    if(splitter.groupSend == false){ // send note on
      outlet(0, [this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
    }
    else{ //populate the big tuple
      this.outChord.push([this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
    }
  }
  
  if(splitter.groupSend == true){ /* Sending the big tuple if asked for */
    outlet(0, outChord);
    outlet(1, this.chord.length);
  }
}

/* MAIN */

inlets = 1; // number of inlets
outlets = 2; // number of outlets

function note(note, vel)
{
  splitter.newNote([note, vel, false]);
}

function list(info, note, val)
{
  splitter.newNote([note, vel, false]);
}

function reset()
{
  splitter.reset();
}