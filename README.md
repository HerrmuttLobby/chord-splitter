HERMMUTT LOBBY's Chord Splitter JS 0.6

Description :
-------------
The Chord Splitter is a max4live tool created to split and sort a chord played on a keyboard into indexed note that can be used somewhere else in your track.

This is some sort of midi "counterpoint" machine ( https://en.wikipedia.org/wiki/Counterpoint ).


Usage :
-------
Check out the demo and play some chords on your keyboard.

--

Use the sender on a midi listening track (midi comming either from midi clip or from external midi device).
Put the receiver on any other midi track folowed by instruments, the receiver is intended to be used as a source of notes.
Activate on each receiver a subset of index.

Play some chords on the splitter track and change some notes without changing the whole chord.

Adding, or removing the root note (lower) has a maximal effect by moving all the notes index up or down by 1. 

Listen to how the chords is rearenged between the receivers.

Todo :
------
* use a better sorting algorithm (at least a better median choice than the first of the tuple to sort)
* add possibility to sort backward 
* add messages to toggle the sorting style and the output method
* update the usage section
* update the description
* add a button to choose a send & receive channel

Changelog :
-----------
0.6 :
* the note on is sent only once for each note until its index changes

0.5 :
* adding the Max4Live wrapper (sender and receiver)
* extensively comment the whole js code
* various bugfix

0.4 :
* bugfix

0.3 :
* bugfix

0.2 : 
* Add support for list message

0.1 :
* Initial untested release