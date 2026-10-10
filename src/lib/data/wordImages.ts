// Pictures for the word flashcards, by word key (the same key as `JourneyWord.key`). The value is the file name in
// static/words/ without its extension. A word without an entry gets a flashcard without a picture.
// To add one: drop `<name>.webp` (about 720×720) into static/words/ and add the key here.
export const WORD_IMAGES: Record<string, string> = {
  kartavya: 'duty', // Arjuna firing from the chariot
  dhananjaya: 'arjuna', // Arjuna aiming at the fish
  tyagkar: 'abandon', // Arjuna walking away from his dropped bow and crown
  palankaro: 'perform', // Krishna beside Arjuna as he draws his bow
  // The same pictures serve Medium's Sanskrit words for the same ideas
  karmani: 'duty',
  tyaktva: 'abandon',
  kuru: 'perform'
};
